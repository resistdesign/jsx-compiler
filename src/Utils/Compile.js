const Path = require('path');
const NodeBuiltins = require('builtin-modules');
const BabelConfig = require('resistdesign-babel-config');
const {
  DEFAULT_NODE_ENV,
  ENV: {
    NODE_ENV = ''
  } = {}
} = require('./Env');
const {
  getFullTargetPath,
  getRelativePath
} = require('./Path');

const RUNTIMES = {
  ASYNC_NODE: 'async-node',
  NODE: 'node',
  NODE_WEBKIT: 'node-webkit',
  AWS_LAMBDA: 'aws-lambda',
  ELECTRON_MAIN: 'electron-main',
  ELECTRON_RENDERER: 'electron-renderer',
  WEB: 'web',
  WEBWORKER: 'webworker'
};
const DEFAULT_RUNTIME = RUNTIMES.NODE;
const RUNTIME_TARGET_MAP = {
  [RUNTIMES.AWS_LAMBDA]: 'node'
};
const RUNTIME_EXTERNALS_MAP = {
  [RUNTIMES.AWS_LAMBDA]: ['aws-sdk']
};
const getTarget = (runtime = '') => RUNTIME_TARGET_MAP[runtime] || runtime;
const getExternals = (runtime = '') => RUNTIME_EXTERNALS_MAP[runtime] || [];

/**
 * Compile tools.
 * */
module.exports = {
  /**
   * Runtime options.
   * @type {Object.<string>}
   * */
  RUNTIMES,
  /**
   * The default runtime.
   * @type {string}
   * */
  DEFAULT_RUNTIME,
  /**
   * Get the WebPack compiler config.
   * @param {Object} config The input configuration options.
   * @param {string[]} config.inputPaths The list of absolute paths to input files.
   * @param {string} config.outputPath The absolute path to the output directory.
   * @param {string} config.runtime The runtime files will be run under.
   * @param {Object.<string>} config.moduleAliases A map of modules to be aliased during compilation.
   * @param {boolean} config.library A flag designating whether or not to compile as a library as opposed to an app.
   * Default: `true`
   * @param {string} config.base The relative path to *remove* from file output paths. Default: `'src'`
   * @returns {Object} The compiler config.
   * */
  getConfig: ({
                inputPaths = [],
                outputPath = '',
                runtime = DEFAULT_RUNTIME,
                moduleAliases = {},
                library = true,
                base = 'src'
              } = {}) => {
    const entry = inputPaths
      .reduce((entryMap, inputPath) => {
        const relPath = getRelativePath(
          inputPath,
          !!base ? getFullTargetPath(base) : undefined
        );
        const dirname = Path.dirname(relPath);
        const extname = Path.extname(relPath);
        const basename = Path.basename(relPath, extname);
        const fullPath = Path.join(dirname, basename);

        entryMap[fullPath] = [
          Path.join(Path.dirname(require.resolve('source-map-support')), 'register'),
          inputPath
        ];

        return entryMap;
      }, {});
    const externals = getExternals(runtime)
      .concat(NodeBuiltins)
      .reduce((externalsMap, moduleName) => {
        externalsMap[moduleName] = moduleName;

        return externalsMap;
      }, {});
    const target = getTarget(runtime);

    return {
      mode: NODE_ENV === DEFAULT_NODE_ENV ? DEFAULT_NODE_ENV : 'development',
      entry,
      externals,

      output: {
        path: outputPath,
        libraryTarget: !!library ? 'commonjs2' : '',
        libraryExport: !!library ? 'default' : undefined,
        publicPath: '/'
      },

      target,

      module: {
        rules: [
          {
            test: /\.jsx$/,
            exclude: [],
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: BabelConfig
              }
            ]
          }
        ]
      },

      resolve: {
        alias: moduleAliases
      },

      devtool: 'source-map'
    };
  }
};
