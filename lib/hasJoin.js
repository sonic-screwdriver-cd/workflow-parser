'use strict';

/**
 * Calculate if the workflow contains a cycle, e.g. A -> B -> A
 * @method hasCycle
 * @param  {Object}  workflowGraph  Graph representation of workflow
 * @return {Boolean}                True if a cycle exists anywhere in the workflow
 */
const hasJoin = workflowGraph =>
    // Check from all the nodes to capture deteached workflows
    workflowGraph.edges.some(edge => edge.join);

module.exports = hasJoin;
