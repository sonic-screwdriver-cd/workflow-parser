'use strict';

/**
 * Check if the workflow has a join, e.g. A + B -> C
 * @method hasJoin
 * @param  {Object}  workflowGraph  Graph representation of workflow
 * @return {Boolean}                True if a cycle exists anywhere in the workflow
 */
const hasJoin = workflowGraph =>
    // Check from all the nodes to capture detached workflows
    workflowGraph.edges.some(edge => edge.join);

module.exports = hasJoin;
