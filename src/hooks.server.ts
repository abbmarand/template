import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import { GlobalThisWSS } from '$lib/websocket/server.svelte';
import type { ExtendedGlobal } from '$lib/websocket/server.svelte';
import { building } from '$app/environment';
import prisma from '@/prisma';

async function authorizationHandle({ event, resolve }: { event: any; resolve: any }) {
    // Protect any routes under /authenticated
    const session = await event.locals.auth();
    if (event.url.pathname.startsWith('/authenticated') || event.url.pathname.startsWith('/message')) {
        if (!session) {
            // Redirect to the signin page
            throw redirect(303, '/auth/signin');
        }
    }

    console.log(session);

    if (session) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (user) {
            event.locals.session = session;
            event.locals.user = user;
        }
    }

    // If the request is still here, just proceed as normally
    return resolve(event);
}

const startupWebsocketServer = async (event: { locals: { auth: () => any; user?: any } }) => {
    try {
        const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
        if (wss !== undefined) {
            wss.on('connection', async (ws: WebSocket, _request: any) => {
                const user = event.locals.user;
                if (!user) {
                    return;
                }
                //@ts-ignore
                ws.userId = user.id;
            });
        }
    } catch (error) {
        console.error(error);
    }
};


async function webSocketHandle({ event, resolve }: { event: any; resolve: any }) {
    await startupWebsocketServer(event);
    console.log(event.locals);
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
}

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle: Handle = sequence(authenticationHandle, authorizationHandle, webSocketHandle)