import { Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "../../lib/auth";
import { client } from "../../lib/client";
import { BASE_API_URL } from "../../constant";
import { useChat } from "../../contexts/ChatContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeStarryNight from "rehype-starry-night";



interface Message {
  id: string;
  createdAt: Date | null;
  userId: string | null;
  name: string | null;
  chatId: string;
  role: "user" | "assistant";
  content: string | null;
  index: number;
}

interface Chat {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  title: string;
  workspaceId: string;
}

interface ChatBoxProps {
  workspaceId: string;
}

export default function ChatBox({ workspaceId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { data: session } = useSession();
  const { state: chatState, addChat, updateChat, setSelectedChat } = useChat();

  const selectedChatId = chatState.selectedChatId;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session?.session.token || !workspaceId) return;

    const connectWebSocket = () => {
      try {
        const wsUrl = `${BASE_API_URL}/api/chats/chat/${workspaceId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected");
          // setIsConnected(true);
          setError("Authenticating...");

          // Authenticate
          ws.send(
            JSON.stringify({
              type: "AUTH",
              data: {
                token: encodeURIComponent(session.session.token),
              },
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            // console.log("WebSocket message:", response);

            if (response.success && response.data) {
              if (response.data.type === "AUTH") {
                // Authentication response received
                if (response.data.user) {
                  // Authentication successful
                  setIsConnected(true);
                  setError(null);
                }
              } else if (response.type === "error") {
                // Error received
                setError(response.message);
              } else if (response.data.type === "CHAT_INFO") {
                // Chat info received
                const chat = response.data.chat;
                setCurrentChat(chat);
                addChat(chat);
                setSelectedChat(chat.id);
              } else if (response.data.type === "CHAT_INFO_UPDATE") {
                // Chat info updated (e.g., title changed by AI)
                const updatedChatData = response.data.chat;
                let updatedChat;
                if (
                  updatedChatData &&
                  Array.isArray(updatedChatData) &&
                  updatedChatData.length > 0
                ) {
                  updatedChat = updatedChatData[0];
                } else if (updatedChatData && !Array.isArray(updatedChatData)) {
                  updatedChat = updatedChatData;
                }

                if (updatedChat) {
                  setCurrentChat(updatedChat);
                  updateChat(updatedChat);
                }
              } else if (response.data.type === "MESSAGE") {
                // AI response chunk received
                const chunk = response.data.message;
                if (chunk) {
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === "assistant") {
                      // Append to existing assistant message
                      return prev.map((msg, index) =>
                        index === prev.length - 1
                          ? { ...msg, content: msg.content + chunk.content }
                          : msg
                      );
                    } else {
                      // Create new assistant message
                      return [
                        ...prev,
                        {
                          id: chunk.id,
                          role: chunk.role,
                          content: chunk.content,
                          index: chunk.index,
                          chatId: chunk.chatId,
                          createdAt: chunk.createdAt,
                          userId: chunk.userId,
                          name: chunk.name,
                        },
                      ];
                    }
                  });
                }
              } else if (response.data.type === "USER_MESSAGE") {
                // User message received
                const message = response.data.message;
                if (message) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: message.id,
                      role: message.role,
                      content: message.content,
                      index: message.index,
                      chatId: message.chatId,
                      createdAt: message.createdAt,
                      userId: message.userId,
                      name: message.name,
                    },
                  ]);
                }
              } else if (response.data.type === "FINAL_MESSAGE") {
                // Final message received
                const message = response.data.message;
                if (message) {
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === message.id ? message : msg))
                  );
                }
                setIsLoading(false);
                setError(null);
              }
            } else if (!response.success) {
              setError(response.message || "An error occurred");
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("Connection error occurred");
          setIsConnected(false);
        };
      } catch (err) {
        console.error("Error creating WebSocket:", err);
        setError("Failed to connect to chat service");
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [session?.session.token, workspaceId]);

  // Load existing chat when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && selectedChatId !== currentChat?.id) {
      loadChatMessages(selectedChatId);
    }
    if (!selectedChatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  }, [selectedChatId]);

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await client.api.chats({ id: chatId }).get();
      if (response.data?.success && response.data.data?.chat) {
        // setCurrentChat(response.data.data.chat);
        setCurrentChat({
          ...response.data.data.chat,
        });
        // TODO: Load messages for this chat
        // For now, we'll clear messages as the backend doesn't seem to have message loading endpoint
        const messages = await client.api.chats.messages({ id: chatId }).get();
        // setMessages([]);
        if (messages.data?.success && messages.data.data?.messages) {
          setMessages(messages.data.data.messages || []);
        }
      }
    } catch (err) {
      console.error("Error loading chat:", err);
      setError("Failed to load chat");
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !isConnected || isLoading) return;

    // const userMessage: Message = {
    //   id: Date.now().toString(),
    //   role: "user",
    //   content: inputMessage.trim(),
    //   timestamp: new Date(),
    // };

    // setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "CHAT",
            data: {
              message: inputMessage.trim(),
              chatId: selectedChatId,
            },
          })
        );
      } else {
        throw new Error("WebSocket not connected");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChat(null);
    setSelectedChat(null);
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#1e293b] rounded-lg border border-gray-700">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">
            {currentChat?.title || "AI Assistant"}
          </h3>
          {isConnected ? (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          ) : (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
        <button
          onClick={startNewChat}
          className="text-sm text-blue-400 hover:text-blue-300 px-3 py-1 rounded border border-blue-400 hover:border-blue-300 transition"
        >
          New Chat
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/50 border-b border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="w-12 h-12 mb-4 text-gray-500" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Ask me anything about your documents</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  <Markdown remarkPlugins={[remarkGfm,rehypeStarryNight]}>
                    {message.content}
                  </Markdown>
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {/* {message.createdAt?.toLocaleTimeString()} */}
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your documents..."
            className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-500 transition"
            rows={1}
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
