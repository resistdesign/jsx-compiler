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

program
  .option('-r, --runtime', `The runtime to target. Options: ${RUNTIME_LIST.join(', ')}. Default: ${DEFAULT_RUNTIME}.`)
  .parse(process.argv);

const [
  input = './src/**/*.jsx',
  output = 'dist'
] = program.args;
const {
  runtime
} = program;
const inputPaths = Glob.sync(input) || [];
const webPackConfig = getConfig({
  inputPaths: inputPaths
    .map(p => getFullTargetPath(p)),
  outputPath: getFullTargetPath(output),
  runtime
});
const startInMS = new Date().getTime();

console.log();
console.log('Compiling...');
console.log();

WebPack(
  webPackConfig,
  (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log();
      console.log('Compile FAILED:');
      console.log();
      console.log(err);
      console.log();
    } else {
      const endInMS = new Date().getTime();
      const durationInSeconds = (endInMS - startInMS) / 1000;

      console.log();
      console.log(`Finished compiling in ${durationInSeconds} seconds.`);
      console.log();
    }
    console.log(
      stats.toJson('minimal')
    );
  }
);
