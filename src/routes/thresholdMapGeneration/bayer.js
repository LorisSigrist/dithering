import { isPowerOf2 } from '$lib/math/power2.js';

/** @type {Map<number, number[][]>} */
const computedBayerLevels = new Map();

/**
 *
 * @param {number} level
 * @returns {number[][]}
 */
export function generateNormalizedBayerMatrix(level) {
	const unnormalizedBayerMatrix = generateUnnormalizedBayerLevel(level);
	const normalizationFactor = Math.pow(2, 2 * level + 2);
	const bayerMatrix = unnormalizedBayerMatrix.map((row) =>
		row.map((value) => value / normalizationFactor)
	);
	return bayerMatrix;
}

/**
 *
 * @param {number} level
 * @returns {number[][]}
 */
function generateUnnormalizedBayerLevel(level) {
	const alreadyComputed = computedBayerLevels.get(level);
	if (alreadyComputed) return alreadyComputed;

	if (level === 0)
		return [
			[0, 2],
			[3, 1]
		];

	const prev = generateUnnormalizedBayerLevel(level - 1);
	const next = new Array(prev.length * 2).fill(0).map(() => new Array(prev.length * 2).fill(0));

	for (let y = 0; y < prev.length; y++) {
		for (let x = 0; x < prev[y].length; x++) {
			next[y][x] = prev[y][x] * 4;
			next[y][x + prev.length] = prev[y][x] * 4 + 2;
			next[y + prev.length][x] = prev[y][x] * 4 + 3;
			next[y + prev.length][x + prev.length] = prev[y][x] * 4 + 1;
		}
	}

	computedBayerLevels.set(level, next);
	return next;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {CanvasRenderingContext2D} ctx
 * @returns {WebGLTexture}
 */
export function textureFromCanvas2D(gl, ctx) {
	const texture = gl.createTexture();
	if (!texture) throw new Error('Failed to create texture');

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);

	if (isPowerOf2(ctx.canvas.width) && isPowerOf2(ctx.canvas.height)) {
		// Yes, it's a power of 2. Generate mips.
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		// No, it's not a power of 2. Turn off mips and set
		// wrapping to clamp to edge
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	return texture;
}
