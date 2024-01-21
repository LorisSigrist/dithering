<script>
	import { createEventDispatcher } from 'svelte';
	import cat_img_src from './images/cat.jpg';
	import david_img_src from './images/david.png';
	import radial_gradient_img_src from './images/radial.png';
	import { loadImageFile } from './utils';
	import { Icon, Plus } from 'svelte-hero-icons';
	import logo_src from '$lib/assets/dither-studio-logo.png';

	const imagePresets = [radial_gradient_img_src, david_img_src, cat_img_src];

	/**
	 * @type {import("svelte").EventDispatcher<{image: HTMLImageElement}>}
	 */
	const dispatch = createEventDispatcher();

	/**
	 * @param {any} e
	 */
	async function onInput(e) {
		const file = e.target.files[0];
		if (!file) return;

		try {
			dispatch('image', await loadImageFile(file));
		} catch (e) {
			alert('Failed to load image');
			console.error(e);
		}
	}

	/**
	 * @param {string} url
	 */
	async function loadFromSrc(url) {
		const new_image = new Image();
		new_image.onload = () => {
			dispatch('image', new_image);
		};
		new_image.src = url;
	}
</script>

<img
	src={logo_src}
	alt="Dither Studio"
	class="fixed left-0 top-0 m-4 h-12 w-12 rounded-full shadow-lg"
	style="image-rendering: pixelated;"
/>

<div class="grid h-full w-full place-items-center px-8">
	<div class="grid gap-4">
		<p class="text-center text-2xl text-gray-500">Select or Drop an Image to Start</p>

		<div class="flex flex-wrap justify-center gap-3">
			{#each imagePresets as url}
				<button on:click={() => loadFromSrc(url)} class="transition-opacity hover:opacity-75">
					<img
						class="aspect-square h-24 w-24 rounded-md border-2 border-white object-cover shadow-md"
						src={url}
						alt=""
					/>
				</button>
			{/each}

			<label
				for="image-input"
				class="spect-square block h-24 w-24 rounded-md border-2 border-white bg-white object-cover shadow-md hover:bg-gray-100"
			>
				<div class="grid h-full w-full place-items-center">
					<Icon src={Plus} class="h-12 w-12 text-gray-400" />
				</div>

				<span class="sr-only">Choose an Image</span>

				<input type="file" class="sr-only" id="image-input" accept="image/*" on:input={onInput} />
			</label>
		</div>
	</div>
</div>
