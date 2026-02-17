"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useRouter } from "next/navigation";

export default function ChatPage() {
    const { user } = useAuth();
    const { socket, connected, notifications, clearNotifications } = useChat();
    const router = useRouter();

    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/messages/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error("Fetch convs failed:", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (id: string) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages/${id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages.reverse());
                socket?.emit("join_conversation", { conversationId: id });
                clearNotifications(id);
            }
        } catch (error) {
            console.error("Fetch messages failed:", error);
        } finally {
            setLoadingMessages(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedId || !socket) return;

        socket.emit("send_message", {
            conversationId: selectedId,
            content: input.trim()
        });
        setInput("");
    };

    const handleTyping = () => {
        if (!socket || !selectedId) return;
        socket.emit("typing", { conversationId: selectedId });
    };

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        fetchConversations();
    }, [user]);

    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
        }
    }, [selectedId]);

    useEffect(() => {
        if (!socket) return;

        const onNewMessage = (message: any) => {
            if (message.conversationId === selectedId) {
                setMessages(prev => [...prev, message]);
                setTimeout(scrollToBottom, 100);
            }
            fetchConversations();
        };

        const onUserTyping = (data: { userId: string, name: string }) => {
            if (data.userId !== (user as any)?.id) {
                setTypingUser(data.name);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
            }
        };

        socket.on("new_message", onNewMessage);
        socket.on("user_typing", onUserTyping);

        return () => {
            socket.off("new_message", onNewMessage);
            socket.off("user_typing", onUserTyping);
        };
    }, [socket, selectedId, user]);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden animate-fade-in-scale">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-color)] flex-col flex z-20 ${selectedId ? 'hidden md:flex' : 'flex'}`} style={{ background: 'var(--card-bg)' }}>
                <div className="p-6 border-b border-[var(--border-color)]" style={{ background: 'var(--input-bg)' }}>
                    <h1 className="text-2xl font-black text-theme-primary tracking-tight">Network</h1>
                    <p className="text-[10px] text-theme-muted uppercase tracking-widest font-bold mt-1">Founders & Builders</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loadingConversations ? (
                        <div className="space-y-3 p-2">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-18 rounded-2xl animate-shimmer" style={{ background: 'var(--input-bg)' }} />)}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-theme-muted text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map((conv: any) => {
                            const otherUser = conv.participants.find((p: any) => p._id !== user?.id);
                            const hasUnread = notifications[conv._id] > 0;
                            const isSelected = selectedId === conv._id;

                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => setSelectedId(conv._id)}
                                    className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
                                        isSelected 
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20" 
                                        : "hover:bg-[var(--input-bg)]"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                            isSelected ? "bg-white/20 text-white" : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-[var(--input-border)] text-theme-primary"
                                        }`}>
                                            {otherUser?.name?.charAt(0)}
                                        </div>
                                        {hasUnread && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 animate-pulse" style={{ borderColor: 'var(--bg)' }}>
                                                {notifications[conv._id]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <span className={`font-bold text-sm block truncate ${isSelected ? "text-white" : "text-theme-primary"}`}>
                                            {otherUser?.name}
                                        </span>
                                        <p className={`text-xs truncate ${isSelected ? "text-white/60" : "text-theme-muted"}`}>
                                            {conv.lastMessage?.content || "Start a conversation..."}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col relative ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {selectedId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] glass flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 text-theme-secondary">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400">
                                    {conversations.find(c => c._id === selectedId)?.participants.find((p: any) => p._id !== user?.id)?.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-theme-primary text-sm sm:text-base">
                                        {conversations.find(c => c._id === selectedId)?.participants.find((p: any) => p._id !== user?.id)?.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                                        <p className="text-[9px] uppercase tracking-widest text-theme-muted font-bold">
                                            {connected ? 'Active' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, i) => {
                                        const isMe = msg.senderId === user?.id || msg.senderId?._id === user?.id;
                                        return (
                                            <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed ${
                                                    isMe 
                                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/10' 
                                                        : 'glass-card rounded-tl-sm text-theme-primary'
                                                }`}>
                                                    <p>{msg.content}</p>
                                                    <div className={`text-[9px] mt-1.5 font-bold opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Typing */}
                        {typingUser && (
                            <div className="absolute bottom-24 left-6 text-[10px] text-violet-400 font-bold uppercase tracking-wider animate-pulse">
                                {typingUser} is typing...
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 sm:p-4">
                            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 glass-card p-2 sm:p-3 rounded-2xl">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] outline-none focus:border-violet-500/50 transition-all text-theme-primary placeholder:text-theme-muted text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all shadow-lg shadow-violet-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center p-6 animate-fade-in-scale">
                        <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center animate-float">
                            <svg className="w-10 h-10 text-theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.855-1.246L3 20l1.246-4.855A9.863 9.863 0 012 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-theme-primary">Your Network</h2>
                            <p className="text-theme-muted text-sm max-w-xs">Select a conversation to start collaborating.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
