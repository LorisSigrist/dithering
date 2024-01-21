<script>
	export let disabled = false;

	const appearance = {
		normal: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500',
		disabled: 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
	};
</script>

<button
	{disabled}
	type="button"
	class="{appearance[
		disabled ? 'disabled' : 'normal'
	]} flex items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
	on:click
>
	<slot />
</button>
