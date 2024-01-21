<script>
	import '$lib/styles/bootstrap.css';
	import { loadImageFile } from './utils.js';
	import og_image from '$lib/assets/og.webp';
	import logo from '$lib/assets/dither-studio-logo.png';
	import ImageSelectionScreen from './ImageSelectionScreen.svelte';
	import DitherStudio from './DitherStudio.svelte';
	import { getImageData } from '$lib/utils/loadImage';

	/**
	 * @type {ImageData | null}
	 */
	let image_data = null;

	/**
	 * @param {DragEvent} e
	 */
	async function onDrop(e) {
		const file = e.dataTransfer?.files[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Please drop an image file');
			return;
		}

		try {
			const loaded_image = await loadImageFile(file);
			image_data = getImageData(loaded_image);
		} catch (e) {
			alert('Failed to load image');
			console.error(e);
		}
	}
</script>

<svelte:body on:drop|preventDefault={onDrop} on:dragover|preventDefault={() => {}} />

<svelte:head>
	<title>Dither Studio</title>
	<meta
		name="description"
		content="The most performant online dithering tool. Supports all common Ordered Dithering and Error Diffutision algorithms, with custom color-palettes."
	/>
	<meta name="og:image" content={og_image} />
	<meta name="author" content="Loris Sigrist" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@loris_sigrist" />
	<meta name="twitter:creator" content="@loris_sigrist" />
	<meta name="twitter:title" content="Dither Studio" />

	<meta
		name="twitter:description"
		content="The most performant online dithering tool. Supports all common Ordered Dithering and Error Diffutision algorithms, with custom color-palettes."
	/>
	<meta name="twitter:image" content={og_image} />
	<meta name="twitter:image:alt" content="Dither Studio" />
	<meta name="twitter:domain" content="https://dithering.sigrist.dev" />

	<link rel="icon" href={logo} />
</svelte:head>

<main class="max-w-screen relative h-screen max-h-screen w-screen bg-gray-300">
	{#if image_data}
		<DitherStudio {image_data} on:cancel={() => (image_data = null)} />
	{:else}
		<ImageSelectionScreen on:image={(e) => (image_data = getImageData(e.detail))} />
	{/if}
</main>
