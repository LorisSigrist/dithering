<script>
	import { Icon, Plus, XMark } from 'svelte-hero-icons';
	import { hexToRGB } from '../utils';
	import { rgbToHex } from '$lib/utils/colorHex';

	/**
	 * @type {import('../utils').RGB[]}
	 */
	export let colors;

	function addColor() {
		colors = [...colors, randomColor()];
	}

	/** @param {number} index */
	function removeColor(index) {
		colors = colors.filter((_, i) => i !== index);
	}

	/**
	 * @param { Event} e
	 * @param {number} index
	 */
	function onInput(e, index) {
		const target = /** @type {HTMLInputElement}*/ (e.target);
		const value = target.value;
		colors[index] = hexToRGB(value);
	}

	/**
	 * @returns {import("../utils").RGB}
	 */
	function randomColor() {
		return /** @type { import("../utils").RGB}*/ (
			[Math.random() * 255, Math.random() * 255, Math.random() * 255].map(Math.round)
		);
	}
</script>

<ul class="grid grid-cols-3 gap-2">
	{#each colors as color, index}
		{@const hex = rgbToHex(...color)}
		<li style="background-color: {hex}" class="relative h-10 rounded-md">
			<input
				type="color"
				value={hex}
				on:input={(e) => onInput(e, index)}
				class="absolute inset-0 h-full w-full opacity-0"
			/>

			<button
				on:click={() => removeColor(index)}
				class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 p-1"
			>
				<Icon src={XMark} class="h-4 w-4 text-white" />
			</button>
		</li>
	{/each}
	<li>
		<button
			on:click={addColor}
			class="flex h-10 w-full items-center justify-center gap-1 rounded-md bg-emerald-500 text-white"
		>
			<Icon src={Plus} class="h-4 w-4" />
			<span>Color</span>
		</button>
	</li>
</ul>
