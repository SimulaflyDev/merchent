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

        // If not the first load, find new unread notifications and trigger toast alert
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

  const handleMarkRead = async (id: string, payload: Record<string, any>) => {
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

    // Navigation logic based on payload
    if (payload?.lead_id) {
      router.push("/merchant/orders");
    } else if (payload?.ticket_id) {
      router.push("/merchant/support");
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Failed to mark all as read", err);
      // Re-fetch to sync state if failed
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
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#EAECEF] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F1F3F5]">
            <span className="text-[12px] font-semibold text-[#111827]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-medium text-[#0E9F88] hover:text-[#0b7e6c] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto divide-y divide-[#F1F3F5]">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id, notif.payload)}
                  className={`p-3 text-left hover:bg-[#F5F5F7] transition-colors cursor-pointer flex gap-2.5 relative ${
                    notif.unread ? "bg-[#0E9F88]/5" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-[11px] truncate leading-tight ${notif.unread ? "font-semibold text-[#111827]" : "text-gray-700"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[9px] text-gray-400 shrink-0 tabular-nums">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    {notif.summary && (
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-normal">
                        {notif.summary}
                      </p>
                    )}
                  </div>
                  {notif.unread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F88] shrink-0 mt-1.5"></span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-[11px] text-gray-400">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
