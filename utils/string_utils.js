/**
 * Removes all spaces from a string to sanitize it.
 * 
 * @param {string} input - The string to sanitize.
 * @returns {string} The sanitized string.
 */
export function sanitizeInput(input) {
    return input.replaceAll(' ', '');
}