import React, { createContext, useContext, useState, useCallback } from "react";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [conversationSummary, setConversationSummary] = useState("");

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationSummary("");
    setRecipe(null);
  }, []);

  const updateRecipe = useCallback((newRecipe) => {
    setRecipe(newRecipe);
  }, []);

  const updateSummary = useCallback((summary) => {
    setConversationSummary(summary);
  }, []);

  const value = {
    messages,
    isLoading,
    recipe,
    conversationSummary,
    setIsLoading,
    addMessage,
    clearChat,
    updateRecipe,
    updateSummary,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
