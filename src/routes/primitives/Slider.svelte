<script>
	/** @type {string}*/
	export let label;

	/** @type {string | undefined}*/
	export let name = undefined;

	/** @type {number | null}*/
	export let min = null;

	/** @type {number | null}*/
	export let max = null;

	/** @type {number}*/
	export let value = 0;
	/** @type {number}*/
	export let step = 1;

	let id =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
</script>

<div>
	<label for={id} class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
		>{label}</label
	>
	<input
		{id}
		type="range"
		bind:value
		{min}
		{max}
		{step}
		{name}
		class="mb-6 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white accent-indigo-600 shadow-sm ring-1 ring-gray-300 dark:bg-gray-700"
	/>
</div>
