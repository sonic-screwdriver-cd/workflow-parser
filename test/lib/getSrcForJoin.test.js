'use strict';

const assert = require('chai').assert;
const getSrcForJoin = require('../../lib/getSrcForJoin');
const WORKFLOW = require('../data/join-workflow');

describe('getSrcForJoin', () => {
    it('should throw if job not provided', () => {
        assert.throws(() => getSrcForJoin(WORKFLOW, {}),
            Error, 'Must provide a job');
    });

    it('should figure out what src for the job if it is a join', () => {
        // src nodes for join job
        assert.deepEqual(getSrcForJoin(WORKFLOW, {
            jobName: 'foo'
        }), [
            { name: 'main', id: 1 },
            { name: 'other_main', id: 2 }
        ]);
        // return empty arry if it's not a join job
        assert.deepEqual(getSrcForJoin(WORKFLOW, { jobName: 'bar' }), []);
    });
});
