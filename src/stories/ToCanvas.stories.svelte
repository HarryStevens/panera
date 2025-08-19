<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	const { Story } = defineMeta({ title: 'Panera/To' });
</script>

<script>
	import { Panera, Canvas } from '$lib';
	let width = 800,
		height = 300;

	let pan;

	function reset() {
		pan.reset();
	}
	function to() {
		pan.to({ x: 80, y: 40, width: 200, height: 120 }, { duration: 600 });
	}
	function render(ctx) {
		ctx.beginPath();
		ctx.fillStyle = 'tomato';
		ctx.fillRect(80, 40, 200, 120);
	}
</script>

<Story name="Canvas" asChild>
	<div class="g-title g-mb-10">Canvas</div>
	<button on:click={reset}>Reset</button>
	<button on:click={to} style="margin-left:8px;">Zoom to rect</button>

	<Panera bind:this={pan} {width} {height}>
		<Canvas {render} />
	</Panera>
</Story>
