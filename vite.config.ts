import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createWSSGlobalInstance, onHttpServerUpgrade } from './src/lib/websocket/server.svelte';
export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				createWSSGlobalInstance();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
			configurePreviewServer(server) {
				createWSSGlobalInstance();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			}
		}
	],
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],

				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
