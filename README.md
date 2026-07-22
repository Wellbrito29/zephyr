# Zephyr × React Native × Metro — Module Federation demo

A minimal but complete React Native app integrated with **Zephyr Cloud** through
the **Metro** bundler, using Zephyr's default Cloud integration. It demonstrates
the full loop: a Module Federation **remote** deployed to Zephyr's edge, consumed
**over-the-air** at runtime by a **host** app running on an iOS simulator.

> Interview task: set up and deploy a React Native app with Zephyr via the Metro
> integration. See [`docs/how-zephyr-fits.md`](docs/how-zephyr-fits.md) for the
> write-up and [`docs/feedback.md`](docs/feedback.md) for DX/documentation feedback.

## What's inside

```
apps/
├── MiniApp/   # Module Federation REMOTE — exposes ./example, deployed to Zephyr Cloud
└── HostApp/   # Module Federation HOST   — lazy-loads the remote from Zephyr at runtime
docs/
├── how-zephyr-fits.md   # how Zephyr sits in the RN/Metro pipeline
└── feedback.md          # developer-experience & docs feedback
```

- **MiniApp** exposes `./example` and is bundled + uploaded to Zephyr with
  `react-native bundle-mf-remote`.
- **HostApp** does `React.lazy(() => import('MiniApp/example'))` and resolves the
  remote from the Zephyr edge (`apps/HostApp/metro.config.js`).
- `react` / `react-native` are `shared` singletons across both.

## Stack

| | Version |
| --- | --- |
| React Native | 0.80.0 |
| React | 19.1.0 |
| `zephyr-metro-plugin` | 1.1.2 |
| `@module-federation/*` | 0.21.6 |

## Prerequisites

- Node ≥ 18, npm ≥ 10
- Xcode + an iOS simulator (macOS)
- A [Zephyr Cloud](https://app.zephyr-cloud.io) account (log in with GitHub)
- A git repo with a remote origin — Zephyr derives the app identity from it

## Deploy the remote (MiniApp → Zephyr Cloud)

```bash
cd apps/MiniApp
npm install
npx react-native bundle-mf-remote --platform ios --dev false
```

First run opens a browser to authenticate with Zephyr. On success it uploads the
bundle and prints the live edge URL, e.g.:

```
(6/6 assets uploaded in 399ms, 880.74kb)
Deployed to Zephyr's edge in 436ms.
https://…miniapp-zephyr-….zephyrcloud.app
```

## Run the host (consumes the remote from Zephyr)

```bash
cd apps/HostApp
npm install
bundle exec pod install --project-directory=ios   # or: pod install
npx react-native run-ios
```

The host boots on the simulator and loads the MiniApp card from Zephyr's edge at
runtime. Point it at a local Metro server instead by setting
`MINI_APP_URL="MiniApp@http://localhost:8082/mf-manifest.json"`.

## Try the OTA loop

The host points at the MiniApp **`development` environment's stable edge URL**
(`apps/HostApp/metro.config.js`), which tracks the latest iOS deploy. So the
config never changes — updating the remote is a three-step loop:

```bash
# 1. edit apps/MiniApp/src/example.tsx (change the text)

# 2. redeploy the remote (the environment auto-updates to this version)
cd apps/MiniApp
npx react-native bundle-mf-remote --platform ios --dev false

# 3. reload the app on the simulator (Cmd+R) → the card shows the new version
```

No URL swap, no native rebuild — the JS remote is delivered over-the-air by
Zephyr Cloud.

**Setup done once (in the Zephyr dashboard):** create an environment named
`development` for the MiniApp application with channel `Tag` →
`ios_latest_well334`, marked as the default environment. `zephyr:dependencies`
in `apps/HostApp/package.json` is the production-build equivalent (resolved at
build time). See `docs/feedback.md`, finding #7, for why this step is needed.

## Notes

- Uses only Zephyr's **default Cloud integration** — no custom deployment target.
- The iOS build applies a small `fmt`/`consteval` Podfile workaround for recent
  Xcode toolchains (see `apps/HostApp/ios/Podfile`).
