// metro.config.js — HostApp (Module Federation host / consumer)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withZephyr } = require('zephyr-metro-plugin');
const { withModuleFederation } = require('@module-federation/metro');

// The host resolves the MiniApp remote from its Zephyr Cloud *environment* URL.
// This endpoint is STABLE (it doesn't change per deploy) and always serves the
// environment's current version — so a redeploy of MiniApp is picked up on the
// next host reload with no config change (true OTA). The `development`
// environment tracks the `ios_latest_well334` tag.
//
// Note: `zephyr:dependencies` in package.json is the production-build equivalent
// (resolved at build time); the env URL below is what a dev Metro server uses.
// Set MINI_APP_URL to override (e.g. MiniApp@http://localhost:8082/mf-manifest.json).
const zephyrMiniAppManifest =
  'https://development-miniapp-zephyr-wellbrito29-ze.zephyrcloud.app/mf-manifest.json';
const miniAppRemote =
  process.env.MINI_APP_URL ?? `MiniApp@${zephyrMiniAppManifest}`;

const config = {
  resolver: { useWatchman: false },
};

const getConfig = async () => {
  const zephyrConfig = await withZephyr()({
    name: 'HostApp',
    remotes: {
      MiniApp: miniAppRemote,
    },
    shared: {
      react: {
        singleton: true,
        eager: true,
        requiredVersion: '19.1.0',
        version: '19.1.0',
      },
      'react-native': {
        singleton: true,
        eager: true,
        requiredVersion: '0.80.0',
        version: '0.80.0',
      },
    },
    shareStrategy: 'loaded-first',
  });

  return withModuleFederation(
    mergeConfig(getDefaultConfig(__dirname), config),
    zephyrConfig,
    {
      flags: {
        unstable_patchHMRClient: true,
        unstable_patchInitializeCore: true,
        unstable_patchRuntimeRequire: true,
      },
    },
  );
};

module.exports = getConfig;
