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

module.exports = {
  RUNTIMES,
  DEFAULT_RUNTIME,
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
        entryMap[inputPath] = [
          Path.join(Path.dirname(require.resolve('source-map-support')), 'register'),
          inputPath
        ];
        return entryMap;
      }, {});
    const externals = getExternals(runtime)
      .concat(NodeBuiltins)
      .reduce((externalsMap, moduleName) => {
        const relPath = getRelativePath(moduleName, base);

        externalsMap[relPath] = moduleName;
        return externalsMap;
      }, {});
    const target = getTarget(runtime);

    return {
      mode: NODE_ENV === DEFAULT_NODE_ENV ? DEFAULT_NODE_ENV : 'development',
      entry,
      externals,

      output: {
        path: outputPath,
        libraryTarget: 'commonjs',
        libraryExport: !!library ? inputPaths : undefined,
        publicPath: '/',
        filename: ({chunk: {name} = {}} = {}) => {
          const relPath = getRelativePath(
            name,
            !!base ? getFullTargetPath(base) : undefined
          );
          const dirname = Path.dirname(relPath);
          const extname = Path.extname(relPath);
          const basename = Path.basename(relPath, extname);
          const fullPath = Path.join(dirname, basename);

          return `${fullPath}.js`;
        }
      },

      target,

      module: {
        rules: [
          {
            test: /\.jsx$/,
            exclude: [
              /node_modules\/babel-/m,
              /node_modules\/core-js\//m,
              /node_modules\/regenerator-runtime\//m,
              // Windows
              /node_modules\\babel-/m,
              /node_modules\\core-js\\/m,
              /node_modules\\regenerator-runtime\\/m
            ],
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
