import * as Comlink from 'comlink';
import RenderingWorker from './renderingWorker?worker';

/**
 * @typedef {{
 *    image: ImageData,
 *   output_width: number,
 *   output_height: number,
 *  palette: ImageData;
 *   diffusionStrength: number;
 *    diffusionMatrix: number[][];
 *   diffusionMatrixOriginX: number;
 *}} ErrorDiffusionDitheringOptions
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {ErrorDiffusionDitheringOptions} options
 */
export function errorDiffusionDithering(canvas, options) {
	const offscreen = canvas.transferControlToOffscreen();

	const worker = new RenderingWorker();

	/**
	 * @type {Comlink.Remote<typeof import("./renderingWorker.js").ErrorDiffusionWorker>}
	 */
	const wrappedWorker = Comlink.wrap(worker);

	/**
	 * @type {ErrorDiffusionDitheringOptions | null}
	 */
	let pendingUpdate = null;

	/**
	 * @type {Comlink.Remote<(newOptions: ErrorDiffusionDitheringOptions) => void> | null}
	 */
	let update = null;

	/** @type {() => void} */
	let destroy = () => {};

	wrappedWorker
		.errorDiffusionDithering(Comlink.transfer(offscreen, [offscreen]), options)
		.then((result) => {
			update = result.update;
			destroy = result.destroy;

			if (pendingUpdate) update(pendingUpdate);
			else update(options); //Necessary to avoid Chrome bug where `image-rendering` is not respected. No idea why.
		});

	return {
		/**
		 * @param {ErrorDiffusionDitheringOptions} newOptions
		 */
		update: (newOptions) => {
			if (update) update(newOptions);
			else pendingUpdate = newOptions;
		},
		destroy: () => {
			destroy();
			worker.terminate();
		}
	};
}
