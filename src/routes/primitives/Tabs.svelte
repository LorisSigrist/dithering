<script context="module">
	/**
	 * @typedef {{ label: string; value: string; }} Tab
	 */
</script>

<!--
    @component
    @template {Tab[]} Tabs
-->
<script>
	/** @type {Tabs}*/
	export let tabs;

	/** @type {Tabs[number]['value']} */
	export let selected;
</script>

<nav class="flex w-full">
	{#each tabs as tab}
		<label class="flex-1">
			<input type="radio" name="tabs" value={tab.value} bind:group={selected} class="sr-only" />
			<div
				class="flex items-center justify-center border-b py-2 text-sm font-medium text-gray-700 {tab.value ===
				selected
					? 'border-b-2 border-indigo-500'
					: 'border-gray-300'} cursor-pointer hover:bg-gray-900 hover:bg-opacity-5"
			>
				{tab.label}
			</div>
		</label>
	{/each}
</nav>
