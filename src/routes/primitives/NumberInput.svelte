<script>
	import { ID } from '$lib/math/id-generation.js';

	/**
	 * @type {string}
	 */
	export let label = '';

	/**
	 * @type {string | null}
	 */
	export let name = null;

	/**
	 * @type {boolean}
	 */
	export let required = false;

	/**
	 * @type {string | null}
	 */
	export let placeholder = null;

	/**
	 * @type {HTMLInputElement | null}
	 */
	export let input = null;

	const id = ID();
</script>

<div>
	<label for={id} class="sr-only">{label}</label>
	<input
		type="number"
		{name}
		{id}
		{required}
		on:input
		on:change
		bind:this={input}
		class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
		{placeholder}
	/>
</div>
