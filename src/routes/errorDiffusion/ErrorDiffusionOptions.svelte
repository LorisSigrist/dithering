<script>
	import Slider from '../primitives/Slider.svelte';
	import Select from '../primitives/Select.svelte';

	/** @type {number} */
	export let diffusionStrength;

	/** @type {number[][]} */
	export let diffusionMatrix;

	/** @type {number} */
	export let diffusionOriginX;

	/**
	 * @typedef {'basic' | 'floyd_steinberg' | 'atkinson' | 'jarvis_judice_ninke'} ErrorDiffusionMode
	 */

	/** @type {ErrorDiffusionMode}*/
	let errorDiffusionMode = 'floyd_steinberg';

	const errorDiffusionOptions = [
		{
			name: 'Basic',
			value: 'basic'
		},
		{
			name: 'Floyd-Steinberg',
			value: 'floyd_steinberg'
		},
		{
			name: 'Atkinson',
			value: 'atkinson'
		},
		{
			name: 'Jarvis-Judice-Ninke',
			value: 'jarvis_judice_ninke'
		}
	];

	/**
	 * @type {Record<ErrorDiffusionMode, { matrix: number[][], originX: number }>}
	 */
	const errorDiffusionPresets = {
		basic: {
			matrix: [
				[0, 1 / 2],
				[1 / 2, 0]
			],
			originX: 0
		},
		floyd_steinberg: {
			matrix: [
				[0, 0, 7 / 16],
				[3 / 16, 5 / 16, 1 / 16]
			],
			originX: 1
		},
		atkinson: {
			matrix: [
				[0, 0, 1 / 8, 1 / 8],
				[1 / 8, 1 / 8, 1 / 8, 0],
				[0, 1 / 8, 0, 0]
			],
			originX: 1
		},
		jarvis_judice_ninke: {
			matrix: [
				[0, 0, 0, 7 / 48, 5 / 48],
				[3 / 48, 5 / 48, 7 / 48, 5 / 48, 3 / 48],
				[1 / 48, 3 / 48, 5 / 48, 3 / 48, 1 / 48]
			],
			originX: 2
		}
	};

	$: {
		const { matrix, originX } = errorDiffusionPresets[errorDiffusionMode];
		diffusionMatrix = matrix;
		diffusionOriginX = originX;
	}
</script>

<Select label="Diffusion Mode" options={errorDiffusionOptions} bind:selected={errorDiffusionMode} />

<Slider
	label="Diffusion Strength ({diffusionStrength})"
	min={0}
	max={2}
	step={0.01}
	bind:value={diffusionStrength}
/>
