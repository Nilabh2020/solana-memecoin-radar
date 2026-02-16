import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../utils/constants.js';
import { useAuth } from '../context/AuthContext.jsx';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;

export function useWebSocket() {
  const { isPremium } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectDelay = useRef(RECONNECT_DELAY);
  const reconnectTimer = useRef(null);
  const listeners = useRef(new Map());

  const connect = useCallback(() => {
    // Only allow WebSocket for premium users
    if (!isPremium) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectDelay.current = RECONNECT_DELAY;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Notify type-specific listeners
          const typeListeners = listeners.current.get(data.type);
          if (typeListeners) {
            typeListeners.forEach(cb => cb(data));
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (isPremium) scheduleReconnect();
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      if (isPremium) scheduleReconnect();
    }
  }, [isPremium]);

  function scheduleReconnect() {
    if (reconnectTimer.current) return;
    reconnectTimer.current = setTimeout(() => {
      reconnectTimer.current = null;
      reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, MAX_RECONNECT_DELAY);
      connect();
    }, reconnectDelay.current);
  }

  const subscribe = useCallback((type, callback) => {
    if (!listeners.current.has(type)) {
      listeners.current.set(type, new Set());
    }
    listeners.current.get(type).add(callback);

    return () => {
      listeners.current.get(type)?.delete(callback);
    };
  }, []);

  useEffect(() => {
    if (isPremium) {
      connect();
    } else {
      // Disconnect if downgraded
      wsRef.current?.close();
      setConnected(false);
    }
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect, isPremium]);

  return { connected, lastMessage, subscribe };
}
