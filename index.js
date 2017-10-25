'use strict';

const getWorkflow = require('./lib/getWorkflow');
const getNextJobs = require('./lib/getNextJobs');
const hasCycle = require('./lib/hasCycle');
const hasJoin = require('./lib/hasJoin');

module.exports = { getWorkflow, getNextJobs, hasCycle, hasJoin };
