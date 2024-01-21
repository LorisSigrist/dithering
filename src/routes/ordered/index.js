import vertex_src from './vertex.glsl';
import fragment_src from './fragment.glsl';
import { initShaderProgram, setUpRect, textureFromImageData } from './utils';

/**
 * @typedef {{
 *  image: ImageData;
 *  thresholdMap: ImageData;
 *   noiseIntensity: number;
 *   palette: ImageData;
 *   output_width: number;
 *   output_height: number;
 *}} DitheringOptions
 */

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {DitheringOptions}  initialOptions
 * @returns
 */
export function orderedDithering(canvas, initialOptions) {
	let options = initialOptions;

	/**
	 * @type {WebGLRenderingContext | null}
	 */
	const gl = canvas.getContext('webgl', {
		preserveDrawingBuffer: true //Needed to save the canvas as an image
	});

	if (!gl) {
		alert('WebGL not supported');
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const program = initShaderProgram(gl, vertex_src, fragment_src);
	const { vertex_buffer, index_buffer } = setUpRect(gl);
	gl.useProgram(program);

	//Get the location of the attributes and uniforms
	const position_attribute_location = gl.getAttribLocation(program, 'position');
	gl.vertexAttribPointer(position_attribute_location, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(position_attribute_location);

	const uSampler = gl.getUniformLocation(program, 'uSampler');
	const uNoiseSampler = gl.getUniformLocation(program, 'uNoiseSampler');
	const uNoise = gl.getUniformLocation(program, 'uNoise');
	const uSize = gl.getUniformLocation(program, 'uSize');
	const uNoiseSamplerSize = gl.getUniformLocation(program, 'uNoiseSamplerSize');
	const uPaletteSampler = gl.getUniformLocation(program, 'uPaletteSampler');

	/** @type {WebGLTexture} */
	let imageTexture;
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	const loadImage = () => {
		if (imageTexture) {
			gl.deleteTexture(imageTexture);
		}

		imageTexture = textureFromImageData(gl, options.image, gl.LINEAR);
	};

	loadImage();

	/** @type {WebGLTexture} */
	let thresholdMapTexture;

	/** @type {{ width: number, height: number }} */
	let thresholdMapSize;

	/** @type {number | null} */
	let frame = null;

	const loadThresholdMap = () => {
		if (thresholdMapTexture) {
			gl.deleteTexture(thresholdMapTexture);
		}

		thresholdMapTexture = textureFromImageData(gl, options.thresholdMap, gl.NEAREST);
		thresholdMapSize = { width: options.thresholdMap.width, height: options.thresholdMap.height };
	};

	loadThresholdMap();

	/** @type {WebGLTexture} */
	let paletteTexture;

	const loadPalette = () => {
		if (paletteTexture) {
			gl.deleteTexture(paletteTexture);
		}

		paletteTexture = textureFromImageData(gl, options.palette, gl.NEAREST);
	};

	loadPalette();

	const render = () => {
		gl.viewport(0, 0, options.output_width, options.output_height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, imageTexture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(uSampler, 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, thresholdMapTexture);
		gl.uniform1i(uNoiseSampler, 1);

		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
		gl.uniform1i(uPaletteSampler, 2);

		gl.uniform2f(uNoiseSamplerSize, thresholdMapSize.width, thresholdMapSize.height);

		gl.uniform1f(uNoise, options.noiseIntensity);

		gl.uniform2f(uSize, options.output_width, options.output_height);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	};

	function invalidate() {
		frame = requestAnimationFrame(() => {
			render();
			frame = null;
		});
	}

	invalidate();

	return {
		/**
		 * @param {DitheringOptions} newOptions
		 */
		update(newOptions) {
			const imageHasBeenChanged = options.image !== newOptions.image;
			const thresholdMapChanged = options.thresholdMap !== newOptions.thresholdMap;
			const paletteChanged = options.palette !== newOptions.palette;

			//Use the new options
			options = newOptions;

			//Run lifecycle methods if needed
			if (imageHasBeenChanged) loadImage();

			if (thresholdMapChanged) loadThresholdMap();

			if (paletteChanged) loadPalette();

			//Schedule a rerender
			invalidate();
		},

		destroy() {
			//Cancel any pending rerenders
			if (frame !== null) cancelAnimationFrame(frame);
		}
	};
}
