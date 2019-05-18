const Path = require('path');
const NodeBuiltins = require('builtin-modules');
const BabelConfig = require('resistdesign-babel-config');
const {
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV,
  ENV: {
    NODE_ENV = ''
  } = {}
} = require('./Env');
const {
  getFullTargetPath,
  getRelativePath
} = require('./Path');
const WebPack = require('webpack');
const {
  getPackage
} = require('./Package');

const PROCESS = {
  env: {
    NODE_ENV: process.env && process.env.NODE_ENV,
    DEBUG: process.env && process.env.DEBUG,
    IS: {
      [NODE_ENV]: true
    }
  }
};
const DEFINITIONS = {
  'process.env.NODE_ENV': JSON.stringify(PROCESS.env.NODE_ENV),
  'process.env.DEBUG': JSON.stringify(PROCESS.env.DEBUG),
  [`process.env.IS.${NODE_ENV}`]: JSON.stringify(PROCESS.env.IS[NODE_ENV]),
  'process.env.IS': JSON.stringify(PROCESS.env.IS),
  'process.env': JSON.stringify(PROCESS.env),
  'process': JSON.stringify(PROCESS)
};
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
const lowerArg = (fn) => (arg = '') => fn(arg.toLowerCase());
const getTarget = lowerArg(
  (runtime = '') => !!RUNTIME_TARGET_MAP[runtime] ? RUNTIME_TARGET_MAP[runtime] : runtime
);
const getExternals = lowerArg(
  (runtime = '') => !!RUNTIME_EXTERNALS_MAP[runtime] ? RUNTIME_EXTERNALS_MAP[runtime] : []
);

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
   * Default: `true`
   * @param {string} config.base The relative path to *remove* from file output paths. Default: `'src'`
   * @returns {Object} The compiler config.
   * */
  getConfig: ({
                inputPaths = [],
                outputPath = '',
                runtime = DEFAULT_RUNTIME,
                moduleAliases = {},
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

        entryMap[fullPath] = inputPath;

        return entryMap;
      }, {});
    const externals = getExternals(runtime)
      .concat(NodeBuiltins)
      .reduce((externalsMap, moduleName) => {
        externalsMap[moduleName] = moduleName;

        return externalsMap;
      }, {});
    const target = getTarget(runtime);
    const {
      name: packageName = ''
    } = getPackage();

    return {
      mode: NODE_ENV === PRODUCTION_NODE_ENV ? PRODUCTION_NODE_ENV : DEVELOPMENT_NODE_ENV,
      entry,
      externals,

      output: {
        path: outputPath,
        library: [packageName, '[name]'],
        libraryTarget: 'umd',
        libraryExport: 'default',
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
        alias: moduleAliases,
        extensions: ['.js', '.jsx', '.json']
      },

      optimization: {
        minimize: !!PROCESS.env.IS[PRODUCTION_NODE_ENV]
      },

      plugins: [
        new WebPack.DefinePlugin(DEFINITIONS)
      ],

      devtool: 'source-map'
    };
  }
};
