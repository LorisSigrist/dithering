/**
 * Clamp a value between a minimum and maximum value.
 * If the value is less than the minimum, the minimum is returned.
 * If the value is greater than the maximum, the maximum is returned.
 * Otherwise, the value is returned.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
