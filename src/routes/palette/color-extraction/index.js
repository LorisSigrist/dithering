import quantize from './quantize';

/**
 *
 * @param {ImageData} imageData
 * @param {number} downSamplingFactor
 * @returns {import("../../utils.js").RGB | null}
 */
function getColor(imageData, downSamplingFactor = 10) {
	const palette = getPalette(imageData, 5, downSamplingFactor);
	if (!palette) return null;
	return palette[0];
}

/**
 *
 * @param {ImageData} imageData
 * @param {number} colorCount
 * @param {number} downSamplingFactor
 * @returns {import("../../utils.js").RGB[] | null}
 */
function getPalette(imageData, colorCount, downSamplingFactor = 10) {
	const pixelData = downSamplePixelData(imageData.data, downSamplingFactor);
	const color_map = quantize(pixelData, colorCount);

	/**
	 * @type {import("../../utils.js").RGB[] | null}
	 */
	const palette = color_map ? color_map.palette() : null;

	console.log(palette, colorCount);

	return palette;
}

export { getColor, getPalette };

/**
 * @param {Uint8ClampedArray} ogPixelData
 * @param {number} factor
 * @returns {Uint8ClampedArray}
 */
function downSamplePixelData(ogPixelData, factor) {
	//Down-sample pixel data to decrease pixel count
	const numPixels = Math.floor(ogPixelData.length / 4);
	const newNumPixels = Math.max(1, Math.round(numPixels / factor));
	const pixelData = new Uint8ClampedArray(newNumPixels * 4);

	for (let i = 0; i < newNumPixels; i++) {
		const j = Math.round((i * numPixels) / newNumPixels);

		pixelData[i * 4 + 0] = ogPixelData[j * 4 + 0];
		pixelData[i * 4 + 1] = ogPixelData[j * 4 + 1];
		pixelData[i * 4 + 2] = ogPixelData[j * 4 + 2];
		pixelData[i * 4 + 3] = ogPixelData[j * 4 + 3];
	}

	return pixelData;
}
