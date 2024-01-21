import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
	plugins: [sveltekit(), glsl({ compress: true })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
