#! /usr/bin/env node

const argv = require('yargs')
  .usage('Usage: mongo-to-elastic [options]')
  .alias('mongo-host', 'mh')
  .describe('mongo-host', 'MongoDB host')
  .alias('mongo-port', 'mp')
  .describe('mongo-port', 'MongoDB port')
  .alias('database', 'db')
  .describe('database', 'MongoDB database')
  .alias('collection', 'c')
  .describe('collection', 'MongoDB collection')
  .alias('rethink-host', 'eh')
  .describe('rethink-host', 'RethinkDB host')
  .alias('rethink-port', 'ep')
  .describe('rethink-port', 'RethinkDB port')
  .alias('rethink-user', 'ru')
  .describe('rethink-user', 'RethinkDB username')
  .alias('rethink-pass', 'rp')
  .describe('rethink-pass', 'RethinkDB passsword')
  .alias('concurrency', 'con')
  .describe('concurrency', 'Promise concurrency')
  .help().argv;

require('../lib')(argv);
