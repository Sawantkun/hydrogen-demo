
/**
 * Calculates the total cost of items.
 * Intentionally contains a bug: adds price and quantity instead of multiplying.
 * 
 * @param {number} price - The price of a single item.
 * @param {number} quantity - The number of items.
 * @returns {number} The total cost.
 */
export function calculateTotal(price, quantity) {
    // BUG: Should be price * quantity
    return price + quantity;
}
