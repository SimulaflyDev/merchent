"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useMerchant } from "@/app/merchant/context/MerchantContext";

interface Notification {
  id: string;
  kind: string;
  title: string;
  summary: string | null;
  unread: boolean;
  payload: Record<string, any>;
  created_at: string;
}

// ── Kind configuration ────────────────────────────────────────────────────────

interface KindConfig {
  bg: string;
  text: string;
  dot: string;
  icon: React.ReactNode;
}

function getKindConfig(kind: string): KindConfig {
  switch (kind) {
    case "payment":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      };
    case "wallet":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V22H4V12" />
            <path d="M22 7H2v5h20V7z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        ),
      };
    case "cancel":
      return {
        bg: "bg-red-50",
        text: "text-red-500",
        dot: "bg-red-500",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
      };
    case "product":
      return {
        bg: "bg-purple-50",
        text: "text-purple-600",
        dot: "bg-purple-500",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        ),
      };
    case "support":
      return {
        bg: "bg-sky-50",
        text: "text-sky-600",
        dot: "bg-sky-500",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        ),
      };
    case "delivery":
    case "order":
      return {
        bg: "bg-blue-50",
        text: "text-blue-600",
        dot: "bg-blue-500",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12H3l9-9 9 9h-2" />
            <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            <path d="M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
          </svg>
        ),
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-500",
        dot: "bg-gray-400",
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
      };
  }
}

// ── Smart routing by kind + payload ──────────────────────────────────────────

function resolveRoute(kind: string, payload: Record<string, any>): string | null {
  if (payload?.lead_id) return "/merchant/orders";
  if (payload?.ticket_id) return "/merchant/support";

  switch (kind) {
    case "payment":
    case "wallet":
      return "/merchant/billing";
    case "product":
      return "/merchant/products";
    case "support":
      return "/merchant/support";
    case "delivery":
    case "order":
    case "cancel":
      return "/merchant/orders";
    default:
      return null;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevNotificationsRef = useRef<Notification[]>([]);
  const isFirstLoadRef = useRef(true);
  const router = useRouter();
  const { showToast } = useMerchant();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const newItems: Notification[] = data.items || [];
        const newUnreadCount = data.unread_count || 0;

        // On subsequent loads — toast newly arrived unread items
        if (!isFirstLoadRef.current) {
          const prevIds = new Set(prevNotificationsRef.current.map((n) => n.id));
          const newlyAddedUnread = newItems.filter((n) => n.unread && !prevIds.has(n.id));

          if (newlyAddedUnread.length > 0) {
            newlyAddedUnread.forEach((n) => {
              showToast(n.title + (n.summary ? `: ${n.summary}` : ""), "info");
            });
          }
        } else {
          isFirstLoadRef.current = false;
        }

        prevNotificationsRef.current = newItems;
        setNotifications(newItems);
        setUnreadCount(newUnreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, kind: string, payload: Record<string, any>) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }

    setIsOpen(false);

    // Smart routing
    const route = resolveRoute(kind, payload);
    if (route) router.push(route);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Failed to mark all as read", err);
      fetchNotifications();
    }
  };

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-gray-400 hover:text-[#111827] hover:bg-gray-200 transition-colors relative"
        aria-label="Notifications"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#0E9F88] text-white text-[10px] font-bold rounded-full border border-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-[72px] z-50 overflow-hidden rounded-xl border border-[#EAECEF] bg-white py-1 shadow-[0_8px_30px_rgb(0,0,0,0.10)] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[340px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F1F3F5]">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#111827]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#0E9F88]/10 text-[#0E9F88] text-[10px] font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-medium text-[#0E9F88] hover:text-[#0b7e6c] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F1F3F5]">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const cfg = getKindConfig(notif.kind);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id, notif.kind, notif.payload)}
                    className={`p-3 text-left hover:bg-[#F5F5F7] transition-colors cursor-pointer flex gap-2.5 relative ${
                      notif.unread ? "bg-[#0E9F88]/4" : ""
                    }`}
                  >
                    {/* Kind icon */}
                    <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0 mt-0.5`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-[11px] leading-tight ${notif.unread ? "font-semibold text-[#111827]" : "font-medium text-gray-700"}`}>
                          {notif.title}
                        </p>
                        <span className="text-[9px] text-gray-400 shrink-0 tabular-nums mt-0.5">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>
                      {notif.summary && (
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-normal">
                          {notif.summary}
                        </p>
                      )}
                    </div>

                    {/* Unread dot */}
                    {notif.unread && (
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0 mt-1.5`} />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">You're all caught up!</p>
                <p className="text-[10px] text-gray-300 mt-0.5">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
