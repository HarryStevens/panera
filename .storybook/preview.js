/** @type { import('@storybook/sveltekit').Preview } */
import '../src/stories/storybook.css';

const preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		layout: 'padded'
	}
};

export default preview;
