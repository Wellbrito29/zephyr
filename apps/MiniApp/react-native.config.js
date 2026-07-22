// react-native.config.js — registers the `bundle-mf-remote` command that
// bundles this MF remote and uploads it to Zephyr Cloud.
const commands = require('@module-federation/metro-plugin-rnc-cli');
const { updateManifest } = require('@module-federation/metro');
const { zephyrCommandWrapper } = require('zephyr-metro-plugin');

const wrappedFuncPromise = zephyrCommandWrapper(
  commands.bundleMFRemoteCommand.func,
  commands.loadMetroConfig,
  () => {
    updateManifest(
      global.__METRO_FEDERATION_MANIFEST_PATH,
      global.__METRO_FEDERATION_CONFIG,
    );
  },
);

const zephyrCommand = {
  name: 'bundle-mf-remote',
  description:
    'Bundles a Module Federation remote, including its container entry and all exposed modules for consumption by host applications',
  func: async (...args) => {
    const wrappedFunc = await wrappedFuncPromise;
    return wrappedFunc(...args);
  },
  options: commands.bundleMFRemoteCommand.options,
};

module.exports = {
  commands: [zephyrCommand],
};
