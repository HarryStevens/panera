<script>
	import { getContext } from 'svelte';

	// Pull shared state from provider
	/** @type {any} */ const { k, x, y, width, height, debugRect } = getContext('panera');

	// we set border width to 2 / k so after scaling by k it's ~2px.
	$: dbgBorder = `${2 / ($k || 1)}px solid red`;
</script>

<!-- Outer box defines the layer’s viewport in CSS pixels -->
<div
	class="panera-html"
	style="
    position: relative;
    overflow: hidden;
    width: {$width ?? 0}px;
    height: {$height ?? 0}px;
  "
>
	<!-- Inner content is in 'object space' (scaled + translated like SVG/Canvas) -->
	<div
		class="panera-html-content"
		style="
      position: absolute;
      left: 0; top: 0;
      transform-origin: 0 0;
      transform: scale({$k}) translate({$x}px, {$y}px);
      will-change: transform;
    "
	>
		<!-- Your HTML-markup children go here -->
		<slot />

		{#if $debugRect}
			<div
				class="panera-html-debug"
				style="
          position: absolute;
          left: {$debugRect.x}px;
          top: {$debugRect.y}px;
          width: {$debugRect.width}px;
          height: {$debugRect.height}px;
          border: {dbgBorder};
          pointer-events: none;
          box-sizing: border-box;
        "
			/>
		{/if}
	</div>
</div>
