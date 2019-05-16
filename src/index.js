#!/usr/bin/env node

const program = require('commander');
const {
  version,
  description
} = require('./package');

program
  .version(version, '-v, --version')
  .description(description)
  .command(
    'compile [input] [output]',
    'Compile the input file or pattern to the output file or directory.',
    {isDefault: true}
  ).alias('c')
  .parse(process.argv);
