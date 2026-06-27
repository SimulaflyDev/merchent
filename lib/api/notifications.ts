import "server-only";
import { api } from "./client";

export interface NotificationOut {
  id: string;
  kind: string;
  title: string;
  summary: string | null;
  unread: boolean;
  payload: Record<string, any>;
  created_at: string;
}

export interface NotificationsList {
  items: NotificationOut[];
  item_count: number;
  unread_count: number;
}

/**
 * List own notifications.
 */
export async function listNotifications(params: {
  unread_only?: boolean;
  limit?: number;
} = {}): Promise<NotificationsList> {
  const qs = new URLSearchParams();
  if (params.unread_only !== undefined) {
    qs.set("unread_only", String(params.unread_only));
  }
  if (params.limit !== undefined) {
    qs.set("limit", String(params.limit));
  }
  const q = qs.toString();
  return api<NotificationsList>(`/notifications/${q ? `?${q}` : ""}`);
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(itemId: string): Promise<NotificationOut> {
  return api<NotificationOut>(`/notifications/${itemId}/read`, {
    method: "POST",
  });
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  return api<void>("/notifications/read-all", {
    method: "POST",
  });
}
