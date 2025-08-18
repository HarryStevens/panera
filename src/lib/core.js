/** @typedef {{ x:number, y:number, width:number, height:number }} Rect */
/** @typedef {{ width:number, height:number }} Container */
/** @typedef {{ k:number, x:number, y:number }} View */

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
