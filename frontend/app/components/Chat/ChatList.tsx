import { MessageCircle, Plus, Trash2, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";
import { client } from "../../lib/client";

interface Chat {
  id: string;
  title: string;
  userId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatListProps {
  workspaceId: string;
  selectedChatId?: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  newChat?: Chat | null;
}

export default function ChatList({ 
  workspaceId, 
  selectedChatId, 
  onChatSelect, 
  onNewChat,
  newChat 
}: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Load chats when component mounts or workspaceId changes
  useEffect(() => {
    loadChats();
  }, [workspaceId]);

  // Add new chat to list when created
  useEffect(() => {
    if (newChat && !chats.find(chat => chat.id === newChat.id)) {
      setChats(prev => [newChat, ...prev]);
    }
  }, [newChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await client.api.chats.list({ workspaceId }).get();
      
      if (response.error) {
        setError(response.error.value.message || "Failed to load chats");
        return;
      }

      if (response.data?.success && response.data.data?.chats) {
        setChats(response.data.data.chats);
      } else {
        setError(response.data?.message || "Failed to load chats");
      }
    } catch (err) {
      console.error("Error loading chats:", err);
      setError("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      const response = await client.api.chats.delete({ id: chatId }).delete();
      
      if (response.error) {
        setError(response.error.value.message || "Failed to delete chat");
        return;
      }

      if (response.data?.success) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        
        // If the deleted chat was selected, clear selection
        if (selectedChatId === chatId) {
          onNewChat();
        }
      } else {
        setError(response.data?.message || "Failed to delete chat");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError("Failed to delete chat");
    }
  };

  const handleEditChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    setEditingChatId(chatId);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = async (chatId: string) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      const response = await client.api.chats.update({ id: chatId }).put({
        title: editTitle.trim()
      });
      
      if (response.error) {
        setError(response.error.value.message || "Failed to update chat");
        return;
      }

      if (response.data?.success) {
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, title: editTitle.trim() }
            : chat
        ));
        setEditingChatId(null);
        setEditTitle("");
      } else {
        setError(response.data?.message || "Failed to update chat");
      }
    } catch (err) {
      console.error("Error updating chat:", err);
      setError("Failed to update chat");
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(chatId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#1e293b] rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading chats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1e293b] rounded-lg border border-gray-700 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            Chat History
          </h3>
          <button
            onClick={onNewChat}
            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-700 transition"
            title="New Chat"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-900/50 border-b border-red-700 text-red-300 text-xs">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-3">
            <MessageCircle className="w-8 h-8 mb-2 text-gray-500" />
            <p className="text-center text-sm">No chats yet</p>
            <p className="text-xs text-center">Start a conversation</p>
          </div>
        ) : (
          <div className="p-1 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`group p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedChatId === chat.id
                    ? "bg-blue-600/20 border border-blue-500/50"
                    : "hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, chat.id)}
                        onBlur={() => handleSaveEdit(chat.id)}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h4 className="font-medium text-white truncate text-sm">
                        {chat.title}
                      </h4>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <button
                      onClick={(e) => handleEditChat(chat.id, e)}
                      className="text-gray-400 hover:text-yellow-400 p-1 rounded hover:bg-gray-600 transition"
                      title="Edit chat title"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-600 transition"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition text-xs font-medium"
        >
          <Plus className="w-3 h-3" />
          New Chat
        </button>
      </div>
    </div>
  );
}