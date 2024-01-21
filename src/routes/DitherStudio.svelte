<script>
	import '$lib/styles/bootstrap.css';
	import { ArrowDownTray, ChevronDown, ChevronUp, Icon, XMark } from 'svelte-hero-icons';
	import Button from './primitives/Button.svelte';
	import { saveCanvasAsImage } from './utils';
	import SplitPanzoom from './SplitPanzoom.svelte';
	import DitheredImage from './DitheredImage.svelte';
	import DitherOptions from './DitherOptions.svelte';
	import { createEventDispatcher } from 'svelte';

	/**
	 * @type {import("svelte").EventDispatcher<{cancel: void}>}
	 */
	const dispatch = createEventDispatcher();

	/**
	 * @type {HTMLCanvasElement | null}
	 */
	let canvas_left = null;

	/**
	 * @type {HTMLCanvasElement | null}
	 */
	let canvas_right = null;

	let width = 300;
	$: height = Math.round(width / aspectRatio);

	/**
	 * @type {ImageData}
	 */
	export let image_data;

	$: aspectRatio = calculateAspectRatio(image_data);

	/**
	 * @param {ImageData | null} imgData
	 */
	function calculateAspectRatio(imgData) {
		if (!imgData) return 1;
		return imgData.width / imgData.height;
	}

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	async function save(canvas) {
		if (!canvas) return;
		await saveCanvasAsImage(canvas, 'dithered', 'png');
	}

	/**
	 * @type {import('./DitheredImage.svelte').DitherConfig}
	 */
	let config_right = {
		mode: 'ordered',
		width,
		height,
		thresholdMap: null,
		noiseIntensity: 0.08,
		palette: null,
		diffusionStrength: 1,
		diffusionMatrix: [[1]],
		diffusionMatrixOriginX: 0
	};

	/**
	 * @type {import('./DitheredImage.svelte').DitherConfig}
	 */
	let config_left = {
		mode: 'none',
		width: image_data.width,
		height: image_data.height,
		thresholdMap: null,
		noiseIntensity: 0.08,
		palette: null,
		diffusionStrength: 1,
		diffusionMatrix: [[1]],
		diffusionMatrixOriginX: 0
	};

	let options_left_open = false;
	let options_right_open = true;
</script>

<!--Main content-->
<section class="fixed inset-0 select-none overflow-hidden">
	<div class="relative h-full w-full">
		<SplitPanzoom>
			<DitheredImage slot="left" bind:canvas={canvas_left} config={config_left} {image_data} />
			<DitheredImage slot="right" bind:canvas={canvas_right} config={config_right} {image_data} />
		</SplitPanzoom>
	</div>
</section>

<section class="gui-container pointer-events-none touch-none">
	<header class="header">
		<button
			class="pointer-events-auto touch-auto rounded-full bg-black bg-opacity-40 p-2"
			on:click={() => dispatch('cancel')}
			title="Close Image & Reset"
		>
			<Icon src={XMark} class="h-5 w-5 text-white" />
		</button>
	</header>

	<aside
		style="overflow: hidden;"
		class="
		options-left
		pointer-events-auto
		flex
		max-h-full touch-auto
		flex-col
		rounded-md border border-gray-200
		"
	>
		<header
			class="z-10 flex flex-shrink-0 items-center justify-between gap-2 bg-white px-4 py-4 shadow-sm"
		>
			<button class="contents" on:click={() => (options_left_open = !options_left_open)}>
				<Icon src={options_left_open ? ChevronDown : ChevronUp} class="h-6 w-6 text-gray-500" />
			</button>
			<div class="flex flex-1 items-center justify-between">
				<h1 class="font-bold">Options</h1>
				<Button
					on:click={() => {
						if (!canvas_left) return;
						save(canvas_left);
					}}
					disabled={!image_data}
				>
					<Icon src={ArrowDownTray} class="h-4 w-4" />
					Save
				</Button>
			</div>
		</header>
		<div
			class:hidden={!options_left_open}
			class="flex max-h-full flex-1 flex-col gap-8 overflow-y-scroll bg-gray-50 p-4 py-8"
		>
			<DitherOptions bind:config={config_left} bind:image_data />
		</div>
	</aside>
	<aside
		style="overflow: hidden;"
		class="
		options-right
		pointer-events-auto
		flex
		max-h-full touch-auto
		flex-col
		rounded-md border border-gray-200
		"
	>
		<header
			class="z-10 flex flex-shrink-0 items-center justify-between gap-2 bg-white px-4 py-4 shadow-sm"
		>
			<button class="contents" on:click={() => (options_right_open = !options_right_open)}>
				<Icon src={options_right_open ? ChevronDown : ChevronUp} class="h-6 w-6 text-gray-500" />
			</button>
			<div class="flex flex-1 items-center justify-between">
				<h1 class="font-bold">Options</h1>
				<Button
					on:click={() => {
						if (!canvas_right) return;
						save(canvas_right);
					}}
					disabled={!image_data}
				>
					<Icon src={ArrowDownTray} class="h-4 w-4" />
					Save
				</Button>
			</div>
		</header>
		<div
			class:hidden={!options_right_open}
			class="flex max-h-full flex-1 flex-col gap-8 overflow-y-scroll bg-gray-50 p-4 py-8"
		>
			<DitherOptions bind:config={config_right} bind:image_data />
		</div>
	</aside>
</section>

<style>
	.gui-container {
		position: fixed;
		inset: 0;
		padding: 12px;
		gap: 12px;

		/*
			on small screens: two rows aligned to the bottom
		*/
		display: grid;
		grid-template-areas:
			'header'
			'left'
			'right';
		grid-template-columns: 1fr;
		grid-template-rows: 1fr auto auto;
	}

	.options-left {
		width: 100%;

		max-height: 40vh;
	}

	.options-right {
		width: 100%;

		max-height: 40vh;
	}

	.header {
		grid-area: header;
		align-self: start;
	}

	@media (min-width: 768px) {
		.gui-container {
			grid-template-rows: max-content 1fr;
			grid-template-columns: max-content 1fr max-content;
			grid-template-areas:
				'header header header'
				'left viewportOpts right';
		}

		.options-left {
			grid-area: left;
			align-self: end;
			width: 350px;

			max-height: 100%;
		}

		.options-right {
			grid-area: right;
			align-self: end;
			width: 350px;

			max-height: 100%;
		}
	}
</style>
