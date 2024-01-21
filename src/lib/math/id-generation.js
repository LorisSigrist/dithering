/**
 * Randomly generate an ID that can be used for HTML elements.
 *
 * Useful for pairing labels with inputs.
 * @returns {string} A random ID.
 */
export function ID() {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
