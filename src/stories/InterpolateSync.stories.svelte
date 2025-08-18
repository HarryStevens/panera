<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	const { Story } = defineMeta({ title: 'Panera/Interpolate' });
</script>

<script>
	import { Panera, Svg, Canvas, Html } from '$lib';
	import { easingMap, easingOptions } from './_shared.js';

	let svg, canvas, html;
	let circle, rect;
	let width,
		height = 100;

	let selectedBound = true;
	let selectedDebug = false;
	let selectedEase = 'cubicInOut';

	// use string ids for selects
	let selectedAKey = 'Container';
	let selectedBKey = 'Rectangle'; // default to circle once it exists; see seeding below
	let selectedT = 0;

	// display options
	const options = ['Container', 'Circle', 'Rectangle'];

	// container box
	$: container = { x: 0, y: 0, width, height };

	// seed B to 'Rectangle' once the rectangle ref is available
	$: if (!rect && selectedBKey === 'Rectangle') {
		// nothing yet; keep as 'Rectangle' so when rectangle binds it just works
	}
	$: if (rect && selectedBKey == null) {
		selectedBKey = 'Rectangle';
	}

	// resolve a key -> node -> box
	function box(key) {
		if (key === 'Container') return container;
		if (key === 'Circle') return circle?.getBBox?.() || container;
		if (key === 'Rectangle') return rect?.getBBox?.() || container;
		return container;
	}

	// drive interpolation when inputs change
	$: {
		if (svg && canvas && width && height) {
			const a = box(selectedAKey);
			const b = box(selectedBKey);
			svg.interpolate(a, b, { t: selectedT, bound: selectedBound, debug: selectedDebug });
			canvas.interpolate(a, b, { t: selectedT, bound: selectedBound, debug: selectedDebug });
			html.interpolate(a, b, { t: selectedT, bound: selectedBound, debug: selectedDebug });
		}
	}

	function render(ctx) {
		if (!rect || !circle) return;

		const rb = rect.getBBox();
		ctx.fillStyle = 'tomato';
		ctx.fillRect(rb.x, rb.y, rb.width, rb.height);

		const cb = circle.getBBox();
		const r = cb.width / 2;
		ctx.beginPath(); // safe against path accumulation
		ctx.arc(cb.x + r, cb.y + r, r, 0, Math.PI * 2);
		ctx.fillStyle = 'steelblue';
		ctx.fill();
	}
</script>

<Story name="Sync" asChild>
	<div class="g-container" bind:clientWidth={width}>
		<div class="g-controls">
			<div class="g-inputs" style="margin-bottom: 10px;">
				<div class="g-input">
					<label for="input-ease">Easing:</label>
					<select id="input-ease" bind:value={selectedEase}>
						{#each easingOptions as ease (ease)}
							<option value={ease} selected={selectedEase === ease}>{ease}</option>
						{/each}
					</select>
				</div>

				<div class="g-input">
					<label>Bound:</label>
					<input type="checkbox" bind:checked={selectedBound} />
				</div>
				<div class="g-input">
					<label>Debug:</label>
					<input type="checkbox" bind:checked={selectedDebug} />
				</div>
			</div>

			<div class="g-inputs">
				<div class="g-input">
					<label for="input-a">Start:</label>
					<select id="input-a" bind:value={selectedAKey}>
						{#each options as o (o)}
							<option value={o}>{o}</option>
						{/each}
					</select>
				</div>

				<div class="g-input">
					<label for="input-b">End:</label>
					<select id="input-b" bind:value={selectedBKey}>
						{#each options as o (o)}
							<option value={o}>{o}</option>
						{/each}
					</select>
				</div>

				<div class="g-input">
					<label>Interpolate:</label>
					<input type="range" min="0" max="1" step="0.01" bind:value={selectedT} />
					<span>{selectedT}</span>
				</div>
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
				debug={selectedDebug}
				easing={easingMap[selectedEase]}
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
			>
				<Html>
					<div
						style="
            background: tomato;
            position: absolute;
            width: {width * 0.25}px;
            height: {height *0.4}px;
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
