// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// optional: keep this if you *don’t* want to run any .svelte component tests
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
	}
});
