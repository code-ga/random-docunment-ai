# Chat Components

This directory contains the AI chat functionality for the RAG application.

## Components

### ChatBox
The main chat interface component that handles:
- Real-time messaging via WebSocket connection
- Message display with user and assistant messages
- Streaming AI responses
- Connection status indicators
- Error handling and reconnection

**Props:**
- `workspaceId`: The workspace ID for the chat context
- `selectedChatId`: Currently selected chat ID (optional)
- `onChatCreated`: Callback when a new chat is created
- `onChatSelected`: Callback when a chat is selected

### ChatList
A sidebar component that displays chat history and management:
- Lists all chats for a workspace
- Chat selection and creation
- Chat title editing
- Chat deletion
- Real-time updates when new chats are created

**Props:**
- `workspaceId`: The workspace ID to load chats for
- `selectedChatId`: Currently selected chat ID
- `onChatSelect`: Callback when a chat is selected
- `onNewChat`: Callback to start a new chat
- `newChat`: New chat object to add to the list

## Features

### Real-time Communication
- WebSocket connection to the backend chat service
- Automatic authentication using session tokens
- Streaming responses from the AI assistant
- Automatic reconnection on connection loss

### Chat Management
- Create new chats automatically when sending first message
- Edit chat titles inline
- Delete chats with confirmation
- Persistent chat history

### User Experience
- Auto-scroll to latest messages
- Loading indicators during AI responses
- Connection status indicators
- Error handling with user-friendly messages
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Integration

The chat components are integrated into the workspace info page (`/workspace/info.tsx`) and provide a complete chat experience alongside document management.

## API Integration

The components integrate with the backend WebSocket API at `/chats/chat/:workspaceId` and REST endpoints for chat management:
- `GET /chats/list/:workspaceId` - List chats
- `GET /chats/:id` - Get chat details
- `PUT /chats/update/:id` - Update chat title
- `DELETE /chats/delete/:id` - Delete chat

## Styling

Components use Tailwind CSS with a dark theme consistent with the application design:
- Dark backgrounds (`bg-[#1e293b]`, `bg-[#0f172a]`)
- Blue accent colors for interactive elements
- Proper contrast for accessibility
- Responsive design for different screen sizes