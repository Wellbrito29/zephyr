// metro.config.js — MiniApp (Module Federation remote, deployed to Zephyr Cloud)
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withModuleFederation } = require('@module-federation/metro');
const { withZephyr } = require('zephyr-metro-plugin');

const config = {
  resolver: { useWatchman: false },
};

async function getConfig() {
  const zephyrConfig = await withZephyr()({
    name: 'MiniApp',
    filename: 'MiniApp.bundle',
    exposes: {
      './example': './src/example.tsx',
    },
    shared: {
      react: {
        singleton: true,
        eager: false,
        requiredVersion: '19.1.0',
        version: '19.1.0',
        import: false,
      },
      'react-native': {
        singleton: true,
        eager: false,
        requiredVersion: '0.80.0',
        version: '0.80.0',
        import: false,
      },
    },
    shareStrategy: 'version-first',
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
}

module.exports = getConfig();
