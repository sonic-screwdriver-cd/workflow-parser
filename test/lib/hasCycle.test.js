'use strict';

const assert = require('chai').assert;
const hasCycle = require('../../lib/hasCycle');

describe('hasCyles', () => {
    it('should return true if a workflow has a cycle', () => {
        const workflow = {
            nodes: [
                { name: '~pr' },
                { name: '~commit' },
                { name: 'A' },
                { name: 'B' },
                { name: 'C' },
                { name: 'D' },
                { name: 'E' },
                { name: 'F' }
            ],
            edges: [
                { src: '~commit', dest: 'A' }, // start
                { src: 'A', dest: 'B' }, // parallel
                { src: 'A', dest: 'C' }, // parallel
                { src: 'B', dest: 'D' }, // serial
                { src: 'C', dest: 'E' }, // serial
                { src: 'D', dest: 'F', join: true }, // join
                { src: 'E', dest: 'F', join: true }, // join
                { src: 'F', dest: 'A' } // cycle
            ]
        };

        assert.isTrue(hasCycle(workflow));
    });

    it('should return true if a detached workflow has a cycle', () => {
        const workflow = {
            nodes: [
                { name: '~pr' },
                { name: '~commit' },
                { name: 'A' },
                { name: 'B' },
                { name: 'C' },
                { name: 'D' }
            ],
            edges: [
                { src: '~commit', dest: 'A' }, // start
                { src: 'A', dest: 'B' }, // end
                { src: 'C', dest: 'D' }, // detached start
                { src: 'D', dest: 'C' } // detached cycle
            ]
        };

        assert.isTrue(hasCycle(workflow));
    });

    it('should return true if a job requires itself', () => {
        const workflow = {
            nodes: [
                { name: '~pr' },
                { name: '~commit' },
                { name: 'A' }
            ],
            edges: [
                { src: '~commit', dest: 'A' }, // start
                { src: 'A', dest: 'A' } // cycle
            ]
        };

        assert.isTrue(hasCycle(workflow));
    });

    it('should return false if a workflow does not have a cycle', () => {
        const workflow = {
            nodes: [
                { name: '~pr' },
                { name: '~commit' },
                { name: 'A' },
                { name: 'B' }
            ],
            edges: [
                { src: '~commit', dest: 'A' }, // start
                { src: 'A', dest: 'B' } // end
            ]
        };

        assert.isFalse(hasCycle(workflow));
    });

    it('should return false if workflow contains join but no cycle', () => {
        const workflow = {
            nodes: [
                { name: '~pr' },
                { name: '~commit' },
                { name: 'A' },
                { name: 'B' },
                { name: 'C' }
            ],
            edges: [
                { src: '~commit', dest: 'A' }, // start
                { src: '~commit', dest: 'B' }, // start
                { src: 'A', dest: 'C', join: true }, // join
                { src: 'B', dest: 'C', join: true } // join
            ]
        };

        assert.isFalse(hasCycle(workflow));
    });
});
