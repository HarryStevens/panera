/** @typedef {{ x:number, y:number, width:number, height:number }} Rect */
/** @typedef {{ width:number, height:number }} Container */
/** @typedef {{ k:number, x:number, y:number }} View */

/**
 * Clamp a rectangle to the container [0..W] × [0..H].
 * - If the input rect partially overlaps, returns the intersection.
 * - If there is **no** overlap (empty intersection), returns the full container.
 *
 * This is useful with `bound: true` so you never compute a zoom based on
 * off-screen content you can’t pan to.
 *
 * @param {Rect} r    The target rectangle (object space).
 * @param {number} W  Container width (CSS pixels / object units).
 * @param {number} H  Container height.
 * @returns {Rect}    The clamped (or full-container) rectangle.
 */
export function clampRectToBounds(r, W, H) {
	const x0 = Math.max(0, Math.min(W, r.x));
	const y0 = Math.max(0, Math.min(H, r.y));
	const x1 = Math.max(0, Math.min(W, r.x + r.width));
	const y1 = Math.max(0, Math.min(H, r.y + r.height));
	const w = Math.max(0, x1 - x0);
	const h = Math.max(0, y1 - y0);
	return w === 0 || h === 0
		? { x: 0, y: 0, width: W, height: H }
		: { x: x0, y: y0, width: w, height: h };
}

/**
 * Compute the view (k,x,y) that fits a rect into a container.
 * @param {Rect} r
 * @param {Container} c
 * @param {{ bound?: boolean }} [opts]
 * @returns {View}
 */
export function fitRectToContainer(r, c, opts = {}) {
	const { bound = true } = opts;
	const { x: objX, y: objY, width: objW, height: objH } = r;
	const { width: containerWidth, height: containerHeight } = c;

	if (!(containerWidth > 0 && containerHeight > 0)) throw new Error('Bad container');
	if (!(objW > 0 && objH > 0)) throw new Error('Bad rect');

	const objectAspect = objW / objH;
	const containerAspect = containerWidth / containerHeight;

	const k = objectAspect < containerAspect ? containerHeight / objH : containerWidth / objW;

	let nextX = -objX + (containerWidth / k - objW) / 2;
	let nextY = -objY + (containerHeight / k - objH) / 2;

	if (bound) {
		if (-nextX < 0) nextX = 0;
		if (-nextY < 0) nextY = 0;

		const right = -nextX + containerWidth / k;
		if (right > containerWidth) nextX += right - containerWidth;

		const bottom = -nextY + containerHeight / k;
		if (bottom > containerHeight) nextY += bottom - containerHeight;
	}

	return { k, x: nextX, y: nextY };
}

/** Linear interpolation helper
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t;
