#!/usr/bin/env node

require('./Utils/Env');
const program = require('commander');
const {
  version,
  description
} = require('../package');

/**
 * The main CLI program.
 * @type {Object}
 * */
program
  .version(version, '-v, --version')
  .description(description)
  .command(
    'compile [input] [output]',
    'Compile the input file or pattern to the output directory.',
    {isDefault: true}
  ).alias('c')
  .parse(process.argv);
