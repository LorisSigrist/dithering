<script context="module">
	/**
	 * @typedef {{ name: string; value: string }} Option
	 */

	/**
	 * @template {string} Value
	 * @typedef {readonly ({ name: string; value: Value; })[]} Options
	 */

	/**
	 * @typedef {Options<string>} AnyOptions
	 */
</script>

<!--
	@component
	@template {AnyOptions} O
-->
<script>
	import { ID } from '$lib/math/id-generation.js';

	/**
	 * @type {O}
	 */
	export let options;

	/**
	 * @type {O[number]['value']}
	 */
	export let selected;

	/** @type {string}*/
	export let label;

	/** @type {string | undefined}*/
	export let name = undefined;

	const id = ID();
</script>

<div>
	<label for={id} class="block text-sm font-medium leading-6 text-gray-900">{label}</label>
	<select
		{id}
		{name}
		bind:value={selected}
		class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
	>
		{#each options as option}
			<option value={option.value} selected={option.value === selected}>{option.name}</option>
		{/each}
	</select>
</div>
