import React, { useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";
import { userService } from "../services/api";
import robotLogo from "../assets/logos/robot.png";
import forkAndKnifeLogo from "../assets/logos/fork-and-knife.png";

const AIAssist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    setIsLoading,
    addMessage,
    recipe,
    updateRecipe,
    conversationSummary,
    updateSummary,
    clearChat,
  } = useChat();
  const messagesEndRef = useRef(null);
  const initialMessageAdded = useRef(false);
  const isMounted = useRef(true);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch recipe only once when component mounts
  useEffect(() => {
    const recipeFromState = location.state?.recipe;
    if (recipeFromState) {
      updateRecipe(recipeFromState);
    } else if (!recipe) {
      const fetchRecipe = async () => {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_SERVER_URL || "http://localhost:8080"
            }/api/recipes/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch recipe");
          const recipeData = await response.json();
          if (isMounted.current) {
            updateRecipe(recipeData);
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          if (isMounted.current) {
            navigate("/saved");
          }
        }
      };

      fetchRecipe();
    }
  }, [id, navigate, location.state, recipe, updateRecipe]);

  // Add initial message only once when recipe is available
  useEffect(() => {
    if (!initialMessageAdded.current && recipe && messages.length === 0) {
      addMessage({
        type: "bot",
        content: `Hello! I'll help you with your recipe "${recipe.title}". What would you like to know?`,
      });
      initialMessageAdded.current = true;
    }
  }, [recipe, messages.length, addMessage]);

  const handleSendMessage = async (message) => {
    if (!isMounted.current) {
      return;
    }

    // Add user message
    addMessage({
      type: "user",
      content: message,
    });

    setIsLoading(true);

    try {
      // Call API to get bot response

      const response = await userService.getAIResponse(
        id,
        message,
        conversationSummary
      );

      if (isMounted.current) {
        // Add bot response
        addMessage({
          type: "bot",
          content: response.message,
        });

        // Update conversation summary
        updateSummary(response.summary);
      }
    } catch (error) {
      if (isMounted.current) {
        addMessage({
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      initialMessageAdded.current = false;
      clearChat();
    };
  }, [clearChat]);

  if (!recipe) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading recipe...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 mb-16 ${
          theme === "dark" ? "bg-[#1a1a1a]" : "bg-[#FFFDF9]"
        } rounded-3xl`}
      >
        <div id="recipe-details" className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`mb-6 flex items-center space-x-2 px-4 py-2 rounded-2xl text-[#E63946] hover:opacity-80 transition-all duration-200 focus:outline-none border-none outline-none hover:border-none hover:outline-none bg-transparent`}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <h1
              className={`text-2xl font-bold flex items-center ${
                theme === "dark" ? "text-white" : "text-[#1D1D1D]"
              }`}
            >
              <img
                src={robotLogo}
                alt="AI Assistant"
                className="w-8 h-8 mr-2"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                }}
              />
              <img
                src={forkAndKnifeLogo}
                alt="Recipe"
                className="w-8 h-8 mr-2"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(24%) sepia(98%) saturate(2472%) hue-rotate(337deg) brightness(101%) contrast(97%)",
                }}
              />
              AI Recipe Assistant
            </h1>
            <p
              className={`mt-2 ${
                theme === "dark" ? "text-gray-300" : "text-[#6C757D]"
              }`}
            >
              I'm here to help you with your recipe:{" "}
              <span className="font-semibold">{recipe.title}</span>
            </p>
          </div>

          <div
            className={`bg-white rounded-xl shadow-sm border ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-100"
            } h-[calc(100vh-280px)] flex flex-col`}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message.content}
                  isUser={message.type === "user"}
                  avatar={user?.photoURL}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AIAssist;
