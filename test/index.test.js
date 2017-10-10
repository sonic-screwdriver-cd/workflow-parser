'use strict';

const assert = require('chai').assert;
const parser = require('../index');

const LEGACY_NO_WORKFLOW = {
    jobs: {
        main: {},
        foo: {},
        bar: {}
    }
};
const LEGACY_WITH_WORKFLOW = Object.assign({}, LEGACY_NO_WORKFLOW);

LEGACY_WITH_WORKFLOW.workflow = ['foo', 'bar'];

const REQUIRES_WORKFLOW = {
    jobs: {
        main: { requires: ['~pr', '~commit'] },
        foo: { requires: ['main'] },
        bar: { requires: ['foo'] }
    }
};

const LEGACY_AND_REQUIRES_WORKFLOW = Object.assign({}, REQUIRES_WORKFLOW);

LEGACY_WITH_WORKFLOW.workflow = ['foo', 'bar'];

const EXPECTED_OUTPUT = {
    nodes: [
        { name: 'main' },
        { name: 'foo' },
        { name: 'bar' }
    ],
    edges: [
        { src: '~pr', dest: 'main' },
        { src: '~commit', dest: 'main' },
        { src: 'main', dest: 'foo' },
        { src: 'foo', dest: 'bar' }
    ]
};

const NO_EDGES = Object.assign({}, EXPECTED_OUTPUT);

NO_EDGES.edges = [];

describe('index test', () => {
    describe('getWorkflow', () => {
        it('should throw if it is not given correct input', () => {
            assert.throws(() => parser.getWorkflow({ config: {} }),
                Error, 'No Job config provided');
        });

        it('should produce directed graph when legacy mode is on', () => {
            assert.deepEqual(parser.getWorkflow({
                config: LEGACY_NO_WORKFLOW,
                useLegacy: true
            }), EXPECTED_OUTPUT, 'no legacy workflow defined');
            assert.deepEqual(parser.getWorkflow({
                config: LEGACY_WITH_WORKFLOW,
                useLegacy: true
            }), EXPECTED_OUTPUT, 'has legacy workflow defined');
            assert.deepEqual(parser.getWorkflow({
                config: REQUIRES_WORKFLOW,
                useLegacy: true
            }), EXPECTED_OUTPUT, 'requires-style workflow');
            assert.deepEqual(parser.getWorkflow({
                config: LEGACY_AND_REQUIRES_WORKFLOW,
                useLegacy: true
            }), EXPECTED_OUTPUT, 'both legacy and non-legacy workflows');
        });

        it('should convert a legacy config to graph with no edges when legacy mode off', () => {
            assert.deepEqual(parser.getWorkflow({
                config: LEGACY_WITH_WORKFLOW,
                useLegacy: false
            }), NO_EDGES, 'has legacy workflow defined');
            assert.deepEqual(parser.getWorkflow({
                config: LEGACY_NO_WORKFLOW,
                useLegacy: false
            }), NO_EDGES, 'legacy, no workflow defined');
        });

        it('should convert a config with job-requires workflow to directed graph', () => {
            assert.deepEqual(parser.getWorkflow({
                config: REQUIRES_WORKFLOW,
                useLegacy: false
            }), EXPECTED_OUTPUT, 'requires-style workflow');
            assert.deepEqual(parser.getWorkflow({
                config: LEGACY_AND_REQUIRES_WORKFLOW,
                useLegacy: false
            }), EXPECTED_OUTPUT, 'both legacy and non-legacy workflows');
        });

        it('should handle detatched jobs', () => {
            const result = parser.getWorkflow({
                config: {
                    jobs: {
                        foo: {},
                        bar: { requires: ['foo'] }
                    }
                }
            });

            assert.deepEqual(result, {
                nodes: [{ name: 'foo' }, { name: 'bar' }],
                edges: [{ src: 'foo', dest: 'bar' }]
            });
        });
    });

    describe('getNextJobs', () => {
        it('should figure out what jobs start next', () => {
            assert.deepEqual(parser.getNextJobs(EXPECTED_OUTPUT, '~pr'), ['main']);
            assert.deepEqual(parser.getNextJobs(EXPECTED_OUTPUT, '~commit'), ['main']);
            assert.deepEqual(parser.getNextJobs(EXPECTED_OUTPUT, 'main'), ['foo']);
            assert.deepEqual(parser.getNextJobs(EXPECTED_OUTPUT, 'foo'), ['bar']);
            assert.deepEqual(parser.getNextJobs(EXPECTED_OUTPUT, 'bar'), []);
            assert.deepEqual(parser.getNextJobs(EXPECTED_OUTPUT, 'banana'), []);

            const parallelWorkflow = {
                edges: [
                    { src: 'a', dest: 'b' },
                    { src: 'a', dest: 'c' },
                    { src: 'a', dest: 'd' },
                    { src: 'b', dest: 'e' }
                ]
            };

            assert.deepEqual(parser.getNextJobs(parallelWorkflow, 'a'), ['b', 'c', 'd']);
            assert.deepEqual(parser.getNextJobs(parallelWorkflow, 'b'), ['e']);
        });
    });
});
