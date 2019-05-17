#!/usr/bin/env node

const Glob = require('glob');
const {
  RUNTIMES,
  DEFAULT_RUNTIME,
  getConfig
} = require('./Utils/Compile');
const {getFullTargetPath} = require('./Utils/Path');
const program = require('commander');
const WebPack = require('webpack');

const RUNTIME_LIST = Object
  .keys(RUNTIMES)
  .map(k => RUNTIMES[k]);

/**
 * The Compile program.
 * @type {Object}
 * */
program
  .option('-r, --runtime', `The runtime to target. Options: ${RUNTIME_LIST.join(', ')}. Default: ${DEFAULT_RUNTIME}.`)
  .option('-l, --library', 'Compile input files as library modules. Default: true.')
  .option('-b, --base', 'The base directory for JSX files. Default: src.')
  .parse(process.argv);

const {
  base = 'src',
  runtime = DEFAULT_RUNTIME,
  library = true
} = program;
const [
  input = `${base}/**/*.jsx`,
  output = 'dist'
] = program.args;
const inputPaths = Glob.sync(input) || [];
const webPackConfig = getConfig({
  inputPaths: inputPaths
    .map(p => getFullTargetPath(p)),
  outputPath: getFullTargetPath(output),
  runtime,
  library,
  base
});
const startInMS = new Date().getTime();

console.log();
console.log('Compiling...');
console.log();

WebPack(
  webPackConfig,
  (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log('Compile FAILED:');
      console.log();
      console.log(err);
      console.log();
      console.log(stats.toJson('minimal').errors);
      console.log();
    } else {
      const endInMS = new Date().getTime();
      const durationInSeconds = (endInMS - startInMS) / 1000;

      console.log(`Finished compiling in ${durationInSeconds} seconds.`);
      console.log();
    }
    console.log(

    );
  }
);
