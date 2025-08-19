// eslint.config.js
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import prettierConfig from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import svelteConfig from './svelte.config.js';
import prettierPlugin from 'eslint-plugin-prettier';
import jsonc from 'eslint-plugin-jsonc';
import jsoncParser from 'jsonc-eslint-parser';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
	includeIgnoreFile(gitignorePath),

	js.configs.recommended,
	...svelte.configs.recommended,
	...storybook.configs['flat/recommended'],

	// Turn off stylistic rules that conflict with Prettier (for JS + Svelte)
	...svelte.configs.prettier,
	prettierConfig,

	{
		files: ['**/*.{js,ts,svelte}'],
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			prettier: prettierPlugin
		},
		rules: {
			'prettier/prettier': 'error'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.js'],
		languageOptions: { parserOptions: { svelteConfig } }
	},
	{
		files: ['**/*.{test,spec}.{js,ts}'],
		languageOptions: {
			globals: { ...globals.vitest }
		}
	},
	{
		files: ['**/*.json'],
		languageOptions: { parser: jsoncParser },
		plugins: { prettier: prettierPlugin, jsonc },
		rules: {
			'prettier/prettier': 'error'
		}
	}
];
