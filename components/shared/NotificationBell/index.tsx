import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import { NotificationsAPI } from "@/API_Client";
import { NotificationDetailResponseDto } from "@/API_Client/client/models";
import { NotificationListItem, PaginatedResponseDto } from "@/API_Client/types";
import { BellIcon, CloseIcon } from "@/components/ui/RefIcons";
import { useNotifications } from "@/context/Notifications";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import MobilePopup from "@/components/ui/MobilePopup";
import * as S from "./style";

const NOTIFICATIONS_LIST_PAGE_SIZE = 10;

/**
 * Header-ში ჩასასმელი bell icon + unread-count ბეჯი (Phase F3.1),
 * dropdown-ის paginated სია (F3.2) და დაწკაპუნებისას სრული content-ის
 * მოდალი auto mark-as-read-ით (F4.1) + "ყველას მონიშვნა წაკითხულად" (F4.2).
 */
export const NotificationBell: React.FC = () => {
  const { t } = useTranslation("notifications");
  const { data: session } = useSession();
  const router = useRouter();
  const { unreadCount, refreshUnreadCount, markAllRead } = useNotifications();
  const { getOverlayProps } = useOverlayCloseHandlers();
  const isMobile = useIsMobileDevice();

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
    // მობილურზე დროფდაუნი MobilePopup-ში (portal, wrapperRef-ის გარეთ) რენდერდება
    // და თავისი backdrop-ით იხურება — გარეთ-დაწკაპუნების ეს listener მხოლოდ
    // დესქტოპის inline dropdown-ს ეხება.
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

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
      toast.error(t("toast-list-load-error") as string);
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
      toast.error(err?.response?.data?.message || (t("toast-detail-load-error") as string));
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      toast.success(t("toast-mark-all-success") as string);
    } catch {
      toast.error(t("toast-mark-all-error") as string);
    } finally {
      setMarkingAll(false);
    }
  };

  if (!session?.user) return null;

  const dropdownContent = (
    <>
      <S.DropdownHeader>
        <S.DropdownTitle>{t("dropdown-title")}</S.DropdownTitle>
        <S.MarkAllReadBtn onClick={handleMarkAllRead} disabled={markingAll || unreadCount === 0}>
          {t("mark-all-read")}
        </S.MarkAllReadBtn>
      </S.DropdownHeader>

      <S.List>
        {items.length === 0 && !loadingList ? (
          <S.EmptyList>{t("empty-list")}</S.EmptyList>
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
          {loadingList ? t("loading") : t("load-more")}
        </S.LoadMoreBtn>
      )}
    </>
  );

  return (
    <>
      <S.Wrapper ref={wrapperRef}>
        <S.BellButton
          type="button"
          onClick={handleToggleDropdown}
          aria-label={t("bell-aria-label")}
          title={t("bell-aria-label")}
        >
          <BellIcon size={20} />
          {unreadCount > 0 && <S.Badge>{unreadCount > 99 ? "99+" : unreadCount}</S.Badge>}
        </S.BellButton>

        {dropdownOpen && !isMobile && <S.Dropdown>{dropdownContent}</S.Dropdown>}
      </S.Wrapper>

      {/* მობილურ რესპონსივზე დროფდაუნის სია MobilePopup-ში (bottom-sheet) გამოდის
          ჩვეულებრივი absolute-პოზიციური Dropdown-ის ნაცვლად — იხ. ShareModal-ის იგივე პატერნი. */}
      {dropdownOpen &&
        isMobile &&
        typeof document !== "undefined" &&
        createPortal(
          <MobilePopup onClose={() => setDropdownOpen(false)} overflowScroll>
            <S.MobileContentPadding>{dropdownContent}</S.MobileContentPadding>
          </MobilePopup>,
          document.body
        )}

      {/* ═══ NOTIFICATION DETAIL MODAL (Phase F4.1) ═══════════════════════════
          createPortal document.body-ში — თუ modal-ს Header-ის შიგნით ჩვეულებრივ
          ხისებურად დავრენდერებდით, `position: fixed` overlay ტრანსფორმირებული
          წინაპრით (Header) შემოიფარგლებოდა ეკრანის ნაცვლად და ჰედერში
          გაჭედილი გამოჩნდებოდა (იხ. იგივე ხრიკი ShareModal-ში). მობილურზე
          MobilePopup (bottom-sheet) გამოიყენება ცენტრირებული ModalOverlay-ის ნაცვლად. */}
      {activeDetail && typeof document !== "undefined" && (() => {
        // მობილურ MobilePopup-ს (bottom-sheet) უკვე აქვს drag-handle და
        // backdrop-ზე დაწკაპუნებით დახურვა — ცალკე × ღილაკი ზედმეტია, მხოლოდ
        // დესქტოპის ცენტრირებულ მოდალშია საჭირო.
        const modalContent = (
          <>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>{activeDetail.title}</S.ModalTitle>
                <S.ModalDate>{new Date(activeDetail.createdAt).toLocaleString("ka-GE")}</S.ModalDate>
              </div>
              {!isMobile && (
                <S.ModalCloseButton onClick={() => setActiveDetail(null)}>
                  <CloseIcon size={16} />
                </S.ModalCloseButton>
              )}
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
                    <S.ModalActionButton key={idx} as="a" href={action.url} target="_blank" rel="noopener noreferrer">
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
          </>
        );

        if (isMobile) {
          return createPortal(
            <MobilePopup onClose={() => setActiveDetail(null)} overflowScroll>
              <S.MobileContentPadding>{modalContent}</S.MobileContentPadding>
            </MobilePopup>,
            document.body
          );
        }

        return createPortal(
          <S.ModalOverlay {...getOverlayProps(() => setActiveDetail(null))}>
            <S.ModalContent onClick={(e) => e.stopPropagation()}>{modalContent}</S.ModalContent>
          </S.ModalOverlay>,
          document.body
        );
      })()}
    </>
  );
};

export default NotificationBell;
