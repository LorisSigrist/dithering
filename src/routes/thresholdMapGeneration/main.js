import * as Comlink from 'comlink';
import ThresholdWorker from './worker?worker';

/**
 * @type {Comlink.Remote<typeof import("./worker").ThresholdMapGenerationWorker> | null}
 */
let ThresholdMapWorker = null;

/**
 *
 * @param {import("./generation.js").ThresholdMapOptions} options
 * @returns {Promise<ImageData>}
 */
export async function generateThresholdMap(options) {
	if (!ThresholdMapWorker) {
		ThresholdMapWorker = Comlink.wrap(new ThresholdWorker());
	}

	return await ThresholdMapWorker.generate(options);
}
