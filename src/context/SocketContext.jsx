import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.IO server
      const socketInstance = io('https://note-backend-ud81.onrender.com', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketInstance.on('connect_error', (err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Socket connection error:', err.message);
        }
      });

      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Set up notification listeners
  useEffect(() => {
    if (socket && user) {
      // Listen for note notifications
      socket.on('notification', (data) => {
        // Skip notifications about the current user's actions
        if (data.userId === user.id) {
          return;
        }

        // Create notification message
        let message = '';
        switch (data.action) {
          case 'create':
            message = `New note created: "${data.title}"`;
            break;
          case 'update':
            message = `Note updated: "${data.title}"`;
            break;
          case 'delete':
            message = `Note deleted: "${data.title}"`;
            break;
          case 'revert':
            message = `Note reverted: "${data.title}"`;
            break;
          default:
            message = 'Note changed';
        }

        // Show toast notification
        toast(message);
      });

      // Clean up listeners on unmount or user change
      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user]);

  // Function to emit note changes
  const emitNoteChange = (action, noteId, title) => {
    if (socket && user) {
      socket.emit('noteChange', {
        action,
        noteId,
        userId: user.id,
        title
      });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, emitNoteChange }}>
      {children}
    </SocketContext.Provider>
  );
}; 
