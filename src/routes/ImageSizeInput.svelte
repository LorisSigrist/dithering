<script>
	import { ID } from '$lib/math/id-generation.js';
	import { Icon, LockClosed } from 'svelte-hero-icons';

	/** @type {number}	 */
	export let width;
	/** @type {number}	 */
	export let aspectRatio;

	/** @type {number | null}	 */
	export let maxWidth = null;
	/** @type {number | null}	 */
	export let maxHeight = null;

	/** @type {number | null}	 */
	export let minWidth = null;
	/** @type {number | null}	 */
	export let minHeight = null;

	/** @type {boolean}	 */
	export let disabled = false;

	/** @param {any} e */
	function onWidthInput(e) {
		const newWidth = e.target.value;
		if (!newWidth) return;
		if (minWidth !== null && newWidth < minWidth) return;
		if (maxWidth !== null && newWidth > maxWidth) return;
		width = newWidth;
	}

	$: height = Math.round(width / aspectRatio);

	/** @param {any} e */
	function onHeightInput(e) {
		const height = e.target.value;
		if (!height) return;
		if (minHeight !== null && height < minHeight) return;
		if (maxHeight !== null && height > maxHeight) return;
		width = Math.round(aspectRatio * height);
	}

	let withId = ID();
	let heightId = ID();
</script>

<fieldset class="flex items-end justify-between gap-3">
	<div class="w-full">
		<label
			for="width-{withId}"
			class="block text-sm font-medium leading-6 {disabled ? 'text-gray-400' : 'text-gray-900'}"
			>Width</label
		>
		<div class="relative mt-2 rounded-md {disabled ? 'shadow-none' : 'shadow-sm'}">
			<input
				name="width"
				id="width-{withId}"
				type="number"
				min={minWidth}
				max={maxWidth}
				{disabled}
				step="1"
				value={width}
				on:input={onWidthInput}
				class="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-white
				disabled:text-gray-400 disabled:ring-gray-200 sm:text-sm sm:leading-6"
				placeholder="600"
			/>
			<div
				class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
			>
				px
			</div>
		</div>
	</div>

	<span class=" cursor-not-allowed pb-2 {disabled ? 'text-gray-300' : 'text-gray-500'}">
		<Icon src={LockClosed} class="h-4 w-4" solid />
	</span>
	<div class="w-full">
		<label
			for="height-{heightId}"
			class="block text-sm font-medium leading-6 {disabled ? 'text-gray-400' : 'text-gray-900'}"
			>Height</label
		>
		<div class="relative mt-2 rounded-md {disabled ? 'shadow-none' : 'shadow-sm'}">
			<input
				type="number"
				id="height-{heightId}"
				name="height"
				min={minHeight}
				max={maxHeight}
				step="1"
				value={height}
				{disabled}
				on:input={onHeightInput}
				class="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-white
				disabled:text-gray-400 disabled:ring-gray-200 sm:text-sm sm:leading-6"
				placeholder="340"
			/>
			<div
				class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
			>
				px
			</div>
		</div>
	</div>
</fieldset>
