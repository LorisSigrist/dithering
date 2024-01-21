import { generatePalette } from './paletteGeneration';
import { getPalette } from './color-extraction';
import * as Comlink from 'comlink';

const ImagePaletteWorker = {
	generatePalette,
	getPalette
};

/**
 * @typedef {typeof ImagePaletteWorker} ImagePaletteWorker
 */

Comlink.expose(ImagePaletteWorker);
