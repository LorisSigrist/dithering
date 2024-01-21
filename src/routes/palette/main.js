import * as Comlink from 'comlink';
import RawImagePaletteWorker from './worker?worker';
import { browser } from '$app/environment';

/**
 * @type {Comlink.Remote<import("./worker").ImagePaletteWorker> | null}
 */
let worker = browser ? Comlink.wrap(new RawImagePaletteWorker()) : null;

/**
 * @param {import("../utils").RGB[]} palette
 * @returns {Promise<ImageData>}
 */
export async function generatePaletteInWorker(palette) {
	if (!worker) throw new Error('Worker not initialized');
	return await worker.generatePalette(palette);
}
