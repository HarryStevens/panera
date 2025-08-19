<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	const { Story } = defineMeta({ title: 'Panera/To' });
</script>

<script>
	import { Panera, Svg, Canvas, Html } from '$lib';
	import { easingMap, easingOptions } from './_shared.js';

	let svg, canvas, html;
	let rect, circle;
	let width,
		height = 100;

	let selectedBound = true;
	let selectedDebug = false;
	let selectedDuration = 1000;
	let selectedEase = 'cubicInOut';

	function reset() {
		svg.reset();
		canvas.reset();
		html.reset();
	}
	function to(element) {
		const box = element.getBBox();
		svg.to(box);
		canvas.to(box);
		html.to(box);
	}

	function render(ctx) {
		if (!rect || !circle) return;

		const rb = rect.getBBox();
		ctx.fillStyle = 'tomato';
		ctx.fillRect(rb.x, rb.y, rb.width, rb.height);

		const cb = circle.getBBox();
		const r = cb.width / 2;
		ctx.arc(cb.x + r, cb.y + r, r, 0, Math.PI * 2);
		ctx.fillStyle = 'steelblue';
		ctx.fill();
	}
</script>

<Story name="Sync" asChild>
	<div class="g-container" bind:clientWidth={width}>
		<div class="g-controls">
			<div class="g-inputs">
				<div class="g-input">
					<label for="input-ease">Easing:</label>
					<select id="input-ease" bind:value={selectedEase}>
						{#each easingOptions as ease (ease)}
							<option value={ease} selected={selectedEase === ease}>{ease}</option>
						{/each}
					</select>
				</div>

				<div class="g-input">
					<label for="input-duration">Duration:</label>
					<input
						type="range"
						id="input-duration"
						min="0"
						max="3000"
						step="100"
						bind:value={selectedDuration}
					/>
					<span>{selectedDuration}</span>
				</div>

				<div class="g-input">
					<label for="input-debug">Bound:</label>
					<input type="checkbox" bind:checked={selectedBound} />
				</div>

				<div class="g-input">
					<label for="input-debug">Debug:</label>
					<input type="checkbox" bind:checked={selectedDebug} />
				</div>
			</div>

			<div class="g-buttons">
				<button on:click={reset}>Reset</button>
				<button on:click={() => to(rect)}>Zoom to rectangle</button>
				<button on:click={() => to(circle)}>Zoom to circle</button>
			</div>
		</div>

		<div class="g-title g-mb-2 g-mt-10">SVG</div>
		<div class="g-wrapper">
			<Panera
				bind:this={svg}
				{width}
				{height}
				bound={selectedBound}
				debug={selectedDebug}
				duration={selectedDuration}
				easing={easingMap[selectedEase]}
			>
				<Svg>
					<rect
						bind:this={rect}
						fill="tomato"
						width={width * 0.25}
						height={height * 0.4}
						x={width * 0.1}
						y={height * 0.1}
					/>
					<circle
						bind:this={circle}
						fill="steelblue"
						r={height * 0.2}
						cx={width * 0.8}
						cy={height * 0.55}
					/>
				</Svg>
			</Panera>
		</div>

		<div class="g-title g-mb-2 g-mt-10">Canvas</div>
		<div class="g-wrapper">
			<Panera
				bind:this={canvas}
				{width}
				{height}
				bound={selectedBound}
				easing={easingMap[selectedEase]}
				debug={selectedDebug}
				duration={selectedDuration}
			>
				<Canvas {render} />
			</Panera>
		</div>

		<div class="g-title g-mb-2 g-mt-10">HTML</div>
		<div class="g-wrapper">
			<Panera
				bind:this={html}
				{width}
				{height}
				bound={selectedBound}
				easing={easingMap[selectedEase]}
				debug={selectedDebug}
				duration={selectedDuration}
			>
				<Html>
					<div
						style="
            background: tomato;
            position: absolute;
            width: {width * 0.25}px;
            height: {height * 0.4}px;
            left: {width * 0.1}px;
            top: {height * 0.1}px;"
					/>
					<div
						style="
          background: steelblue;
          position: absolute;
          width: {height * 0.4}px;
          height: {height * 0.4}px;
          left: {width * 0.8 - height * 0.2}px;
          top: {height * 0.4}px;
          border-radius: 50%;"
					></div>
				</Html>
			</Panera>
		</div>
	</div>
</Story>
