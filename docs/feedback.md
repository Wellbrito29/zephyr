# Feedback — developer experience & docs

Context: fresh setup on macOS (Apple Silicon), React Native 0.80.0, Metro,
targeting an iOS simulator. Bare RN Community CLI (not Expo). Below is honest
feedback from doing the task end-to-end.

## What worked well

- **The plugin integration itself is clean.** `withZephyr()` + `withModuleFederation()`
  in `metro.config.js` and the `bundle-mf-remote` command in `react-native.config.js`
  are copy-paste from the docs and worked as written.
- **Auth is painless.** First deploy printed an auth URL, browser login (GitHub),
  and the CLI picked up the token automatically — even in a non-interactive shell.
- **Deploy is genuinely fast and the output is great.** `6/6 assets uploaded in
  399ms`, `Deployed to Zephyr's edge in 436ms`, plus a live URL. That immediate
  feedback loop is excellent.
- **Once versions were aligned, everything worked on the first try** — remote
  deployed, manifest served over HTTPS from the edge, host consumed it.

## Friction / papercuts

### 1. Dependency version conflict is a hard blocker out of the box
The install command in the Metro guide:
```
npm add --dev zephyr-metro-plugin @module-federation/metro @module-federation/metro-plugin-rnc-cli @module-federation/runtime
```
With today's npm registry this resolves `@module-federation/*` to **2.8.0**
(latest), but `zephyr-metro-plugin@1.1.2` declares
`peer @module-federation/metro@^0.21.6`. Result: `ERESOLVE` — install fails.

I had to pin the whole MF trio to `0.21.6` to match the peer range:
```
npm add zephyr-metro-plugin@1.1.2 \
  @module-federation/metro@0.21.6 \
  @module-federation/metro-plugin-rnc-cli@0.21.6 \
  @module-federation/runtime@0.21.6
```
**Suggestion:** pin the versions in the docs (or bump `zephyr-metro-plugin`'s
peer range), otherwise the very first `npm install` in the guide breaks.

### 2. `create-zephyr-apps` / `with-zephyr` require a TTY with no fallback
Both `npx create-zephyr-apps` and `npx with-zephyr` exit with
`Please run this command in a TTY terminal.` in any non-interactive shell (CI,
scripts, agent tooling). There are no flags to run headless (name, template,
target passed as args). **Suggestion:** support non-interactive flags so these
can run in CI / automation.

### 3. The git-remote requirement isn't stated where it bites
The app identity (`miniapp.zephyr.<org>`) is derived from the **git remote
origin**. But the Metro guide never says "you need a git repo with a remote
before you can deploy." The Prerequisites page only says *"Git is required for
some workflows."* A first-timer hits this only when the deploy fails.
**Suggestion:** call this out explicitly in the Metro guide's prerequisites.

### 4. Prerequisite `ruby >= 3.3.2` looks overstated
The guide lists `ruby >= 3.3.2`. On this machine iOS `pod install` (74 pods, RN
0.80) completed fine on the **system ruby 2.6.10** — the RN Gemfile itself only
requires `>= 2.6.10`. The stricter requirement made me think I'd need to install
a new ruby before starting. **Suggestion:** clarify when 3.3.2 is actually
needed (maybe a specific flow), or relax it.

### 5. The host side needs a runnable example
The guide shows host/remote `metro.config.js` but not:
- a runnable host `App.tsx` that actually consumes the remote
  (`React.lazy(() => import('MiniApp/example'))`), and
- the **async bootstrap boundary** (`index.js -> import('./bootstrap')`) that
  Module Federation needs so `shared: { eager: true }` deps initialize before
  app code runs.
I had to add both. **Suggestion:** include a minimal end-to-end host in the
tutorial, not just config snippets.

### 6. From "deployed" to "consumed via Zephyr" is a gap
After the remote deploys you get a versioned edge URL, but how to wire the host
to consume it *through Zephyr* (tags/environments, `zephyr:dependencies`) isn't
obvious for a first deploy — no default environment/tag is clearly surfaced.
I ended up pointing the host at the returned edge manifest URL directly to prove
OTA. **Suggestion:** show the "deploy remote → reference it from the host by
tag" round-trip explicitly.

## One-line summary

The core product is impressive — sub-second edge deploys and a clean Metro
plugin — but the **first-run path is brittle**: an out-of-the-box `ERESOLVE`, a
TTY-only scaffolder, and an unstated git-remote requirement are the three things
most likely to stop a new user before they see the (excellent) deploy.
