import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { broadcastToUsers } from '$lib/websocket/server.svelte';
export const POST: RequestHandler = async (event) => {
    console.log(event);
    const data = await event.request.json();

    // Get the WebSocket server instance
    const wss = event.locals.wss;
    console.log(wss);

    if (!wss) {
        return json({ error: 'WebSocket server not available' }, { status: 500 });
    }

    if (!event.locals.user) {
        return json({ error: 'User not available' }, { status: 401 });
    }


    broadcastToUsers(wss, [event.locals.user.id], { message: data.message });

    return json({ success: true });
};