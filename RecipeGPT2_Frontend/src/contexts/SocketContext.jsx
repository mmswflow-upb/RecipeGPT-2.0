import React, { createContext, useContext, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const clientRef = useRef(null);

  const connect = (onConnect, onError) => {
    const apiBaseUrl = import.meta.env.VITE_SERVER_URL;
    const sock = new SockJS(`${apiBaseUrl}/ws`);
    const client = Stomp.over(sock);
    client.connect({}, onConnect, onError);
    clientRef.current = client;
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
  };

  const send = (destination, body) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.send(destination, {}, JSON.stringify(body));
    }
  };

  const subscribe = (destination, callback) => {
    if (clientRef.current) {
      return clientRef.current.subscribe(destination, callback);
    }
    return null;
  };

  return (
    <SocketContext.Provider value={{ connect, disconnect, send, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
