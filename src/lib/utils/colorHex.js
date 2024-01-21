/**
 * Returns the hex representation of the given byte.
 * @param {number} n
 * @returns string
 */
function byteAsHex(n) {
	const hex = n.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Returns the hex representation of the given rgb color.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
	return '#' + byteAsHex(r) + byteAsHex(g) + byteAsHex(b);
}

/**
 * Returns the compact hex representation of the given rgb color, using only 1 Character per color.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
export function rgbToCompactHex(r, g, b) {
	//Reduce the color to 4 bits per color
	r = Math.floor(r / 16);
	g = Math.floor(g / 16);
	b = Math.floor(b / 16);

	//Convert to hex
	const rHex = r.toString(16)[0];
	const gHex = g.toString(16)[0];
	const bHex = b.toString(16)[0];
	return '#' + rHex + gHex + bHex;
}
