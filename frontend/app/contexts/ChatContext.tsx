import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

export interface Chat {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  title: string;
  workspaceId: string;
}

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  loading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_SELECTED_CHAT'; payload: string | null }
  | { type: 'CLEAR_CHATS' };

const initialState: ChatState = {
  chats: [],
  selectedChatId: null,
  loading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CHATS':
      return { ...state, chats: action.payload, loading: false, error: null };
    
    case 'ADD_CHAT':
      // Add new chat to the beginning of the list
      return {
        ...state,
        chats: [action.payload, ...state.chats.filter(chat => chat.id !== action.payload.id)],
        error: null,
      };
    
    case 'UPDATE_CHAT':
      // Update existing chat
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? action.payload : chat
        ),
        error: null,
      };
    
    case 'DELETE_CHAT':
      return {
        ...state,
        chats: state.chats.filter(chat => chat.id !== action.payload),
        selectedChatId: state.selectedChatId === action.payload ? null : state.selectedChatId,
        error: null,
      };
    
    case 'SET_SELECTED_CHAT':
      return { ...state, selectedChatId: action.payload };
    
    case 'CLEAR_CHATS':
      return { ...state, chats: [], selectedChatId: null, error: null };
    
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  // Helper functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;
  setSelectedChat: (chatId: string | null) => void;
  clearChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const contextValue: ChatContextType = {
    state,
    dispatch,
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setChats: (chats: Chat[]) => dispatch({ type: 'SET_CHATS', payload: chats }),
    addChat: (chat: Chat) => dispatch({ type: 'ADD_CHAT', payload: chat }),
    updateChat: (chat: Chat) => dispatch({ type: 'UPDATE_CHAT', payload: chat }),
    deleteChat: (chatId: string) => dispatch({ type: 'DELETE_CHAT', payload: chatId }),
    setSelectedChat: (chatId: string | null) => dispatch({ type: 'SET_SELECTED_CHAT', payload: chatId }),
    clearChats: () => dispatch({ type: 'CLEAR_CHATS' }),
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}