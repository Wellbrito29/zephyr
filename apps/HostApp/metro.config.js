// metro.config.js — HostApp (Module Federation host / consumer)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withZephyr } = require('zephyr-metro-plugin');
const { withModuleFederation } = require('@module-federation/metro');

// In local dev the host loads MiniApp from its Metro server on this port.
// In production Zephyr resolves the remote to the deployed version (see
// `zephyr:dependencies` in package.json).
const miniAppPort = process.env.MINI_APP_PORT ?? '8082';

const config = {
  resolver: { useWatchman: false },
};

const getConfig = async () => {
  const zephyrConfig = await withZephyr()({
    name: 'HostApp',
    remotes: {
      MiniApp: `MiniApp@http://localhost:${miniAppPort}/mf-manifest.json`,
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
