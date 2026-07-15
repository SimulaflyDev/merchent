"use client";

import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  sender: "merchant" | "consumer";
  text: string;
  timestamp: string;
}

interface ConsumerChat {
  id: string;
  consumerName: string;
  consumerInitials: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatarColor: string;
  messages: ChatMessage[];
  responses: string[];
}

interface ConsumerSupportPopupProps {
  onClose: () => void;
}

const INITIAL_CHATS: ConsumerChat[] = [
  {
    id: "chat-1",
    consumerName: "Rohan Kapoor",
    consumerInitials: "RK",
    lastMessage: "Will it reach Delhi by Friday?",
    time: "2m ago",
    unread: true,
    avatarColor: "bg-[#0E9F88]/10 text-[#0E9F88]",
    messages: [
      {
        id: "m1",
        sender: "consumer",
        text: "Hi there! I ordered the Velvet Accent Chair yesterday. Order ID is #S053-9082. Can you tell me if it has been dispatched?",
        timestamp: "10:14 AM",
      },
      {
        id: "m2",
        sender: "merchant",
        text: "Hello Rohan! Yes, your order is processed. We'll update the tracking number shortly.",
        timestamp: "10:15 AM",
      },
      {
        id: "m3",
        sender: "consumer",
        text: "Awesome, thanks! Will it reach Delhi by Friday?",
        timestamp: "10:16 AM",
      },
    ],
    responses: [
      "Sounds good, I'll keep an eye out for the tracking details. Appreciate the quick help!",
      "Perfect, thank you! Great service.",
    ],
  },
  {
    id: "chat-2",
    consumerName: "Sneha Sharma",
    consumerInitials: "SS",
    lastMessage: "Can you share the link or product ID for the matching chairs?",
    time: "1h ago",
    unread: false,
    avatarColor: "bg-purple-100 text-purple-700",
    messages: [
      {
        id: "s1",
        sender: "consumer",
        text: "Hi, does the Solid Wood Dining Table come with chairs included, or do I need to buy them separately?",
        timestamp: "Yesterday",
      },
      {
        id: "s2",
        sender: "merchant",
        text: "Hi Sneha! The table is sold separately, but we have a matching set of 4 chairs available in our store under the Dining category.",
        timestamp: "Yesterday",
      },
      {
        id: "s3",
        sender: "consumer",
        text: "Oh I see. Can you share the link or product ID for the matching chairs?",
        timestamp: "Yesterday",
      },
    ],
    responses: [
      "Got it! Thanks, I will check them out and add them to my cart now.",
      "Thanks, just placed the order for both!",
    ],
  },
  {
    id: "chat-3",
    consumerName: "Vikram Roy",
    consumerInitials: "VR",
    lastMessage: "Hey, do you offer customization for the L-shaped sectional sofa?",
    time: "2 days ago",
    unread: false,
    avatarColor: "bg-amber-100 text-amber-700",
    messages: [
      {
        id: "v1",
        sender: "consumer",
        text: "Hey, do you offer customization for the L-shaped sectional sofa? Like different fabric colors?",
        timestamp: "2 days ago",
      },
    ],
    responses: [
      "That's fantastic. I'd love it in dark grey velvet. How can I specify this during checkout?",
      "Awesome, I'll write that in the notes or contact support.",
    ],
  },
];

export default function ConsumerSupportPopup({ onClose }: ConsumerSupportPopupProps) {
  const [chats, setChats] = useState<ConsumerChat[]>(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedChatId) return;

    const messageText = inputValue.trim();
    setInputValue("");

    // Add merchant message
    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === selectedChatId) {
          const newMsg: ChatMessage = {
            id: `m-msg-${Date.now()}`,
            sender: "merchant",
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          return {
            ...c,
            lastMessage: messageText,
            time: "Just now",
            unread: false,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Simulate consumer typing & response
    if (selectedChat && selectedChat.responses.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === selectedChatId && c.responses.length > 0) {
              const [nextResponse, ...remainingResponses] = c.responses;
              const newMsg: ChatMessage = {
                id: `c-msg-${Date.now()}`,
                sender: "consumer",
                text: nextResponse,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
              return {
                ...c,
                lastMessage: nextResponse,
                time: "Just now",
                messages: [...c.messages, newMsg],
                responses: remainingResponses,
              };
            }
            return c;
          })
        );
      }, 1500);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === chatId ? { ...c, unread: false } : c))
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white border border-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Widget Header */}
      <div className="bg-[#111827] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          {selectedChatId && (
            <button
              onClick={() => setSelectedChatId(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors mr-0.5"
              title="Back to conversations"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-[#0E9F88]/20 flex items-center justify-center text-[#0E9F88] shrink-0">
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[13px] font-bold tracking-tight">
              {selectedChat ? selectedChat.consumerName : "Consumer Live Support"}
            </h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 font-medium">
                {selectedChat ? "Shopper Online" : "3 Active chats"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
          title="Minimize support"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Widget Body */}
      <div className="flex-1 overflow-hidden bg-[#F8FAFB] flex flex-col">
        {!selectedChatId || !selectedChat ? (
          /* CONVERSATION LIST */
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Recent Shopper Queries
            </div>
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${
                  chat.unread ? "bg-white shadow-sm border border-gray-100" : "hover:bg-white/60"
                }`}
              >
                <div className={`w-9 h-9 rounded-full ${chat.avatarColor} flex items-center justify-center font-bold text-[12px] shrink-0`}>
                  {chat.consumerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className={`text-[12px] ${chat.unread ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                      {chat.consumerName}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{chat.time}</span>
                  </div>
                  <p className={`text-[11px] truncate ${chat.unread ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E9F88] shrink-0 mt-1.5 self-start" />
                )}
              </button>
            ))}
          </div>
        ) : (
          /* ACTIVE CHAT SCREEN */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {selectedChat.messages.map((msg) => {
                const isMerchant = msg.sender === "merchant";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isMerchant ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                        isMerchant
                          ? "bg-[#0E9F88] text-white rounded-tr-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">{msg.timestamp}</span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col max-w-[80%] mr-auto items-start">
                  <div className="bg-white border border-gray-100 px-3.5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Message Input Bar */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Type a reply to the shopper..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-[12px] outline-none focus:ring-1 focus:ring-[#0E9F88] focus:border-[#0E9F88] text-gray-800 transition-all font-medium placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all ${
                  inputValue.trim()
                    ? "bg-[#0E9F88] text-white hover:bg-[#0c8a76] shadow-sm cursor-pointer"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
                title="Send reply"
              >
                <svg className="w-4 h-4 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
