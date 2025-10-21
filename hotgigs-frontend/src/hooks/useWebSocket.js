import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * WebSocket Hook for Real-time Updates
 * 
 * Provides WebSocket connection management and message handling
 * for real-time notifications and progress updates.
 * 
 * Usage:
 * const { isConnected, sendMessage, lastMessage } = useWebSocket({
 *   onNotification: (data) => console.log('Notification:', data),
 *   onResumeProgress: (data) => console.log('Progress:', data)
 * });
 */

const useWebSocket = ({
  onNotification,
  onResumeProgress,
  onConnected,
  onDisconnected,
  onError
} = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  const pingInterval = 30000; // 30 seconds

  const getWebSocketUrl = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      return null;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_URL || window.location.host;
    return `${protocol}//${host}/ws/connect?token=${token}`;
  };

  const connect = useCallback(() => {
    const url = getWebSocketUrl();
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        if (onConnected) {
          onConnected();
        }
        
        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, pingInterval);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'notification':
              if (onNotification) {
                onNotification(message.data);
              }
              break;
            
            case 'resume_progress':
              if (onResumeProgress) {
                onResumeProgress(message.data);
              }
              break;
            
            case 'connected':
              console.log('WebSocket connection confirmed:', message.message);
              break;
            
            case 'pong':
              // Ping response received
              break;
            
            case 'error':
              console.error('WebSocket error message:', message.message);
              if (onError) {
                onError(message.message);
              }
              break;
            
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) {
          onError(error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        if (onDisconnected) {
          onDisconnected();
        }
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [onNotification, onResumeProgress, onConnected, onDisconnected, onError, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.error('WebSocket is not connected');
      return false;
    }
  }, []);

  const watchResume = useCallback((resumeId) => {
    return sendMessage({
      type: 'watch_resume',
      resume_id: resumeId
    });
  }, [sendMessage]);

  const unwatchResume = useCallback((resumeId) => {
    return sendMessage({
      type: 'unwatch_resume',
      resume_id: resumeId
    });
  }, [sendMessage]);

  const joinRoom = useCallback((room) => {
    return sendMessage({
      type: 'join_room',
      room: room
    });
  }, [sendMessage]);

  const leaveRoom = useCallback((room) => {
    return sendMessage({
      type: 'leave_room',
      room: room
    });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    watchResume,
    unwatchResume,
    joinRoom,
    leaveRoom,
    reconnect: connect,
    disconnect
  };
};

export default useWebSocket;

