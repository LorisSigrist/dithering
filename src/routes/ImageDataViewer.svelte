<script>
	/** @type {ImageData | null} */
	export let imageData;

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {ImageData} imageData
	 */
	function showImageData(canvas, imageData) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const draw = () => {
			canvas.width = imageData.width;
			canvas.height = imageData.height;
			ctx.putImageData(imageData, 0, 0);
		};

		/**
		 * @type {number | null}
		 */
		let frame = null;

		const invalidate = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = null;
				draw();
			});
		};

		invalidate();

		return {
			destroy() {
				if (frame) cancelAnimationFrame(frame);
			},

			/**
			 * @param {ImageData} newImageData
			 */
			update: (newImageData) => {
				imageData = newImageData;
				invalidate();
			}
		};
	}
</script>

<div class="grid aspect-square w-full place-items-center rounded-lg bg-gray-100 p-8">
	{#if imageData}
		<canvas
			use:showImageData={imageData}
			class="max-h-96 w-full object-contain shadow-lg"
			style="image-rendering: pixelated;"
		/>
	{:else}
		<slot name="placeholder">
			<span>No Image</span>
		</slot>
	{/if}
</div>
