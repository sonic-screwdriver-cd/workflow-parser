'use strict';

/**
 * Get the list of nodes for the graph
 * @method calculateNodes
 * @param  {Object}       jobs Hash of job configs
 * @return {Array}             List of nodes (jobs)
 */
const calculateNodes = (jobs) => {
    const nodes = [];

    Object.keys(jobs).forEach((j) => {
        nodes.push({ name: j });
    });

    return nodes;
};

/**
 * Get all the edges of the directed graph from a legacy workflow config
 * @method calculateLegacyEdges
 * @param  {Array}             workflow  List of all jobs in the workflow excluding "main"
 * @return {Array}                       List of edge objects { src, dest }
 */
const calculateLegacyEdges = (workflow) => {
    // In legacy-mode "main" is always required to exist, and be the target of commit and pr
    const edges = [
        { src: '~pr', dest: 'main' },
        { src: '~commit', dest: 'main' }
    ];

    // Legacy-mode workflows are always linear, starting with main
    let src = 'main';

    workflow.forEach((dest) => {
        edges.push({ src, dest });
        src = dest;
    });

    return edges;
};

/**
 * Calculate edges of directed graph based on "requires" property of jobs
 * @method calculateEdges
 * @param  {Object}       jobs Hash of job configurations
 * @return {Array}             List of graph edges { src, dest }
 */
const calculateEdges = (jobs) => {
    const edges = [];

    Object.keys(jobs).forEach((j) => {
        const job = jobs[j];
        const dest = j;

        if (Array.isArray(job.requires)) {
            job.requires.forEach((src) => {
                edges.push({ src, dest });
            });
        }
    });

    return edges;
};

/**
 * Given a pipeline config, return a directed graph configuration that describes the workflow
 * @method getWorkflow
 * @param  {Object}    obj
 * @param  {Object}    obj.config               A pipeline config
 * @param  {Object}    obj.config.jobs          Hash of job configs
 * @param  {Array}     [obj.config.workflow]    Legacy workflow config
 * @param  {Boolean}   [obj.useLegacy]          Flag to process legacy workflows
 * @return {Object}                             List of nodes and edges { nodes, edges }
 */
const getWorkflow = ({ config: pipelineConfig, useLegacy = false }) => {
    const jobConfig = pipelineConfig.jobs;
    let edges = [];

    if (!jobConfig) {
        throw new Error('No Job config provided');
    }

    const hasRequiresConfig = Object.keys(jobConfig)
        .some(j => Array.isArray(jobConfig[j].requires));

    if (useLegacy && !hasRequiresConfig) {
        // Work out whether there is a user defined workflow,
        // or if we use the order of jobs defined in jobConfig
        const workflow = Array.isArray(pipelineConfig.workflow) ?
            pipelineConfig.workflow :
            Object.keys(jobConfig).filter(j => j !== 'main'); // remove main since that is a hard dependency

        edges = calculateLegacyEdges(workflow);
    } else {
        edges = calculateEdges(jobConfig);
    }

    return { nodes: calculateNodes(jobConfig), edges };
};

/**
 * Calculate the next jobs to execute, given a workflow and a trigger job
 * @method getNextJobs
 * @param  {Object}    workflow Directed graph representation of workflow
 * @param  {String}    trigger  Name of event that triggers jobs (~pr, ~commit, JobName)
 * @return {Array}              List of job names
 */
const getNextJobs = (workflow, trigger) => {
    const jobs = new Set();

    workflow.edges.forEach((edge) => {
        if (edge.src === trigger) {
            jobs.add(edge.dest);
        }
    });

    return Array.from(jobs);
};

module.exports = { getWorkflow, getNextJobs };
