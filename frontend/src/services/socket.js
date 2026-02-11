import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Get WebSocket URL from environment variable
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class SocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.pendingSubscriptions = [];
  }

  connect(onConnectCallback) {
    if (this.client && this.client.active) {
       if (this.connected && onConnectCallback) onConnectCallback();
       return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: function (str) {
        console.log(str);
      },
      onConnect: (frame) => {
        console.log('Connected to WebSocket');
        this.connected = true;
        this._processPendingSubscriptions();
        if (onConnectCallback) onConnectCallback();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
         console.log('WebSocket connection closed');
         this.connected = false;
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
    this.connected = false;
    this.subscriptions.clear();
  }

  _processPendingSubscriptions() {
    while (this.pendingSubscriptions.length > 0) {
      const { topic, callback } = this.pendingSubscriptions.shift();
      this.subscribe(topic, callback);
    }
  }

  subscribe(topic, callback) {
    if (!this.connected) {
      this.pendingSubscriptions.push({ topic, callback });
      return;
    }

    if (this.subscriptions.has(topic)) return;

    const sub = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error("Error parsing message", e);
      }
    });
    this.subscriptions.set(topic, sub);
  }

  unsubscribe(topic) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  // API Methods matching backend endpoints

  subscribeToLocation(requestId, callback) {
    this.subscribe(`/topic/location/${requestId}`, callback);
  }

  subscribeToUserNotifications(userId, callback) {
      this.subscribe(`/user/${userId}/queue/notifications`, callback);
  }

  sendLocationUpdate(data) {
    if (this.connected && this.client) {
      this.client.publish({
        destination: '/app/location-update',
        body: JSON.stringify(data),
      });
    } else {
        console.warn("Cannot send location update: not connected");
    }
  }
}

export default new SocketService();
