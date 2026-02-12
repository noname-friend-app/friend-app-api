const { describe, it, before } = require('mocha');
const { assert } = require('chai');
const { generateToken, generateHash, isValidPassword } = require('../../utils/auth');

// Set up test JWT secret
process.env.JWT_SECRET = 'test-secret-key';

describe('Auth Utils', () => {
    describe('generateHash', () => {
        it('should return a bcrypt hash string', async () => {
            const hash = await generateHash('testpassword');
            assert.isString(hash);
            // bcrypt hashes start with $2b$ or $2a$
            assert.match(hash, /^\$2[ab]\$/, 'Hash should be a valid bcrypt hash');
        });

        it('should return different hashes for the same password (due to salt)', async () => {
            const hash1 = await generateHash('testpassword');
            const hash2 = await generateHash('testpassword');
            assert.notStrictEqual(hash1, hash2);
        });

        it('should return a hash of expected length', async () => {
            const hash = await generateHash('testpassword');
            // bcrypt hashes are always 60 characters
            assert.strictEqual(hash.length, 60);
        });
    });

    describe('isValidPassword', () => {
        it('should return true for correct password', async () => {
            const password = 'mysecretpassword';
            const hash = await generateHash(password);
            const isValid = await isValidPassword(password, hash);
            assert.isTrue(isValid);
        });

        it('should return false for incorrect password', async () => {
            const password = 'mysecretpassword';
            const hash = await generateHash(password);
            const isValid = await isValidPassword('wrongpassword', hash);
            assert.isFalse(isValid);
        });

        it('should return false for empty password against valid hash', async () => {
            const hash = await generateHash('realpassword');
            const isValid = await isValidPassword('', hash);
            assert.isFalse(isValid);
        });

        it('should handle special characters in passwords', async () => {
            const password = 'p@$$w0rd!#%^&*()';
            const hash = await generateHash(password);
            const isValid = await isValidPassword(password, hash);
            assert.isTrue(isValid);
        });
    });

    describe('generateToken', () => {
        it('should return a JWT string', () => {
            const user = { id: 123 };
            const token = generateToken(user);
            assert.isString(token);
        });

        it('should return a token with three parts (header.payload.signature)', () => {
            const user = { id: 456 };
            const token = generateToken(user);
            const parts = token.split('.');
            assert.strictEqual(parts.length, 3);
        });

        it('should create tokens with user id in payload', () => {
            const user = { id: 789 };
            const token = generateToken(user);
            // Decode the payload (middle part)
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            assert.strictEqual(payload.id, 789);
        });

        it('should include expiration in token', () => {
            const user = { id: 123 };
            const token = generateToken(user);
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            assert.property(payload, 'exp');
            assert.property(payload, 'iat');
        });
    });
});
