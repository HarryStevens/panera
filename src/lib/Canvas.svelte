<script>
	import { getContext, onMount, onDestroy } from 'svelte';

	/**
	 * Public render callback signature:
	 * @callback RenderFn
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {{ k:number, x:number, y:number }} view
	 * @param {{ width:number, height:number, dpr:number }} meta
	 * @returns {void}
	 */

	/** @type {RenderFn | null} */
	export let render = null;

	// Pull shared state from provider (typing optional; for devs)
	/** @type {any} */ const { k, x, y, width, height, debugRect } = getContext('panera');

	let canvasEl, ctx;
	let dpr = 1;

	function resizeCanvas() {
		if (!canvasEl) return;
		const winDpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
		dpr = Math.max(1, winDpr);

		// CSS px from provider
		const cssW = $width || 0;
		const cssH = $height || 0;
		if (!cssW || !cssH) {
			ctx && ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
			return;
		}

		// size element and backing store
		canvasEl.style.width = `${cssW}px`;
		canvasEl.style.height = `${cssH}px`;
		const targetW = Math.max(1, Math.round(cssW * dpr));
		const targetH = Math.max(1, Math.round(cssH * dpr));
		if (canvasEl.width !== targetW) canvasEl.width = targetW;
		if (canvasEl.height !== targetH) canvasEl.height = targetH;

		if (!ctx) ctx = canvasEl.getContext('2d');
		draw();
	}

	function draw() {
		if (!ctx) return;
		if (!($width > 0 && $height > 0)) return;

		// clear device pixels
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		// apply DPR and pan/zoom for object space
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.scale($k, $k);
		ctx.translate($x, $y);

		ctx.save();
		ctx.beginPath();

		if (typeof render === 'function') {
			try {
				render(ctx, { k: $k, x: $x, y: $y }, { width: $width, height: $height, dpr });
			} catch (e) {
				console.error('[Panera Canvas render] error:', e);
			}
		}

		ctx.restore();
		ctx.beginPath(); // fresh path for debug

		if ($debugRect) {
			ctx.save();
			ctx.lineWidth = 2 / $k; // non-scaling stroke
			ctx.strokeStyle = 'red';
			ctx.strokeRect($debugRect.x, $debugRect.y, $debugRect.width, $debugRect.height);
			ctx.restore();
		}
	}

	onMount(() => {
		ctx = canvasEl.getContext('2d');
		resizeCanvas();
		if (typeof window !== 'undefined') window.addEventListener('resize', resizeCanvas);
	});
	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('resize', resizeCanvas);
	});

	// motion/debug -> draw
	$: {
		$k;
		$x;
		$y;
		$debugRect;
		if (ctx) draw();
	}

	// size -> resize (which will trigger one draw)
	$: if (ctx) {
		$width;
		$height;
		resizeCanvas();
	}
</script>

<canvas class="panera-canvas" bind:this={canvasEl} style="display:block;"></canvas>
