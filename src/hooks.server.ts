import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import { GlobalThisWSS } from '$lib/websocket/server.svelte';
import type { ExtendedGlobal } from '$lib/websocket/server.svelte';
import { building } from '$app/environment';
import { prisma } from '@/prisma';

const authorizationHandle: Handle = async ({ event, resolve }) => {
	// Protect any routes under /authenticated
	const session = await event.locals.auth();
	if (
		event.url.pathname.startsWith('/authenticated') ||
		event.url.pathname.startsWith('/message')
	) {
		if (!session?.user) {
			// Redirect to the signin page
			throw redirect(303, '/auth/signin');
		}
	}

	if (session?.user?.email) {
		const user = await prisma.user.findUnique({
			where: { email: session.user.email }
		});
		if (user) {
			event.locals.session = {
				user: {
					email: session.user.email,
					name: user.name || ''
				}
			};
			event.locals.user = user;
		}
	}

	// If the request is still here, just proceed as normally
	return resolve(event);
};

const startupWebsocketServer = async (event: { locals: App.Locals }) => {
	try {
		const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (wss !== undefined) {
			wss.on('connection', async (ws: WebSocket) => {
				const user = event.locals.user;
				if (!user) {
					return;
				}
				// @ts-expect-error WebSocket type doesn't include userId
				ws.userId = user.id;
			});
		}
	} catch (error) {
		console.error(error);
	}
};

const webSocketHandle: Handle = async ({ event, resolve }) => {
	await startupWebsocketServer(event);
	if (!building) {
		const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (wss !== undefined) {
			event.locals.wss = wss;
		}
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name: string) => name === 'content-type'
	});

	return response;
};

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle: Handle = sequence(authenticationHandle, authorizationHandle, webSocketHandle);
