<script>
	import Tabs from './primitives/Tabs.svelte';
	import ErrorDiffusionOptions from './errorDiffusion/ErrorDiffusionOptions.svelte';
	import PaletteOptions from './palette/PaletteOptions.svelte';
	import OrderedDitheringOptions from './ordered/OrderedDitheringOptions.svelte';
	import DimensionsInput from './ImageSizeInput.svelte';
	import Checkbox from './primitives/Checkbox.svelte';

	/**
	 * @type {ImageData}
	 */
	export let image_data;

	/**
	 * @type {import('./DitheredImage.svelte').DitherConfig}
	 */
	export let config;

	$: aspectRatio = calculateAspectRatio(image_data);

	/**
	 * @param {ImageData | null} imgData
	 */
	function calculateAspectRatio(imgData) {
		if (!imgData) return 1;
		return imgData.width / imgData.height;
	}

	$: config.height = Math.round(config.width / aspectRatio);

	let useOriginalSize = true;
	let resizedWidth = image_data.width;

	$: config.width = useOriginalSize ? image_data.width : resizedWidth;
</script>

<div class="grid gap-4">
	<h2 class="text-base font-semibold leading-7 text-black">Output Image</h2>

	<Checkbox bind:checked={useOriginalSize} label="Original Size" />

	<DimensionsInput
		bind:width={resizedWidth}
		{aspectRatio}
		minWidth={12}
		minHeight={12}
		maxHeight={5000}
		maxWidth={5000}
		disabled={useOriginalSize}
	/>
</div>

<div class="grid gap-4">
	<h2 class="mb-2 text-base font-semibold leading-7 text-black">Dithering Options</h2>

	<Tabs
		tabs={[
			{ label: 'None', value: 'none' },
			{ label: 'Ordered', value: 'ordered' },
			{ label: 'Error Diffusion', value: 'error_diffusion' }
		]}
		bind:selected={config.mode}
	/>

	<div class={config.mode === 'error_diffusion' ? 'contents' : 'hidden'}>
		<ErrorDiffusionOptions
			bind:diffusionStrength={config.diffusionStrength}
			bind:diffusionMatrix={config.diffusionMatrix}
			bind:diffusionOriginX={config.diffusionMatrixOriginX}
		/>
	</div>
	<div class={config.mode === 'ordered' ? 'contents' : 'hidden'}>
		<OrderedDitheringOptions
			bind:thresholdMap={config.thresholdMap}
			bind:noiseIntensity={config.noiseIntensity}
		/>
	</div>
</div>

<!--Color Palette-->
<div class="grid gap-3" class:hidden={config.mode === 'none'}>
	<h2 class="mb-2 text-base font-semibold leading-7 text-black">Colors</h2>

	<PaletteOptions bind:palette={config.palette} image={image_data} />
</div>
