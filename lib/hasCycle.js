'use strict';

const getNextJobs = require('./getNextJobs');

/**
 * Recursively verify if there is a cycle starting from job
 * @method walk
 * @param  {Object} workflowGraph   Directed graph representation of workflow
 * @param  {String} jobName         Job Name
 * @param  {Set} visitedJobs        Unique list of visited jobs
 * @return {Boolean}                True if a cycle detected
 */
const walk = (workflowGraph, jobName, visitedJobs) => {
    visitedJobs.add(jobName);

    const triggerList = getNextJobs(workflowGraph, { trigger: jobName, prNum: 1 });

    // Hit a leaf node, must be good
    if (triggerList.length === 0) {
        return false;
    }

    // Check to see if we visited this job before
    if (triggerList.some(name => visitedJobs.has(name))) {
        return true;
    }

    // recursively walk starting from the new jobs
    return triggerList.some(name => walk(workflowGraph, name, visitedJobs));
};

/**
 * Calculate if the workflow contains a cycle, e.g. A -> B -> A
 * @method hasCycle
 * @param  {Object}  workflowGraph  Graph representation of workflow
 * @return {Boolean}                True if a cycle exists anywhere in the workflow
 */
const hasCycle = workflowGraph =>
    // Check from all the nodes to capture deteached workflows
    workflowGraph.nodes.some(node => walk(workflowGraph, node.name, new Set()));

module.exports = hasCycle;
