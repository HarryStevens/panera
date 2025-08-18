import { describe, it, expect } from 'vitest';
import { clampRectToBounds, fitRectToContainer, lerp } from './core.js';

describe('clampRectToBounds', () => {
	const W = 100;
	const H = 80;

	it('returns the same rect when fully inside', () => {
		const r = { x: 10, y: 12, width: 30, height: 20 };
		expect(clampRectToBounds(r, W, H)).toEqual(r);
	});

	it('clamps when partially outside on left/top', () => {
		const r = { x: -20, y: -10, width: 50, height: 40 };
		expect(clampRectToBounds(r, W, H)).toEqual({ x: 0, y: 0, width: 30, height: 30 });
	});

	it('clamps when partially outside on right/bottom', () => {
		const r = { x: 80, y: 60, width: 50, height: 40 };
		expect(clampRectToBounds(r, W, H)).toEqual({ x: 80, y: 60, width: 20, height: 20 });
	});

	it('falls back to full container when completely outside (left)', () => {
		const r = { x: -200, y: 10, width: 50, height: 20 };
		expect(clampRectToBounds(r, W, H)).toEqual({ x: 0, y: 0, width: W, height: H });
	});

	it('falls back to full container when width or height collapses to 0', () => {
		const r = { x: 0, y: 0, width: 0, height: 10 };
		expect(clampRectToBounds(r, W, H)).toEqual({ x: 0, y: 0, width: W, height: H });
	});

	it('handles exact edge-touch rectangles (no change)', () => {
		const r = { x: 0, y: 0, width: W, height: H };
		expect(clampRectToBounds(r, W, H)).toEqual(r);
	});
});

describe('fitRectToContainer', () => {
	const C = { width: 800, height: 600 }; // 4:3

	it('fits equal-aspect rect and recenters', () => {
		const r = { x: 100, y: 50, width: 400, height: 300 }; // 4:3
		const v = fitRectToContainer(r, C, { bound: true });
		expect(v.k).toBeCloseTo(2, 6);
		expect(v.x).toBeCloseTo(-100, 6);
		expect(v.y).toBeCloseTo(-50, 6);
	});

	it('fits tall rect; with bound=true left/top are clamped to 0', () => {
		const r = { x: 0, y: 0, width: 200, height: 400 }; // 1:2
		const v = fitRectToContainer(r, C, { bound: true });
		// scale by height
		expect(v.k).toBeCloseTo(600 / 400, 6); // 1.5
		// centering would yield +166.67, but bound clamps positive X to 0
		expect(v.x).toBeCloseTo(0, 6);
		expect(v.y).toBeCloseTo(0, 6);
	});

	it('fits tall rect; with bound=false it recenters horizontally', () => {
		const r = { x: 0, y: 0, width: 200, height: 400 };
		const v = fitRectToContainer(r, C, { bound: false });
		expect(v.k).toBeCloseTo(1.5, 6);
		// containerWidth / k = 800 / 1.5 = 533.333..., center offset = (533.33 - 200)/2
		expect(v.x).toBeCloseTo((800 / 1.5 - 200) / 2, 5); // ~166.6667
		expect(v.y).toBeCloseTo(0, 6);
	});

	it('fits a tall rect in a wide container (unbounded) and recenters horizontally', () => {
		const C = { width: 1000, height: 400 }; // wide container (2.5:1)
		const R = { x: 100, y: 40, width: 120, height: 360 }; // tall rect

		// Expected math (same as the library’s formula):
		const k = C.height / R.height; // height-driven fit
		const expectedX = -R.x + (C.width / k - R.width) / 2;
		const expectedY = -R.y + (C.height / k - R.height) / 2; // this term is 0; so -R.y

		const v = fitRectToContainer(R, C, { bound: false });

		expect(v.k).toBeCloseTo(k, 6);
		expect(v.x).toBeCloseTo(expectedX, 6);
		expect(v.y).toBeCloseTo(expectedY, 6); // equals -R.y for tall fit
	});

	it('fits a tall rect in a wide container (bounded) and keeps it within edges', () => {
		const C = { width: 1000, height: 400 };
		const R = { x: 100, y: 40, width: 120, height: 360 };

		const v = fitRectToContainer(R, C, { bound: true });

		// Compute object-space edges after transform:
		// left/top are -v.x / -v.y; right/bottom account for visible span (container/k)
		const left = -v.x;
		const top = -v.y;
		const right = -v.x + C.width / v.k;
		const bottom = -v.y + C.height / v.k;

		// With bound=true, content must be fully inside [0, container] in object space.
		expect(left).toBeGreaterThanOrEqual(0);
		expect(top).toBeGreaterThanOrEqual(0);
		expect(right).toBeLessThanOrEqual(C.width + 1e-6);
		expect(bottom).toBeLessThanOrEqual(C.height + 1e-6);
	});

	it('throws for bad inputs', () => {
		expect(() => fitRectToContainer({ x: 0, y: 0, width: 0, height: 10 }, C)).toThrow();
		expect(() => fitRectToContainer({ x: 0, y: 0, width: 10, height: 0 }, C)).toThrow();
		expect(() =>
			fitRectToContainer({ x: 0, y: 0, width: 10, height: 10 }, { width: 0, height: 600 })
		).toThrow();
	});
});

describe('lerp', () => {
	it('interpolates numbers linearly', () => {
		expect(lerp(0, 10, 0)).toBe(0);
		expect(lerp(0, 10, 1)).toBe(10);
		expect(lerp(10, 20, 0.5)).toBe(15);
	});
});
