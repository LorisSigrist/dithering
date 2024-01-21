<script>
	import { ArrowsRightLeft, Icon } from 'svelte-hero-icons';
	import { Panzoom } from '$lib/interactions/panzoom';
	import { clamp } from '$lib/math/clamp';
	import { onMount } from 'svelte';

	/**
	 * @type {'horizontal' | 'vertical'}
	 */
	export let direction = 'horizontal';

	/**
	 * @type {HTMLDivElement | null}
	 */
	let container = null;

	//The percentage of the screen that the split is at
	export let split = 50;

	/**
	 * @param {HTMLElement} element
	 */
	function drag(element) {
		element.addEventListener('pointerdown', (event) => {
			const startPx = direction === 'vertical' ? event.clientY : event.clientX;
			const startSplit = split;

			const previousCursor = document.body.style.cursor;
			document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ew-resize';

			/**
			 * @param {PointerEvent} event
			 */
			const pointermove = (event) => {
				const containerWidth = container ? container.clientWidth : window.innerWidth;
				const containerHeight = container ? container.clientHeight : window.innerHeight;

				const containerSize = direction === 'vertical' ? containerHeight : containerWidth;

				const newPx = direction === 'vertical' ? event.clientY : event.clientX;

				const d = newPx - startPx;
				const inherentSplit = startSplit + (d / containerSize) * 100;
				split = clamp(inherentSplit, 0, 100);
			};

			const pointerup = () => {
				document.body.style.cursor = previousCursor; //reset cursor
				window.removeEventListener('pointermove', pointermove);
				window.removeEventListener('pointerup', pointerup);
				window.removeEventListener('pointercancel', pointerup);
			};

			window.addEventListener('pointermove', pointermove);
			window.addEventListener('pointerup', pointerup);
			window.addEventListener('pointercancel', pointerup);
		});

		return {
			destroy() {
				element.removeEventListener('pointerdown', () => {});
			}
		};
	}

	/**
	 * @type {string}
	 */
	let pzTransform = 'transform: none;';

	/**
	 * @param {HTMLElement} element
	 */
	function panzoomAction(element) {
		const pz = new Panzoom(element);

		/**
		 * @param {import("$lib/interactions/panzoom").TransformChangeEvent} e
		 */
		function panzoomChange(e) {
			const { matrix } = e.detail;
			pzTransform = `transform: ${matrix.toString()};`; //matrix(${scale}, 0, 0, ${scale}, ${x}, ${y});`
		}

		pz.addEventListener('panzoom:change', panzoomChange);

		return {
			destroy() {
				pz.removeEventListener('panzoom:change', panzoomChange);
				pz.destroy();
			}
		};
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');

		/**
		 * @param {MediaQueryListEvent | MediaQueryList} e
		 */
		function handleOrientationChange(e) {
			direction = e.matches ? 'horizontal' : 'vertical';
		}

		mediaQuery.addEventListener('change', handleOrientationChange);
		handleOrientationChange(mediaQuery);
		return () => mediaQuery.removeEventListener('change', handleOrientationChange);
	});
</script>

<div
	class="pz-container"
	class:vertical={direction === 'vertical'}
	style:--split-point={split + '%'}
	bind:this={container}
>
	<div class="grid h-full w-full place-items-center" use:panzoomAction>
		<div class="mask-left">
			<div style={pzTransform} class="grid h-full w-full origin-top-left place-items-center">
				<slot name="left" />
			</div>
		</div>

		<div class="mask-right">
			<div style={pzTransform} class="grid h-full w-full origin-top-left place-items-center">
				<slot name="right" />
			</div>
		</div>
	</div>
	<div class="handle relative shadow-lg" use:drag on:pointercancel|preventDefault={() => {}}>
		<div
			class="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform place-items-center rounded-full bg-black"
			class:rotate-90={direction === 'vertical'}
		>
			<Icon src={ArrowsRightLeft} class="h-6 w-6 text-white" />
		</div>
	</div>
</div>

<style>
	.pz-container {
		position: relative;
		width: 100%;
		height: 100%;
		touch-action: none;
	}

	.mask-left {
		position: absolute;
		inset: 0;
		clip-path: inset(0 calc(100% - var(--split-point)) 0 0);
	}

	.vertical .mask-left {
		clip-path: inset(0 0 calc(100% - var(--split-point)) 0);
	}

	.mask-right {
		position: absolute;
		inset: 0;
		clip-path: inset(0 0 0 var(--split-point));
	}

	.vertical .mask-right {
		clip-path: inset(calc(var(--split-point)) 0 0 0);
	}

	.handle {
		position: absolute;
		touch-action: none;
		top: 0;
		bottom: 0;
		left: var(--split-point);
		transform: translateX(-50%);
		width: 4px;
		background: rgba(0, 0, 0, 1);

		cursor: ew-resize;
	}

	.vertical .handle {
		top: var(--split-point);
		left: 0;
		right: 0;
		width: unset;
		transform: translateY(-50%);
		height: 4px;

		cursor: ns-resize;
	}
</style>
