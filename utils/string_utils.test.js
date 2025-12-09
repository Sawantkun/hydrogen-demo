import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeInput } from './string_utils.js';

test('sanitizeInput removes all spaces', () => {
    const input = 'a b c';
    const expected = 'abc';

    const result = sanitizeInput(input);

    assert.strictEqual(result, expected, `Expected '${expected}', but got '${result}'`);
});
