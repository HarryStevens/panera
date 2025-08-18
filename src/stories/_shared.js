import {
	backIn,
	backInOut,
	backOut,
	bounceIn,
	bounceInOut,
	bounceOut,
	circIn,
	circInOut,
	circOut,
	cubicIn,
	cubicInOut,
	cubicOut,
	elasticIn,
	elasticInOut,
	elasticOut,
	expoIn,
	expoInOut,
	expoOut,
	linear,
	quadIn,
	quadInOut,
	quadOut,
	quartIn,
	quartInOut,
	quartOut,
	quintIn,
	quintInOut,
	quintOut,
	sineIn,
	sineInOut,
	sineOut
} from 'svelte/easing';

export const easingMap = {
	backIn,
	backInOut,
	backOut,
	bounceIn,
	bounceInOut,
	bounceOut,
	circIn,
	circInOut,
	circOut,
	cubicIn,
	cubicInOut,
	cubicOut,
	elasticIn,
	elasticInOut,
	elasticOut,
	expoIn,
	expoInOut,
	expoOut,
	linear,
	quadIn,
	quadInOut,
	quadOut,
	quartIn,
	quartInOut,
	quartOut,
	quintIn,
	quintInOut,
	quintOut,
	sineIn,
	sineInOut,
	sineOut
};

export const easingOptions = Object.keys(easingMap);

export const defaults = {
	bound: true,
	debug: false,
	duration: 1000,
	easingName: 'cubicInOut',
	t: 0
};

// Controls reusable across stories
export const controls = {
	bound: { control: 'boolean' },
	debug: { control: 'boolean' },
	duration: { control: { type: 'number', min: 0, step: 50 } },
	easingName: { control: { type: 'select' }, options: easingOptions },
	t: { control: { type: 'range', min: 0, max: 1, step: 0.05 } }
};
