# How Zephyr fits into the React Native (Metro) build pipeline

## TL;DR

Zephyr does **not** replace Metro. Metro still bundles your JavaScript exactly
as before. Zephyr is a **plugin that hooks into the Metro build and then takes
over distribution**: it uploads the produced bundle + the Module Federation
manifest to Zephyr Cloud, versions it, and serves it over-the-air (OTA) from an
edge CDN. Combined with Module Federation, that lets a host app load remote
pieces from Zephyr at runtime — so you can ship an update to a feature without
rebuilding or resubmitting the native app to the stores.

## Where it sits

```
your source
    │
    ▼
Metro  ──────────────►  JS bundle + mf-manifest.json
(bundler, unchanged)          │
                              ▼
                zephyr-metro-plugin (withZephyr)
                (intercepts the build output)
                              │
                              ▼
                      Zephyr Cloud
              (upload → version → edge CDN → OTA)
                              │
                              ▼
        host app fetches the remote at runtime
```

- **Metro** = the bundler. `withModuleFederation` teaches it to emit a remote
  container + a `mf-manifest.json`.
- **`zephyr-metro-plugin` (`withZephyr`)** = the deployment hook. On build it
  uploads the output to Zephyr Cloud instead of leaving it on disk.
- **Zephyr Cloud** = hosting + versioning + environments + instant rollback +
  edge distribution. This is the "default Cloud integration" — no AWS/Cloudflare
  wiring required.

## The two roles (Module Federation)

This repo is a minimal but complete example with both sides:

| App | Role | What it does |
| --- | --- | --- |
| **MiniApp** | MF **remote** | Exposes `./example`. Bundled with `bundle-mf-remote` and **deployed to Zephyr Cloud**. |
| **HostApp** | MF **host** | `React.lazy(() => import('MiniApp/example'))` — loads the remote **from Zephyr's edge at runtime**. |

`react` and `react-native` are declared `shared` singletons so the host and the
remote use a single copy (otherwise duplicate React breaks hooks/context).

## The actual deploy

```bash
# in apps/MiniApp
npx react-native bundle-mf-remote --platform ios --dev false
```

First run opens a browser to authenticate against Zephyr Cloud (personal token).
Then Metro bundles the remote and the plugin uploads it:

```
✓ You are now logged in to Zephyr Cloud
Uploaded local snapshot in 253ms
(6/6 assets uploaded in 399ms, 880.74kb)
Deployed to Zephyr's edge in 436ms.
https://well334-1-miniapp-zephyr-wellbrito29-….zephyrcloud.app
```

The app identity (`miniapp.zephyr.wellbrito29`) is derived from the **git remote
origin** + the MF container name — which is why a git repo with a remote is a
prerequisite.

## How you'd use it in a real project

- **Ship the host once.** The native shell (host) goes through the app store a
  single time. Feature teams own **remotes** that they deploy independently to
  Zephyr.
- **OTA feature updates.** Change a remote → `bundle-mf-remote` → it's live on
  Zephyr's edge. Users pick it up at runtime; no store review, no native rebuild
  (JS-only — native changes still require a real build).
- **Environments & promotion.** Tag deploys per environment (dev → staging →
  production) and promote a known-good version between them.
- **Instant rollback.** If a remote regresses, roll back to the previous version
  from the dashboard without touching the host.
- **Micro-frontends at scale.** Multiple teams compose one app at runtime instead
  of coordinating one monolithic release train.

### Relation to CodePush

Conceptually the same family as Microsoft CodePush (OTA JS updates), but the unit
of delivery is different: CodePush replaces the **whole** JS bundle, whereas
Zephyr updates **individual Module Federation remotes** and versions each one
independently — and it isn't RN-only (it also covers web bundlers).
