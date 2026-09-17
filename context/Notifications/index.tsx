import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { NotificationsAPI } from "@/API_Client";

// bell icon-ის unread-count badge-ის polling ინტერვალი — Real-time არ
// გვჭირდება (იხ. plans/NOTIFICATIONS_PLAN.md), ყოველ 30 წუთში საკმარისია.
const UNREAD_COUNT_POLL_INTERVAL_MS = 30 * 60 * 1000;

interface NotificationsContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  markAllRead: async () => {},
});

// Wishlist context-ის (context/Wishlist/index.tsx) იგივე თხელი client-side
// ქეშის პატერნი — bell badge-ისთვის მხოლოდ unread-count-ს ინახავს, სრული
// სია NotificationBell-შივეა ჩატვირთული (dropdown-ის გახსნისას).
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const accessToken = session?.accessToken as string | undefined;

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await NotificationsAPI(router.locale || "ka", accessToken).notificationsUserControllerGetUnreadCount();
      setUnreadCount(res.data.count ?? 0);
    } catch {
      // ჩუმად ვტოვებთ — badge უბრალოდ ძველ მნიშვნელობაზე დარჩება
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, router.locale]);

  const markAllRead = useCallback(async () => {
    if (!accessToken) return;
    await NotificationsAPI(router.locale || "ka", accessToken).notificationsUserControllerMarkAllRead();
    setUnreadCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, router.locale]);

  useEffect(() => {
    if (status === "authenticated") {
      refreshUnreadCount();
      pollRef.current = setInterval(refreshUnreadCount, UNREAD_COUNT_POLL_INTERVAL_MS);
    } else if (status === "unauthenticated") {
      setUnreadCount(0);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, accessToken]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshUnreadCount, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
