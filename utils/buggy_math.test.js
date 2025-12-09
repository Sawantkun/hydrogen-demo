import { test } from 'node:test';
import assert from 'node:assert';
import { calculateTotal } from './buggy_math.js';

test('calculateTotal correctly calculates total price', () => {
    const price = 10;
    const quantity = 2;
    const expected = 20;

    const result = calculateTotal(price, quantity);

    assert.strictEqual(result, expected, `Expected total to be ${expected}, but got ${result}`);
});
