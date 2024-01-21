<script>
	import PaletteInput from './PaletteInput.svelte';
	import { getPalette } from './color-extraction/index.js';
	import { hexToRGB } from '../utils';
	import { generatePaletteInWorker } from './main.js';
	import { browser } from '$app/environment';
	import { clamp } from '$lib/math/clamp';
	import Checkbox from '../primitives/Checkbox.svelte';

	const MAX_EXTRACTED_COLORS = 256;
	const MIN_EXTRACTED_COLORS = 2;

	/**
	 * @type {ImageData | null}
	 */
	export let image = null;

	/**
	 * @type {ImageData | null}
	 */
	export let palette = null;

	/**
	 * @type {import('../utils').RGB[]}
	 */
	export let colors = ['#000000', '#ffffff'].map(hexToRGB);

	const presets = [
		{
			name: 'Black and White',
			palette: ['#000000', '#ffffff'].map(hexToRGB)
		},
		{
			name: '3Bit',
			palette: [
				'#000000',
				'#ffffff',
				'#ff0000',
				'#00ff00',
				'#0000ff',
				'#ffff00',
				'#00ffff',
				'#ff00ff'
			].map(hexToRGB)
		},
		{
			name: 'Grayscale',
			palette: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'].map(hexToRGB)
		},
		{
			name: 'Red',
			palette: ['#000000', '#F46842', '#AA2F0D', '#ffffff'].map(hexToRGB)
		},
		{
			name: 'RGBY',
			palette: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'].map(hexToRGB)
		},
		{
			name: 'Black, White, Red',
			palette: ['#000000', '#ffffff', '#ff0000'].map(hexToRGB)
		},
		{
			name: 'Black, White, Yellow',
			palette: ['#000000', '#ffffff', '#ffff00'].map(hexToRGB)
		},
		{
			name: 'Macintosh',
			palette: ['#33321A', '#E5FEFF'].map(hexToRGB)
		},
		{
			name: 'IBM 5151',
			palette: ['#00EB61', '#25332F'].map(hexToRGB)
		},
		{
			name: 'Zenith ZVM 1240',
			palette: ['#40291e', '#fdca55'].map(hexToRGB)
		},
		{
			name: 'Commodore 1084',
			palette: ['#423091', '#88d7de'].map(hexToRGB)
		},
		{
			name: 'IBM 8503',
			palette: ['#25332F', '#EBE5CE'].map(hexToRGB)
		},
		{
			name: 'Game Boy DMG-01',
			palette: ['#CADC9F', '#0F380F', '#306230', '#8BAC0F', '#9BBC0F'].map(hexToRGB)
		},
		{
			name: 'MS Paint Vista',
			palette: [
				'#000000',
				'#464646',
				'#787878',
				'#b4b4b4',
				'#dcdcdc',
				'#ffffff',
				'#990030',
				'#9c5a3c',
				'#ed1c24',
				'#ffa3b1',
				'#ff7e00',
				'#e5aa7a',
				'#ffc20e',
				'#f5e49c',
				'#fff200',
				'#fff9bd',
				'#a8e61d',
				'#d3f9bc',
				'#22b14c',
				'#9dbb61',
				'#00b7ef',
				'#99d9ea',
				'#4d6df3',
				'#709ad1',
				'#2f3699',
				'#546d8e',
				'#6f3198',
				'#b5a5d5'
			].map(hexToRGB)
		}
	];

	/**
	 * @param {ImageData} imgData
	 * @param {number} numColors
	 * @returns {Promise<import("../utils.js").RGB[]>}
	 */
	async function generatePalette(imgData, numColors) {
		const colors = getPalette(imgData, numColors, 5);
		if (!colors) throw new Error('Failed to generate palette');
		return colors;
	}

	$: if (browser) {
		generatePaletteInWorker(colors).then((generatedPalette) => (palette = generatedPalette));
	}

	let generate_palette = true;
	let num_colors = 16;

	/**
	 * @param {Event} e
	 */
	function onPresetInput(e) {
		const target = /** @type {HTMLInputElement}*/ (e.target);
		const value = target.value;
		colors = presets[Number(value)].palette;

		target.value = '-1';
	}

	/**
	 * @type { HTMLInputElement | null}
	 */
	let generate_palette_input = null;

	function reExtractColors() {
		generate_palette = generate_palette_input?.checked ?? true;

		if (!image) return;
		if (generate_palette) {
			generatePalette(image, clamp(num_colors, MIN_EXTRACTED_COLORS, MAX_EXTRACTED_COLORS)).then(
				(generatedPalette) => (colors = generatedPalette)
			);
		}
	}

	if (browser && image) {
		reExtractColors();
	}
</script>

<fieldset class="grid gap-4">
	<Checkbox
		bind:checked={generate_palette}
		bind:input={generate_palette_input}
		on:input={reExtractColors}
		label="Extract Colors from Image"
	/>

	{#if generate_palette}
		<label class="flex items-center justify-between">
			<span class="text-sm font-medium text-gray-900">Number of Colors</span>
			<input
				type="number"
				bind:value={num_colors}
				on:blur={() => {
					num_colors = clamp(num_colors, MIN_EXTRACTED_COLORS, MAX_EXTRACTED_COLORS);
					console.log(num_colors);
				}}
				min={MIN_EXTRACTED_COLORS}
				max={MAX_EXTRACTED_COLORS}
				on:input={reExtractColors}
				class="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
			/>
		</label>
	{:else}
		<select
			on:input={onPresetInput}
			class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
		>
			<option value={-1} selected disabled> Choose a Preset </option>
			{#each presets as { name }, i}
				<option value={i}> {name} </option>
			{/each}
		</select>
	{/if}

	<PaletteInput bind:colors />
</fieldset>
