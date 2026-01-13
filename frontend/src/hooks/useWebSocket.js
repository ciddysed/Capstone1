import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BACKEND_URL } from '../config';

export const useWebSocket = (userId, userType, onMessageReceived, onStatusUpdate) => {
  const clientRef = useRef(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectedRef.current || !userId || !userType) return;

    console.log('Connecting to WebSocket...', { userId, userType });

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws`, null, {
        transports: ['websocket'],
        withCredentials: false
      }),
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected!');
        isConnectedRef.current = true;

        // Subscribe to messages for this user
        const destination = `/topic/messages/${userType.toLowerCase()}/${userId}`;
        console.log('Subscribing to:', destination);

        client.subscribe(destination, (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log('WebSocket message received:', payload);

            if (payload.type === 'STATUS_UPDATE') {
              // Handle status update
              if (onStatusUpdate) {
                onStatusUpdate(payload);
              }
            } else {
              // Handle new message
              if (onMessageReceived) {
                onMessageReceived(payload);
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        isConnectedRef.current = false;
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        isConnectedRef.current = false;
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        isConnectedRef.current = false;
      },
    });

    client.activate();
    clientRef.current = client;
  }, [userId, userType, onMessageReceived, onStatusUpdate]);

  const disconnect = useCallback(() => {
    if (clientRef.current && isConnectedRef.current) {
      console.log('Disconnecting WebSocket...');
      clientRef.current.deactivate();
      isConnectedRef.current = false;
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
  };
};
