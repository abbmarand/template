// See https://kit.svelte.dev/docs/types#app

import type { WebSocket, WebSocketServer } from 'ws';
import type { User } from '@prisma/client';

export interface ExtendedWebSocket extends WebSocket {
	socketId: string;
	userId: string;
}

export interface ExtendedWebSocketServer extends WebSocketServer {
	clients: Set<ExtendedWebSocket>;
	clientInfo: Map<
		string,
		{
			userId: string | null;
			connectedAt: Date;
			lastActivity: Date;
		}
	>;
}

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: () => Promise<{ user: { email: string } | null }>;
			wss: ExtendedWebSocketServer;
			session: {
				user: {
					email: string;
					name: string;
				} | null;
			} | null;
			user?: User;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
