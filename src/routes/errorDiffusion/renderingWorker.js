import { clamp } from '$lib/math/clamp';
import * as Comlink from 'comlink';
import { samplePalette } from '../palette/paletteGeneration';

/**
 *
 * @param {OffscreenCanvas} canvas
 * @param {import("./index.js").ErrorDiffusionDitheringOptions} options
 * @returns
 */
function errorDiffusionDithering(canvas, options) {
	/** @type {number | null} */
	let frame = null;

	/**
	 * @type {OffscreenCanvas}
	 */
	let image;

	const loadImage = () => {
		image = new OffscreenCanvas(options.image.width, options.image.height);
		const image_ctx = image.getContext('2d');
		image_ctx?.putImageData(options.image, 0, 0);
	};

	loadImage();

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get canvas context');

	const render = () => {
		ctx.drawImage(image, 0, 0, options.output_width, options.output_height);
		const dithered = ctx.getImageData(0, 0, options.output_width, options.output_height);

		for (let y = 0; y < options.output_height; y++) {
			for (let x = 0; x < options.output_width; x++) {
				const imgDataIdx = (y * options.output_width + x) << 2;

				//Use the closest color from the palette (while preserving alpha)
				const ogRGB = dithered.data.slice(imgDataIdx, imgDataIdx | 0b11);
				const sampledRGB = samplePalette(options.palette, ogRGB);
				dithered.data.set(sampledRGB, imgDataIdx);

				const error_r = ((ogRGB[0] - sampledRGB[0]) * options.diffusionStrength) / 2;
				const error_g = ((ogRGB[1] - sampledRGB[1]) * options.diffusionStrength) / 2;
				const error_b = ((ogRGB[2] - sampledRGB[2]) * options.diffusionStrength) / 2;

				//Spread the error to the surrounding pixels (making sure to stay within the bounds of the image)
				for (let matrixY = 0; matrixY < options.diffusionMatrix.length; matrixY++) {
					for (let matrixX = 0; matrixX < options.diffusionMatrix[0].length; matrixX++) {
						const errorPixelX = x + matrixX - options.diffusionMatrixOriginX;
						const errorPixelY = y + matrixY;

						//Skip pixels that are outside the image
						if (
							errorPixelX < 0 ||
							errorPixelX >= options.output_width ||
							errorPixelY < 0 ||
							errorPixelY >= options.output_height
						)
							continue;

						const errorIndex = (errorPixelY * dithered.width + errorPixelX) << 2;

						const errorMultiplier = options.diffusionMatrix[matrixY][matrixX];

						dithered.data[errorIndex] = clamp(
							dithered.data[errorIndex] + error_r * errorMultiplier * options.diffusionStrength,
							0,
							255
						);
						dithered.data[errorIndex | 0b01] = clamp(
							dithered.data[errorIndex | 0b01] +
								error_g * errorMultiplier * options.diffusionStrength,
							0,
							255
						);
						dithered.data[errorIndex | 0b10] = clamp(
							dithered.data[errorIndex | 0b10] +
								error_b * errorMultiplier * options.diffusionStrength,
							0,
							255
						);
					}
				}
			}
		}

		ctx.putImageData(dithered, 0, 0);
	};

	const invalidate = () => {
		if (frame !== null) return;
		frame = requestAnimationFrame(() => {
			frame = null;
			render();
		});
	};

	invalidate();

	/**
	 * @param {ImageData} newImage
	 */
	const updateImage = (newImage) => {
		options.image = newImage;
		loadImage();
		invalidate();
	};

	/**
	 * @param {import("./index.js").ErrorDiffusionDitheringOptions} newOptions
	 */
	const update = (newOptions) => {
		const imageChanged = newOptions.image !== options.image;
		options = newOptions;

		canvas.width = options.output_width;
		canvas.height = options.output_height;

		if (imageChanged) loadImage();

		invalidate();
	};

	const destroy = () => {
		if (frame !== null) cancelAnimationFrame(frame);
	};

	return Comlink.proxy({
		update,
		updateImage,
		destroy
	});
}

export const ErrorDiffusionWorker = {
	errorDiffusionDithering: errorDiffusionDithering
};

Comlink.expose(ErrorDiffusionWorker);
