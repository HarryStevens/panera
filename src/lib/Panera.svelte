<script>
	import { tweened } from 'svelte/motion';
	import { writable, derived } from 'svelte/store';
	import { cubicInOut } from 'svelte/easing';
	import { setContext } from 'svelte';

	import { fitRectToContainer, lerp } from './core.js';

	/**
	 * @typedef {{ x:number, y:number, width:number, height:number }} Rect
	 * @typedef {{ k:number, x:number, y:number }} View
	 * @typedef {(t:number)=>number} EasingFn
	 */

	// Public props
	/** @type {number|null} */ export let width = null;
	/** @type {number|null} */ export let height = null;
	/** @type {number} */ export let duration = 1000;
	/** @type {EasingFn} */ export let easing = cubicInOut;
	/** @type {boolean} */ export let bound = true;
	/** @type {boolean} */ export let debug = false;

	// Internal state stores
	const k = tweened(1, { duration: 0 });
	const x = tweened(0, { duration: 0 });
	const y = tweened(0, { duration: 0 });

	// width/height as stores so layers react when they change
	const W = writable(width);
	const H = writable(height);
	$: W.set(width);
	$: H.set(height);

	// debug rect shared to layers
	const debugRect = writable(/** @type {Rect|null} */ (null));

	// helpers
	const pickOpts = (localDuration, localEasing) => ({
		duration: localDuration ?? duration,
		easing: /** @type {EasingFn} */ (localEasing ?? easing)
	});

	/** Fit a Rect to the container; returns a View.
	 * @param {Rect} r
	 * @param {boolean} [localBound=bound]
	 * @returns {View}
	 */
	function fit(rect, localBound = bound) {
		return fitRectToContainer(rect, { width: $W, height: $H }, { bound: localBound });
	}

	/**
	 * Reset the view back to k=1, x=0, y=0.
	 * @param {{ duration?: number, easing?: EasingFn, debug?: boolean }} [opts]
	 */
	export function reset({ duration: d, easing: e, debug: localDebug = debug } = {}) {
		const opts = pickOpts(d, e);
		k.set(1, opts);
		x.set(0, opts);
		y.set(0, opts);

		debugRect.set(localDebug ? { x: 0, y: 0, width: $W, height: $W } : null);

		return api();
	}

	/**
	 * Tween to a rectangle
	 * @param {Rect & { duration?:number, easing?:EasingFn, debug?:boolean, bound?:boolean }} options
	 */
	export function to({
		x: objX,
		y: objY,
		width: objW,
		height: objH,
		duration: d,
		easing: e,
		debug: localDebug = debug,
		bound: localBound = bound
	} = {}) {
		if (!($W > 0 && $H > 0)) return api();
		if (!(objW > 0 && objH > 0)) return api();

		const target = { x: objX, y: objY, width: objW, height: objH };
		const end = fit(target, localBound);

		debugRect.set(localDebug ? target : null);

		const opts = pickOpts(d, e);
		k.set(end.k, opts);
		x.set(end.x, opts);
		y.set(end.y, opts);

		return api();
	}

	/**
	 * Interpolate between two rectangles at t∈[0,1]
	 * @param {Rect} a
	 * @param {Rect} b
	 * @param {{ t?:number, easing?:EasingFn, bound?:boolean, debug?:boolean }} [opts]
	 */
	export function interpolate(
		a,
		b,
		{ t = 0, easing: localEasing, bound: localBound = bound, debug: localDebug = debug } = {}
	) {
		if (!($W > 0 && $H > 0)) return api();
		if (!(a?.width > 0 && a?.height > 0)) return api();
		if (!(b?.width > 0 && b?.height > 0)) return api();

		const fa = fit(a, localBound);
		const fb = fit(b, localBound);

		// clamp input t, then ease it (don’t clamp after ease so “elastic/back” can overshoot if desired)
		const tc = Math.max(0, Math.min(1, t));
		const ease = localEasing ?? easing ?? ((u) => u);
		let te = ease(tc);
		if (!Number.isFinite(te)) te = tc; // safety

		const tk = lerp(fa.k, fb.k, te);
		const tx = lerp(fa.x, fb.x, te);
		const ty = lerp(fa.y, fb.y, te);

		if (localDebug) {
			debugRect.set({
				x: lerp(a.x, b.x, te),
				y: lerp(a.y, b.y, te),
				width: lerp(a.width, b.width, te),
				height: lerp(a.height, b.height, te)
			});
		} else {
			debugRect.set(null);
		}

		k.set(tk, { duration: 0 });
		x.set(tx, { duration: 0 });
		y.set(ty, { duration: 0 });

		return api();
	}

	const state = derived([k, x, y], ([$k, $x, $y]) => /** @type {View} */ ({ k: $k, x: $x, y: $y }));
	/** @returns {import('svelte/store').Readable<View>} */
	export function getState() {
		return state;
	}

	function api() {
		return { reset, to, interpolate, getState };
	}

	// Provide context to layers
	setContext('panera', {
		k,
		x,
		y,
		state,
		width: W,
		height: H,
		debugRect
	});
</script>

<!-- Wrapper just provides context + slots the layers -->
<div
	style="position:relative; width: {width ? `${width}px` : '100%'}; height: {height
		? `${height}px`
		: '100%'};"
>
	<slot />
</div>
