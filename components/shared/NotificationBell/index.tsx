import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { NotificationsAPI } from "@/API_Client";
import { NotificationDetailResponseDto } from "@/API_Client/client/models";
import { NotificationListItem, PaginatedResponseDto } from "@/API_Client/types";
import { BellIcon, CloseIcon } from "@/components/ui/RefIcons";
import { useNotifications } from "@/context/Notifications";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import * as S from "./style";

const NOTIFICATIONS_LIST_PAGE_SIZE = 10;

/**
 * Header-ში ჩასასმელი bell icon + unread-count ბეჯი (Phase F3.1),
 * dropdown-ის paginated სია (F3.2) და დაწკაპუნებისას სრული content-ის
 * მოდალი auto mark-as-read-ით (F4.1) + "ყველას მონიშვნა წაკითხულად" (F4.2).
 */
export const NotificationBell: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { unreadCount, refreshUnreadCount, markAllRead } = useNotifications();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState<NotificationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const [activeDetail, setActiveDetail] = useState<NotificationDetailResponseDto | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const accessToken = session?.accessToken as string | undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchList = async (targetPage: number) => {
    if (!accessToken) return;
    setLoadingList(true);
    try {
      const res = await NotificationsAPI(
        router.locale || "ka",
        accessToken
      ).notificationsUserControllerFindAll(targetPage, NOTIFICATIONS_LIST_PAGE_SIZE, "createdAt", "DESC" as any);
      const data = res.data as unknown as PaginatedResponseDto<NotificationListItem>;
      const newItems = Array.isArray(data?.data) ? data.data : [];
      setItems((prev) => (targetPage === 1 ? newItems : [...prev, ...newItems]));
      setHasNext(Boolean(data?.meta?.hasNext));
      setPage(targetPage);
    } catch {
      toast.error("შეტყობინებების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingList(false);
    }
  };

  const handleToggleDropdown = () => {
    const next = !dropdownOpen;
    setDropdownOpen(next);
    if (next) {
      fetchList(1);
    }
  };

  const handleItemClick = async (item: NotificationListItem) => {
    if (!accessToken) return;
    try {
      const res = await NotificationsAPI(router.locale || "ka", accessToken).notificationsUserControllerFindOne(
        item.id
      );
      setActiveDetail(res.data);
      setDropdownOpen(false);
      if (!item.isRead) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
        refreshUnreadCount();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "შეტყობინების ჩატვირთვა ვერ მოხერხდა");
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      toast.success("ყველა შეტყობინება მონიშნულია წაკითხულად");
    } catch {
      toast.error("მოქმედება ვერ შესრულდა");
    } finally {
      setMarkingAll(false);
    }
  };

  if (!session?.user) return null;

  return (
    <>
      <S.Wrapper ref={wrapperRef}>
        <S.BellButton type="button" onClick={handleToggleDropdown} aria-label="შეტყობინებები" title="შეტყობინებები">
          <BellIcon size={20} />
          {unreadCount > 0 && <S.Badge>{unreadCount > 99 ? "99+" : unreadCount}</S.Badge>}
        </S.BellButton>

        {dropdownOpen && (
          <S.Dropdown>
            <S.DropdownHeader>
              <S.DropdownTitle>შეტყობინებები</S.DropdownTitle>
              <S.MarkAllReadBtn onClick={handleMarkAllRead} disabled={markingAll || unreadCount === 0}>
                ყველას მონიშვნა წაკითხულად
              </S.MarkAllReadBtn>
            </S.DropdownHeader>

            <S.List>
              {items.length === 0 && !loadingList ? (
                <S.EmptyList>შეტყობინებები არ არის</S.EmptyList>
              ) : (
                items.map((item) => (
                  <S.ListItem key={item.id} unread={!item.isRead} onClick={() => handleItemClick(item)}>
                    <S.ItemDot unread={!item.isRead} />
                    {item.imageUrl ? (
                      <S.ItemThumbnail>
                        <img src={item.imageUrl} alt="" />
                      </S.ItemThumbnail>
                    ) : (
                      <S.ItemThumbnail>
                                              <img src={"/icons/notification.png"} alt="" />

                      </S.ItemThumbnail>
                    )}
                    <S.ItemBody>
                      <S.ItemTitle unread={!item.isRead}>{item.title}</S.ItemTitle>
                      <S.ItemSnippet>{item.snippet}</S.ItemSnippet>
                      <S.ItemDate>{new Date(item.createdAt).toLocaleString("ka-GE")}</S.ItemDate>
                    </S.ItemBody>
                  </S.ListItem>
                ))
              )}
            </S.List>

            {hasNext && (
              <S.LoadMoreBtn onClick={() => fetchList(page + 1)} disabled={loadingList}>
                {loadingList ? "იტვირთება..." : "მეტის ჩვენება"}
              </S.LoadMoreBtn>
            )}
          </S.Dropdown>
        )}
      </S.Wrapper>

      {/* ═══ NOTIFICATION DETAIL MODAL (Phase F4.1) ═══════════════════════════
          createPortal document.body-ში — თუ modal-ს Header-ის შიგნით ჩვეულებრივ
          ხისებურად დავრენდერებდით, `position: fixed` overlay ტრანსფორმირებული
          წინაპრით (Header) შემოიფარგლებოდა ეკრანის ნაცვლად და ჰედერში
          გაჭედილი გამოჩნდებოდა (იხ. იგივე ხრიკი ShareModal-ში). */}
      {activeDetail &&
        typeof document !== "undefined" &&
        createPortal(
          <S.ModalOverlay {...getOverlayProps(() => setActiveDetail(null))}>
            <S.ModalContent onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <div>
                  <S.ModalTitle>{activeDetail.title}</S.ModalTitle>
                  <S.ModalDate>{new Date(activeDetail.createdAt).toLocaleString("ka-GE")}</S.ModalDate>
                </div>
                <S.ModalCloseButton onClick={() => setActiveDetail(null)}>
                  <CloseIcon size={16} />
                </S.ModalCloseButton>
              </S.ModalHeader>
              {activeDetail.imageUrl && (
                <S.ModalImage>
                  <img src={activeDetail.imageUrl} alt="" />
                </S.ModalImage>
              )}
              <S.ModalBody dangerouslySetInnerHTML={{ __html: activeDetail.contentHtml }} />
              {activeDetail.actions && activeDetail.actions.length > 0 && (
                <S.ModalActionsRow>
                  {activeDetail.actions.map((action, idx) =>
                    action.type === "link" ? (
                      <S.ModalActionButton
                        key={idx}
                        as="a"
                        href={action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {action.label}
                      </S.ModalActionButton>
                    ) : (
                      <S.ModalActionButton key={idx} type="button" onClick={() => setActiveDetail(null)}>
                        {action.label}
                      </S.ModalActionButton>
                    )
                  )}
                </S.ModalActionsRow>
              )}
            </S.ModalContent>
          </S.ModalOverlay>,
          document.body
        )}
    </>
  );
};

export default NotificationBell;
