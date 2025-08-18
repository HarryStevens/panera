<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	const { Story } = defineMeta({ title: 'Panera/To' });
</script>

<script>
	import { Panera, Html } from '$lib';
	let width = 800,
		height = 300;

	let pan;

	function reset() {
		pan.reset();
	}
	function to() {
		pan.to({ x: 80, y: 40, width: 200, height: 120, duration: 600 });
	}
</script>

<Story name="HTML" asChild>
	<div class="g-title g-mb-10">HTML</div>

	<button on:click={reset}>Reset</button>
	<button on:click={to} style="margin-left:8px;">Zoom to rect</button>

	<Panera bind:this={pan} {width} {height}>
		<Html>
			<div
				style="position: absolute; left: 80px; top: 40px; width: 200px; height: 120px; background: tomato;"
			/>
		</Html>
	</Panera>
</Story>
