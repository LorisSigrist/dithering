<script>
	import Select from '../primitives/Select.svelte';
	import Slider from '../primitives/Slider.svelte';
	import DimensionsInput from '../ImageSizeInput.svelte';
	import ImageDataViewer from '../ImageDataViewer.svelte';
	import { generateThresholdMap } from '../thresholdMapGeneration/main';

	/** @type {ImageData | null} */
	export let thresholdMap;

	/** @type {number} */
	export let noiseIntensity;

	/**
	 * @typedef {'bayer' | 'blue_noise' | 'white_noise'} ThresholdMapMode
	 */

	/** @type {ThresholdMapMode} */
	let thresholdMode = 'bayer';

	/** @type {import("../primitives/Select.svelte").Options<ThresholdMapMode>} */
	const thresholdMapOptions = [
		{
			name: 'Bayer',
			value: 'bayer'
		},
		{
			name: 'Blue Noise',
			value: 'blue_noise'
		},
		{
			name: 'White Noise',
			value: 'white_noise'
		}
	];

	let bayer_level = 3;
	let white_noise_width = 256;
	$: white_noise_height = white_noise_width;

	$: {
		if ('ImageData' in globalThis) {
			/** @type {import("../thresholdMapGeneration/generation").ThresholdMapOptions} */
			let options;

			switch (thresholdMode) {
				case 'bayer':
					options = {
						mode: 'bayer',
						level: bayer_level
					};
					break;
				case 'blue_noise':
					options = {
						mode: 'blue_noise'
					};
					break;
				case 'white_noise':
					options = {
						mode: 'white_noise',
						width: white_noise_width,
						height: white_noise_height
					};
					break;
			}

			generateThresholdMap(options).then((map) => (thresholdMap = map));
		}
	}
</script>

<Slider
	label="Noise Intensity ({noiseIntensity})"
	min={0}
	max={1.5}
	step={0.01}
	bind:value={noiseIntensity}
/>

<Select label="Threshold Map" options={thresholdMapOptions} bind:selected={thresholdMode} />

{#if thresholdMode === 'bayer'}
	<Slider label="Bayer Level ({bayer_level})" min={0} max={5} step={1} bind:value={bayer_level} />
{/if}

{#if thresholdMode === 'white_noise'}
	<DimensionsInput
		bind:width={white_noise_width}
		aspectRatio={1}
		minWidth={1}
		minHeight={1}
		maxHeight={3000}
		maxWidth={3000}
	/>
{/if}

<ImageDataViewer imageData={thresholdMap}>
	<span slot="placeholder">Loading Threshold Map</span>
</ImageDataViewer>
