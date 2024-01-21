import * as Comlink from 'comlink';
import { generateThresholdMapImageData } from './generation';

export const ThresholdMapGenerationWorker = {
	/**
	 * @param {import("./generation.js").ThresholdMapOptions} options
	 * @returns { Promise<ImageData>}
	 */
	generate(options) {
		return generateThresholdMapImageData(options);
	}
};

Comlink.expose(ThresholdMapGenerationWorker);
