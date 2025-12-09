
/**
 * Removes all spaces from a string to sanitize it.
 * Intentionally contains a bug: uses replace() which only removes the first occurrence.
 * 
 * @param {string} input - The string to sanitize.
 * @returns {string} The sanitized string.
 */
export function sanitizeInput(input) {
    // BUG: Should be replaceAll / /g, or replace(/\s+/g, '')
    return input.replace(' ', '');
}
