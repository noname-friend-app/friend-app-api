const { describe, it } = require('mocha');
const { assert } = require('chai');
const { newGroupCode } = require('../../utils/groups');

describe('Groups Utils', () => {
    describe('newGroupCode', () => {
        it('should return a code with default length of 6', () => {
            const code = newGroupCode();
            assert.strictEqual(code.length, 6);
        });

        it('should return a code with custom length', () => {
            const code = newGroupCode(10);
            assert.strictEqual(code.length, 10);
        });

        it('should return a code with length 1', () => {
            const code = newGroupCode(1);
            assert.strictEqual(code.length, 1);
        });

        it('should only contain lowercase letters and digits', () => {
            const validChars = /^[a-z0-9]+$/;
            // Run multiple times to account for randomness
            for (let i = 0; i < 100; i++) {
                const code = newGroupCode();
                assert.match(code, validChars, `Code "${code}" contains invalid characters`);
            }
        });

        it('should return a string', () => {
            const code = newGroupCode();
            assert.isString(code);
        });

        it('should return empty string for length 0', () => {
            const code = newGroupCode(0);
            assert.strictEqual(code, '');
        });
    });
});
