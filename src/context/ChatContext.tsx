"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface ChatContextType {
    socket: Socket | null;
    connected: boolean;
    notifications: Record<string, number>;
    clearNotifications: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!user) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        const isCrossOrigin = Boolean(socketUrl);

        const connect = (tokenForAuth?: string) => {
            const newSocket = io(socketUrl || undefined, {
                withCredentials: true,
                ...(isCrossOrigin && tokenForAuth ? { auth: { token: tokenForAuth } } : {}),
            });

            newSocket.on("connect", () => {
                console.log("🔌 Connected to socket server");
                setConnected(true);
            });

            newSocket.on("disconnect", () => {
                console.log("🔌 Disconnected from socket server");
                setConnected(false);
            });

            newSocket.on("new_message", (message) => {
                if (typeof window !== "undefined") {
                    const path = window.location.pathname;
                    if (!path.includes(`/messages`) || !path.includes(message.conversationId)) {
                        setNotifications(prev => ({
                            ...prev,
                            [message.conversationId]: (prev[message.conversationId] || 0) + 1
                        }));
                    }
                }
            });

            setSocket(newSocket);
            return newSocket;
        };

        let socketInstance: Socket | null = null;

        if (isCrossOrigin) {
            fetch("/api/auth/socket-token")
                .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not authenticated"))))
                .then((data) => {
                    socketInstance = connect(data.token);
                })
                .catch(() => {
                    // No token; socket will not connect (user may have logged out)
                });
        } else {
            socketInstance = connect();
        }

        return () => {
            if (socketInstance) socketInstance.close();
        };
    }, [user]);

    const clearNotifications = useCallback((conversationId: string) => {
        setNotifications(prev => {
            const next = { ...prev };
            delete next[conversationId];
            return next;
        });
    }, []);

    return (
        <ChatContext.Provider value={{ socket, connected, notifications, clearNotifications }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
