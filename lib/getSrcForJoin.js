'use strict';

/**
 * Return the join src jobs given a workflowGraph and dest job
 * @method getSrcForJoin
 * @param  {Object}    workflowGraph    Directed graph representation of workflow
 * @param  {Object}    config
 * @param  {String}    config.jobName   The dest job name to be triggered after a join
 * @return {Array}                      List of node object consists of job name and id
 */
const getSrcForJoin = (workflowGraph, config) => {
    const jobs = new Set();

    if (!config || !config.jobName) {
        throw new Error('Must provide a job name');
    }

    workflowGraph.edges.forEach((edge) => {
        if (edge.dest === config.jobName && edge.join) {
            jobs.add(workflowGraph.nodes.find(node => node.name === edge.src));
        }
    });

    return Array.from(jobs);
};

module.exports = getSrcForJoin;
