# panera

A Svelte library for panning and zooming in SVG, Canvas and HTML.

## Install

```bash
pnpm add panera
```

Peer requirement: svelte ^4 || ^5

## Example

```svelte
<script>
	import { Panera, Svg } from 'panera';
	let width = 800,
		height = 300;

	let pan;
	function reset() {
		pan.reset();
	}
	function to() {
		pan.to({ x: 80, y: 40, width: 200, height: 120, duration: 600 });
	}
</script>

<button on:click={reset}>Reset</button> <button on:click={to}>Zoom to rect</button>

<Panera bind:this={pan} {width} {height}>
	<Svg>
		<rect fill="tomato" x="80" y="40" width="200" height="120" />
	</Svg>
</Panera>
```

[See more examples here](https://panera-two.vercel.app/)

## API

- Provider: `<Panera />`
- Layers: `<Svg />`, `<Canvas />`, `<Html />`
- Control via `bind:this`: `to()`, `reset()`, `interpolate()`, `getState()`

### `<Panera />` props

- `width?: number | null` — container width in pixels (required for fits)
- `height?: number | null` - container height in pixels (required for fits)
- `duration?: number` — default 1000 ms (used by `to()` & `reset()`)
- `easing?: (t:number)=>number` — default `cubicInOut`
- `bound?: boolean` — clamp view inside container (default `true`)
- `debug?: boolean` — overlay a non-scaling red debug rect (default `false`)

### Methods (via `bind:this`)

- `reset(opts?)`<br/>
  `opts = { duration?: number, easing?: (t)=>number, debug?: boolean }`<br/>
  Reset the view back to k=1, x=0, y=0.

- `to(rectAndOpts)`<br/>
  `rectAndOpts = { x, y, width, height, duration?, easing?, debug?, bound? }`<br/>
  Tweens to the fitted view of the rectangle.

- `interpolate(a, b, opts?)`<br/>
  `a = { x, y, width, height }, b = { x, y, width, height }`<br/>
  `opts = { t?: number, easing?: (t)=>number, bound?: boolean, debug?: boolean }`<br/>
  Instant scrub (no tween). Fits both a and b, then blends view using t (after easing).

- `getState(): Readable<{ k:number, x:number, y:number }>`<br/>
  A Svelte store reflecting the current view.

### Layers

- `<Svg>`<br/>
  Renders a `<svg>` with `viewBox` and a `<g>` that applies:<br/>
  `transform="scale(k) translate(x, y)"`.<br/>
  Debug rect uses `vector-effect="non-scaling-stroke"`.

- `<Canvas>`<br/>
  DPR-aware canvas; applies `scale(k)` then `translate(x, y)`.<br/>
  Prop:<br/>
  `render(ctx, {k, x, y}, {width, height, dpr}) => void`

- `<Html>`<br/>
  Absolutely-positioned HTML that follows the same transform via CSS:<br/>
  `transform: scale(k) translate(xpx, ypx); transform-origin: 0 0;`<br/>
  Place children with `position:absolute; left/top` in object coordinates.

## Notes

- **SSR-safe**: Canvas guards `window`/`devicePixelRatio`.
- **Transforms**: All layers use the same order — `scale(k)` then `translate(x, y)` — so coordinates match.
- **Bounds**: When `bound: true`, content is clamped so edges don’t show outside the container.

## Development

```bash
pnpm format       # prettier
pnpm lint         # prettier check + eslint
pnpm test         # vitest unit tests
pnpm prepack      # build library to dist/ (svelte-package + publint)
pnpm pack         # output a tarball
```

### Tests

Core math is tested in `src/lib/core.spec.js`:

- `fitRectToContainer` (aspect fit + bounds)
- `lerp`

## License

MIT
