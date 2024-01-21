/**
 * @param {import("../utils.js").RGB[]} paletteColors
 * @returns {ImageData}
 */
export function generatePalette(paletteColors) {
	if (paletteColors.length > 4096) throw new Error('Too many colors - max 4096 colors');
	else if (paletteColors.length < 1) throw new Error('No colors provided');

	/*
    We are trying to generate a color-lookup-texture that maps each RGB value to the closest color in the given colorPalette.
    To avoid having to generate a massive texture for all 16million colors we reduce the precision of the colors to 4 bits per channel.
    This reduces the possible colors to 4096, which nicely fits into a 64x64 image.

    So. We loop over all possible 4bit colors, map them to a unique xy position, 
    find the closest color in the palette, and save it in the lookup table.

    We map each 4bit color to a unique xy position by concatenating the 4bit values into a single 12bit value,
    and then using the first 6 bits as the x value, and the last 6 bits as the y value.

    For performance, we generate each 12bit number directly and derive the channels from it, 
    instead of using a triple nested loop to generate the channels and then concatenating them.
    */

	const lookupTable = new ImageData(64, 64);

	//An 8bit RGBA buffer containing all the paletteColors in order
	const colors = new Uint8ClampedArray(paletteColors.length * 4);
	for (let i = 0; i < paletteColors.length; i++) {
		const color = paletteColors[i];
		colors.set(color, i << 2);
		colors[(i << 2) | 0b11] = 0b1111_1111; //Set the alpha to 255
	}

	const TWELVE_BIT_MAX = 0b1111_1111_1111;
	const FOUR_BIT_MASK = 0b1111;

	//Loop over all possible 12bit ints
	for (let i = 0; i <= TWELVE_BIT_MAX; i++) {
		const x = i >> 6; //Leading 6 bits
		const y = i & 0b11_1111; //Trailing 6 bits

		//Get the 4bit representation of each channel
		const r = i & FOUR_BIT_MASK; //Get the last 4 bits
		const g = (i >> 4) & FOUR_BIT_MASK; //Get the middle 4 bits
		const b = (i >> 8) & FOUR_BIT_MASK; //Get the first 4 bits

		//Loop over all available colors and find the closest one
		//TODO: Use a better color-space for this
		let closestIndex = 0;
		let closestDistanceSquared = Number.MAX_SAFE_INTEGER;

		for (let c = 0; c < paletteColors.length; c++) {
			const distanceSquared =
				((r << 4) - colors[c << 2]) ** 2 +
				((g << 4) - colors[(c << 2) | 0b01]) ** 2 +
				((b << 4) - colors[(c << 2) | 0b10]) ** 2;

			if (distanceSquared < closestDistanceSquared) {
				closestIndex = c;
				closestDistanceSquared = distanceSquared;
			}
		}

		//Index into the RGBA texture Buffer and save the (8bit) color
		const lookupTableDataIndex = ((y << 6) | x) << 2;
		lookupTable.data.set(
			colors.slice(closestIndex << 2, (closestIndex << 2) + 4), //Copy RGBA from the colors buffer
			lookupTableDataIndex
		);
	}

	return lookupTable;
}

/**
 * Get the color from the palette,
 * but return the array-slice directly instead of copying it into a JS array
 *
 * @param {ImageData} palette The palette to sample from
 * @param {Uint8ClampedArray} rgb The RGB values of the color to sample
 * @return {Uint8ClampedArray} A Uint8ClampedArray containing the RGB (but not A) values of the color
 */
export function samplePalette(palette, rgb) {
	//Get the 4bit color value
	const r_val = rgb[0] >> 4;
	const g_val = rgb[1] >> 4;
	const b_val = rgb[2] >> 4;

	const i = r_val + (g_val << 4) + (b_val << 8); //Concatenate the 4bit values into a single 12bit value

	const x = i >> 6; //Leading 6 bits
	const y = i & 0b11_1111; //Trailing 6 bits

	//Get the RGB values from the palette
	const paletteIndex = ((y << 6) | x) << 2;
	return palette.data.slice(paletteIndex, paletteIndex | 0b11);
}
