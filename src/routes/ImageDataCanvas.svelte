<script>
	/** @type {ImageData}*/
	export let data;

	/** @type {string}*/
	export let twClass = '';

	/** @type { HTMLCanvasElement | null}*/
	export let canvas = null;

	/** @type {number}*/
	export let width = 300;

	/** @type {number}*/
	export let height = 300;

	/**
	 * @typedef {{
	 *   imageData: ImageData;
	 *   width: number;
	 *   height: number;
	 * }} DisplayImageDataOptions
	 */

	/**
	 *
	 * @param {HTMLCanvasElement} canvas
	 * @param {DisplayImageDataOptions} options
	 */
	function displayImageData(canvas, options) {
		/** @type {OffscreenCanvas} */
		let intermediate;

		const loadImageIntoIntermediate = () => {
			intermediate = new OffscreenCanvas(data.width, data.height);
			const intermediateCtx = intermediate.getContext('2d');
			intermediateCtx?.putImageData(options.imageData, 0, 0);
		};

		loadImageIntoIntermediate();

		const rerender = () => {
			canvas.width = options.width;
			canvas.height = options.height;
			const ctx = canvas.getContext('2d');
			ctx?.drawImage(intermediate, 0, 0, options.width, options.height);
		};
		rerender();

		return {
			/**
			 * @param {DisplayImageDataOptions} newOptions
			 */
			update: (newOptions) => {
				options = newOptions;
				loadImageIntoIntermediate();
				requestAnimationFrame(rerender);
			}
		};
	}
</script>

<canvas
	use:displayImageData={{
		imageData: data,
		width,
		height
	}}
	bind:this={canvas}
	style={`image-rendering: pixelated;`}
	{width}
	{height}
	class={twClass}
/>
