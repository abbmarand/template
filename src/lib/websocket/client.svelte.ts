import { EventEmitter } from 'events';
import { browser } from '$app/environment';

interface MessageEvent {
	type: string;
	data: any;
}

class socketState extends EventEmitter {
	private socket: WebSocket | null = null;
	messages: MessageEvent[] = [];

	// Reconnect configs
	private reconnectInterval = 5000; // 5 seconds
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		super();
		if (browser) {
			this.connect();
		}
	}

	private connect() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		const host = window.location.host;

		// Create a new WebSocket connection
		this.socket = new WebSocket(`${protocol}://${host}/websocket`);

		this.socket.addEventListener('open', () => {

			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = null;
			}
		});

		this.socket.addEventListener('message', (event) => {
			this.onMessage(event);
		});

		this.socket.addEventListener('close', (event) => {
			console.warn('[WebSocket] Connection closed', event.code, event.reason);
			this.scheduleReconnect();
		});

		this.socket.addEventListener('error', (error) => {
			console.error('[WebSocket] Connection error:', error);
			// Optionally trigger an immediate reconnection attempt on error
			// but usually you'll rely on 'close' event
		});
	}

	private scheduleReconnect() {
		if (!this.reconnectTimer) {

			this.reconnectTimer = setTimeout(() => {

				this.connect();
			}, this.reconnectInterval);
		}
	}

	private onMessage(event: MessageEvent) {
		if (event.data) {
			try {
				const newmessage = JSON.parse(event.data);
				this.messages.push(newmessage);
				this.emit(newmessage.type, newmessage.data);
				this.emit('message', newmessage); // global broadcast
			} catch (error) {
				console.error('[WebSocket] Failed to parse message:', error);
			}
		} else {
			console.warn('[WebSocket] Received message with no data');
		}
	}
}

export const socket = new socketState();
