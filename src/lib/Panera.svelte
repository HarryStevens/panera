<script>
	import { tweened } from 'svelte/motion';
	import { writable, derived } from 'svelte/store';
	import { cubicInOut } from 'svelte/easing';
	import { setContext } from 'svelte';

	import { clampRectToBounds, fitRectToContainer, lerp } from './core.js';

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
	/** @type {import('svelte/store').Writable<number>} */
	const W = writable(width ?? 0);
	/** @type {import('svelte/store').Writable<number>} */
	const H = writable(height ?? 0);

	// keep stores numeric when props change
	$: W.set(width ?? 0);
	$: H.set(height ?? 0);

	// debug rect shared to layers
	const debugRect = writable(/** @type {Rect|null} */ (null));

	// helpers
	/**
	 * @param {number | undefined} localDuration
	 * @param {EasingFn | undefined} localEasing
	 * @returns {{ duration: number, easing: EasingFn }}
	 */
	const pickOpts = (localDuration, localEasing) => ({
		duration: localDuration ?? duration,
		easing: /** @type {EasingFn} */ (localEasing ?? easing)
	});

	/** Fit a Rect to the container; returns a View.
	 * @param {Rect} rect
	 * @param {boolean} [localBound=bound]
	 * @returns {View}
	 */
	export function fit(rect, localBound = bound) {
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

		const raw = { x: objX, y: objY, width: objW, height: objH };
		const target = localBound ? clampRectToBounds(raw, $W, $H) : raw;
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

		// ease t (clamp input, allow eased overshoot)
		const tc = Math.max(0, Math.min(1, t));
		const ease = localEasing ?? easing ?? ((u) => u);
		let te = ease(tc);
		if (!Number.isFinite(te)) te = tc;

		// interpolate the rect in object space
		const rectRaw = {
			x: lerp(a.x, b.x, te),
			y: lerp(a.y, b.y, te),
			width: lerp(a.width, b.width, te),
			height: lerp(a.height, b.height, te)
		};

		// clamp if bounded
		const rectClamped = localBound ? clampRectToBounds(rectRaw, $W, $H) : rectRaw;

		// fit this instantaneous rect to get the correct view
		const view = fit(rectClamped, localBound);

		// apply the view
		k.set(view.k, { duration: 0 });
		x.set(view.x, { duration: 0 });
		y.set(view.y, { duration: 0 });

		debugRect.set(localDebug ? rectClamped : null);
		return api();
	}

	const state = derived([k, x, y], ([$k, $x, $y]) => /** @type {View} */ ({ k: $k, x: $x, y: $y }));
	/** @returns {import('svelte/store').Readable<View>} */
	export function getState() {
		return state;
	}

	function api() {
		return { reset, to, interpolate, fit, getState };
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
	class="panera"
	style="position:relative; width: {width ? `${width}px` : '100%'}; height: {height
		? `${height}px`
		: '100%'};"
>
	<slot />
</div>
