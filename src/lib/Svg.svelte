<script>
	import { getContext } from 'svelte';

	// Pull shared state from provider
	/** @type {any} */ const { k, x, y, width, height, debugRect } = getContext('panera');

	$: viewBox = $width != null && $height != null ? `0 0 ${$width} ${$height}` : null;
</script>

<svg class="panera-svg" {viewBox} width={$width} height={$height}>
	<g class="panera-svg-content" transform="scale({$k}) translate({$x}, {$y})">
		<slot />
		{#if $debugRect}
			<rect
				class="panera-svg-debug"
				x={$debugRect.x}
				y={$debugRect.y}
				width={$debugRect.width}
				height={$debugRect.height}
				fill="none"
				stroke="red"
				stroke-width="2"
				vector-effect="non-scaling-stroke"
				style="pointer-events:none"
			/>
		{/if}
	</g>
</svg>
