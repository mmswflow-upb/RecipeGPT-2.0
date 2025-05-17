import React, { createContext, useContext, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = (onConnect, onError) => {
    try {
      const apiBaseUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
      console.log("Attempting to connect to WebSocket at:", `${apiBaseUrl}/ws`);

      const sock = new SockJS(`${apiBaseUrl}/ws`);
      const client = Stomp.over(sock);

      // Enable debug logs temporarily
      client.debug = (str) => {
        console.log("STOMP Debug:", str);
      };

      // Add connection headers
      const headers = {
        // Add any required headers here
      };

      client.connect(
        headers,
        () => {
          console.log("WebSocket Connected Successfully");
          setIsConnected(true);
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
          if (onConnect) onConnect();
        },
        (error) => {
          console.error("WebSocket Connection Error:", error);
          setIsConnected(false);

          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            console.log(
              `Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`
            );

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }

            reconnectTimeoutRef.current = setTimeout(() => {
              connect(onConnect, onError);
            }, 5000);
          } else {
            console.error("Max reconnection attempts reached");
            if (onError)
              onError(new Error("Max reconnection attempts reached"));
          }
        }
      );

      clientRef.current = client;
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      if (onError) onError(error);
    }
  };

  const disconnect = () => {
    if (clientRef.current) {
      try {
        clientRef.current.disconnect(() => {
          console.log("WebSocket Disconnected Successfully");
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);
      }
      clientRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 0;
  };

  const send = (destination, body) => {
    if (clientRef.current && clientRef.current.connected) {
      try {
        console.log("Sending message to:", destination, body);
        clientRef.current.send(destination, {}, JSON.stringify(body));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.warn("WebSocket not connected. Message not sent.");
    }
  };

  const subscribe = (destination, callback) => {
    if (clientRef.current && clientRef.current.connected) {
      try {
        console.log("Subscribing to:", destination);
        return clientRef.current.subscribe(destination, callback);
      } catch (error) {
        console.error("Error subscribing to destination:", error);
      }
    } else {
      console.warn("WebSocket not connected. Subscription failed.");
    }
    return null;
  };

  return (
    <SocketContext.Provider
      value={{ connect, disconnect, send, subscribe, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
