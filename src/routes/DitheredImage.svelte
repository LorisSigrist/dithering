<script context="module">
	/**
	 * @typedef {'ordered' | 'error_diffusion' | 'none'} DitherMode
	 * @typedef {{ width: number, height: number }} BaseDitherConfig
	 *
	 * @typedef {{ mode: 'none' }} NoDitherConfig
	 * @typedef {{ mode: 'ordered', noiseIntensity: number, thresholdMap: ImageData | null, palette: ImageData | null }} OrderedDitherConfig
	 * @typedef {{ mode: 'error_diffusion', palette: ImageData | null, diffusionStrength: number, diffusionMatrix: number[][], diffusionMatrixOriginX: number }} ErrorDiffusionDitherConfig
	 *
	 * @typedef {(NoDitherConfig | OrderedDitherConfig | ErrorDiffusionDitherConfig) & BaseDitherConfig & Record<any,any>} DitherConfig
	 */
</script>

<script>
	import ImageDataCanvas from './ImageDataCanvas.svelte';
	import { errorDiffusionDithering } from './errorDiffusion';
	import { orderedDithering } from './ordered';

	/**
	 * @type {HTMLCanvasElement | null}
	 */
	export let canvas = null;

	/**
	 * @type {ImageData}
	 */
	export let image_data;

	/**
	 * @type {DitherConfig}
	 */
	export let config;
</script>

<div
	class="bg-gray-200 shadow-lg"
	style="width: 80vmin; aspect-ratio: {image_data.width / image_data.height};"
>
	{#if config.mode === 'error_diffusion'}
		{#if config.palette}
			<canvas
				class="pixelated w-full"
				bind:this={canvas}
				use:errorDiffusionDithering={{
					image: image_data,
					output_width: config.width,
					output_height: config.height,
					palette: config.palette,
					diffusionStrength: config.diffusionStrength,
					diffusionMatrix: config.diffusionMatrix,
					diffusionMatrixOriginX: config.diffusionMatrixOriginX
				}}
				width={config.width}
				height={config.height}
			/>
		{/if}
	{:else if config.mode === 'ordered'}
		{#if config.thresholdMap && config.palette}
			<canvas
				class="pixelated w-full"
				use:orderedDithering={{
					image: image_data,
					noiseIntensity: config.noiseIntensity,
					palette: config.palette,
					output_width: config.width,
					output_height: config.height,
					thresholdMap: config.thresholdMap
				}}
				bind:this={canvas}
				width={config.width}
				height={config.height}
				aria-label="Dithered Image"
			/>
		{/if}
	{:else if config.mode === 'none'}
		<ImageDataCanvas
			data={image_data}
			bind:canvas
			width={config.width}
			height={config.height}
			twClass="w-full"
		/>
	{/if}
</div>

<style>
	.pixelated {
		image-rendering: pixelated;
	}
</style>
