// metro.config.js — HostApp (Module Federation host / consumer)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withZephyr } = require('zephyr-metro-plugin');
const { withModuleFederation } = require('@module-federation/metro');

// The host resolves the MiniApp remote from Zephyr Cloud by default (true OTA:
// the bundle is fetched from Zephyr's edge at runtime). Set MINI_APP_URL to a
// local Metro server (e.g. MiniApp@http://localhost:8082/mf-manifest.json) for
// offline development.
const zephyrMiniAppManifest =
  'https://well334-1-miniapp-zephyr-wellbrito29-a960f67b8-ze.zephyrcloud.app/mf-manifest.json';
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
