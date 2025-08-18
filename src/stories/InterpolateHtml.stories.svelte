<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	const { Story } = defineMeta({ title: 'Panera/Interpolate' });
</script>

<script>
	import { Panera, Html } from '$lib';
	let width = 800,
		height = 300;

	let t = 0;
	let pan;

	$: if (pan) {
		pan.interpolate(
			{ x: 0, y: 0, width, height },
			{ x: 80, y: 40, width: 200, height: 120 },
			{ t }
		);
	}
</script>

<Story name="HTML" asChild>
	<div class="g-title g-mb-10">HTML</div>

	<div class="g-input">
		<label>Interpolate:</label><input
			type="range"
			bind:value={t}
			min="0"
			max="1"
			step="0.01"
		/><span>{t}</span>
	</div>

	<Panera bind:this={pan} {width} {height}>
		<Html>
			<div
				style="position: absolute; left: 80px; top: 40px; width: 200px; height: 120px; background: tomato;"
			/>
		</Html>
	</Panera>
</Story>
