import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { OrdersAPI } from "@/API_Client";
import { OrdersControllerFindAllStatusEnum } from "@/API_Client/client";
import { Order, OrderStatus, PaginatedResponseDto } from "@/API_Client/types";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { CDN_URL } from "@/constants";
import {
  BuildingIcon,
  CalendarIcon,
  ClipboardIcon,
  CloseIcon,
  GridOneIcon,
  GridThreeIcon,
  GridTwoIcon,
  MailIcon,
  SearchIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import DashboardLayout from "./DashboardLayout";
import { ListSkeleton } from "./Skeletons";
import * as S from "./style";

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  courier: "კურიერი",
  pickup: "თვითმიღება",
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "ყველა სტატუსი" },
  { value: "pending", label: "გადასახდელი" },
  { value: "paid", label: "გადახდილი" },
  { value: "processing", label: "მუშავდება" },
  { value: "shipped", label: "გაგზავნილია" },
  { value: "delivered", label: "მიწოდებულია" },
  { value: "cancelled", label: "გაუქმებულია" },
  { value: "expired", label: "ვადაგასულია" },
];

export const OrdersPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  // ─── ბადრაგის სვეტების რაოდენობა (1/2/3 ერთ რიგში) ──────────────────────────
  const [gridColumns, setGridColumns] = useState<1 | 2 | 3>(1);

  // ─── დეტალების მოდალში გახსნილი შეკვეთა ──────────────────────────────────────
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);

  // ორდერისთვის pending select-ის მნიშვნელობა და "ინახება" flag — status
  // update-ისას შესაბამისი row-ს ვამოწმებთ, სხვას არ ვბლოკავთ.
  const [pendingStatus, setPendingStatus] = useState<Record<number, OrderStatus>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerFindAll(
        page,
        PAGE_SIZE,
        undefined,
        undefined,
        (statusFilter || undefined) as OrdersControllerFindAllStatusEnum | undefined
      );
      const data = res.data as unknown as PaginatedResponseDto<Order>;
      setOrders(Array.isArray(data?.data) ? data.data : []);
      setTotalPages(data?.meta?.totalPages || 1);
    } catch {
      toast.error("შეკვეთების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, page, statusFilter]);

  const handleStatusChange = (orderId: number, next: OrderStatus) => {
    setPendingStatus((prev) => ({ ...prev, [orderId]: next }));
  };

  const handleSaveStatus = async (order: Order) => {
    const next = pendingStatus[order.id];
    if (!next || next === order.status || !session?.accessToken) return;
    setSavingId(order.id);
    try {
      await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerUpdateStatus(String(order.id), {
        status: next as any,
      });
      toast.success("სტატუსი წარმატებით განახლდა!");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სტატუსის განახლება ვერ მოხერხდა");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout title="შეკვეთები" subtitle="მართეთ მომხმარებლების შეკვეთები და სტატუსები">
      <S.FilterBar>
        <S.FilterBarHeader>
          <S.FilterBarTitle>
            <ClipboardIcon size={16} /> ფილტრი
          </S.FilterBarTitle>
          <S.FilterActions>
            <S.GridToggle>
              <S.GridToggleButton
                type="button"
                active={gridColumns === 1}
                title="1 ბარათი რიგში"
                onClick={() => setGridColumns(1)}
              >
                <GridOneIcon size={16} />
              </S.GridToggleButton>
              <S.GridToggleButton
                type="button"
                active={gridColumns === 2}
                title="2 ბარათი რიგში"
                onClick={() => setGridColumns(2)}
              >
                <GridTwoIcon size={16} />
              </S.GridToggleButton>
              <S.GridToggleButton
                type="button"
                active={gridColumns === 3}
                title="3 ბარათი რიგში"
                onClick={() => setGridColumns(3)}
              >
                <GridThreeIcon size={16} />
              </S.GridToggleButton>
            </S.GridToggle>
          </S.FilterActions>
        </S.FilterBarHeader>
        <S.FilterGrid>
          <S.FilterGroup>
            <S.FilterLabel>სტატუსი</S.FilterLabel>
            <S.Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | "");
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </S.Select>
          </S.FilterGroup>
        </S.FilterGrid>
      </S.FilterBar>

      {loading ? (
        <ListSkeleton count={PAGE_SIZE} />
      ) : orders.length === 0 ? (
        <S.EmptyState>
          <ClipboardIcon size={48} />
          <S.EmptyTitle>შეკვეთები არ არის</S.EmptyTitle>
          <S.EmptyText>ამ ფილტრით არცერთი შეკვეთა ვერ მოიძებნა.</S.EmptyText>
        </S.EmptyState>
      ) : (
        <>
          <S.UsersGrid columns={gridColumns}>
            {orders.map((order) => {
              const selected = pendingStatus[order.id] ?? order.status;
              const dirty = selected !== order.status;
              return (
                <S.QuestionCard key={order.id}>
                  <S.CardHeader>
                    <div>
                      <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ClipboardIcon size={18} /> შეკვეთა #{order.id}
                      </S.QuestionText>
                      <S.BadgeGroup>
                        <OrderStatusBadge status={order.status} />
                        <S.Badge variant="date">{Number(order.totalAmount).toFixed(2)} ₾</S.Badge>
                        <S.Badge variant="date">{order.items.length} ერთეული</S.Badge>
                        <S.Badge variant="date">
                          {order.user.firstName} {order.user.lastName}
                        </S.Badge>
                        <S.Badge variant="date">{new Date(order.createdAt).toLocaleDateString("ka-GE")}</S.Badge>
                      </S.BadgeGroup>
                    </div>
                    <S.CardActions>
                      <S.Select
                        style={{ width: 170 }}
                        value={selected}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      >
                        {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </S.Select>
                      <S.ActionButton
                        variant="primary"
                        disabled={!dirty || savingId === order.id}
                        onClick={() => handleSaveStatus(order)}
                      >
                        {savingId === order.id ? "ინახება..." : "შენახვა"}
                      </S.ActionButton>
                      <S.ActionButton variant="outline" onClick={() => setDetailsOrder(order)}>
                        <SearchIcon size={16} /> დეტალები
                      </S.ActionButton>
                    </S.CardActions>
                  </S.CardHeader>
                </S.QuestionCard>
              );
            })}
          </S.UsersGrid>

          {totalPages > 1 && (
            <S.PaginationBar>
              <S.PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                ←
              </S.PageButton>
              <S.PageNumbers>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <S.PageNumberButton key={n} active={n === page} onClick={() => setPage(n)}>
                    {n}
                  </S.PageNumberButton>
                ))}
              </S.PageNumbers>
              <S.PageButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                →
              </S.PageButton>
            </S.PaginationBar>
          )}
        </>
      )}

      {/* ═══ ORDER DETAILS MODAL ═════════════════════════════════════════════ */}
      {detailsOrder && (
        <S.ModalOverlay {...getOverlayProps(() => setDetailsOrder(null))}>
          <S.ModalContent style={{ maxWidth: 800 }} onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClipboardIcon size={18} /> შეკვეთა #{detailsOrder.id}
              </S.ModalTitle>
              <S.CloseButton onClick={() => setDetailsOrder(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>

            <S.BadgeGroup>
              <OrderStatusBadge status={detailsOrder.status} />
              <S.Badge variant="date">{Number(detailsOrder.totalAmount).toFixed(2)} {detailsOrder.currency}</S.Badge>
              <S.Badge variant="date">
                {detailsOrder.items.reduce((sum, item) => sum + item.quantity, 0)} ცალი ({detailsOrder.items.length} სახეობა)
              </S.Badge>
              <S.Badge variant="date">
                <CalendarIcon size={13} /> {new Date(detailsOrder.createdAt).toLocaleDateString("ka-GE")}
              </S.Badge>
            </S.BadgeGroup>

            <S.OrderDetailMetaGrid>
              <S.OrderDetailMetaItem>
                <S.OrderDetailMetaLabel>
                  <UserIcon size={13} /> მომხმარებელი
                </S.OrderDetailMetaLabel>
                <S.OrderDetailMetaValue>
                  {detailsOrder.user.firstName} {detailsOrder.user.lastName} (ID: {detailsOrder.user.id})
                </S.OrderDetailMetaValue>
              </S.OrderDetailMetaItem>
              <S.OrderDetailMetaItem>
                <S.OrderDetailMetaLabel>
                  <MailIcon size={13} /> ელ. ფოსტა
                </S.OrderDetailMetaLabel>
                <S.OrderDetailMetaValue>{detailsOrder.user.email}</S.OrderDetailMetaValue>
              </S.OrderDetailMetaItem>
              <S.OrderDetailMetaItem>
                <S.OrderDetailMetaLabel>ტელეფონი</S.OrderDetailMetaLabel>
                <S.OrderDetailMetaValue>{detailsOrder.user.phoneNumber || "—"}</S.OrderDetailMetaValue>
              </S.OrderDetailMetaItem>
              <S.OrderDetailMetaItem>
                <S.OrderDetailMetaLabel>
                  <TruckIcon size={13} /> მიწოდების მეთოდი
                </S.OrderDetailMetaLabel>
                <S.OrderDetailMetaValue>
                  {DELIVERY_METHOD_LABELS[detailsOrder.deliveryMethod] || detailsOrder.deliveryMethod}
                </S.OrderDetailMetaValue>
              </S.OrderDetailMetaItem>
              {detailsOrder.branch && (
                <S.OrderDetailMetaItem>
                  <S.OrderDetailMetaLabel>
                    <BuildingIcon size={13} /> ფილიალი
                  </S.OrderDetailMetaLabel>
                  <S.OrderDetailMetaValue>
                    {detailsOrder.branch.title} ({detailsOrder.branch.address})
                  </S.OrderDetailMetaValue>
                </S.OrderDetailMetaItem>
              )}
              {detailsOrder.shippingAddress && (
                <S.OrderDetailMetaItem>
                  <S.OrderDetailMetaLabel>მიწოდების მისამართი</S.OrderDetailMetaLabel>
                  <S.OrderDetailMetaValue>{detailsOrder.shippingAddress}</S.OrderDetailMetaValue>
                </S.OrderDetailMetaItem>
              )}
              <S.OrderDetailMetaItem>
                <S.OrderDetailMetaLabel>განახლების თარიღი</S.OrderDetailMetaLabel>
                <S.OrderDetailMetaValue>{new Date(detailsOrder.updatedAt).toLocaleString("ka-GE")}</S.OrderDetailMetaValue>
              </S.OrderDetailMetaItem>
              {detailsOrder.expiresAt && (
                <S.OrderDetailMetaItem>
                  <S.OrderDetailMetaLabel>ვადის გასვლა</S.OrderDetailMetaLabel>
                  <S.OrderDetailMetaValue>{new Date(detailsOrder.expiresAt).toLocaleString("ka-GE")}</S.OrderDetailMetaValue>
                </S.OrderDetailMetaItem>
              )}
            </S.OrderDetailMetaGrid>

            <S.UserDetailLabel style={{ display: "block", marginBottom: 4 }}>
              შეკვეთის შემადგენლობა
            </S.UserDetailLabel>
            <S.OrderItemsList>
              {detailsOrder.items.map((item) => {
                const image = item.product ? resolveImage(item.product.images?.[0]) : undefined;
                return (
                  <S.OrderItemRow key={item.id}>
                    <S.OrderItemImage>{image && <img src={image} alt={item.productName} />}</S.OrderItemImage>
                    <S.OrderItemInfo>
                      {item.product ? (
                        <Link href={`/products/${item.product.id}`} passHref legacyBehavior>
                          <S.OrderItemName as="a" style={{ cursor: "pointer" }}>
                            {item.productName}
                          </S.OrderItemName>
                        </Link>
                      ) : (
                        <S.OrderItemName>{item.productName}</S.OrderItemName>
                      )}
                      <S.OrderItemMeta>
                        {item.quantity} x {Number(item.unitPrice).toFixed(2)} {detailsOrder.currency}
                      </S.OrderItemMeta>
                    </S.OrderItemInfo>
                    <S.OrderItemSubtotal>
                      {(Number(item.unitPrice) * item.quantity).toFixed(2)} {detailsOrder.currency}
                    </S.OrderItemSubtotal>
                  </S.OrderItemRow>
                );
              })}
            </S.OrderItemsList>

            <S.OrderTotalRow>
              სულ ჯამი
              <S.OrderTotalValue>
                {Number(detailsOrder.totalAmount).toFixed(2)} {detailsOrder.currency}
              </S.OrderTotalValue>
            </S.OrderTotalRow>

            <S.ModalFooter>
              <S.ActionButton type="button" variant="secondary" onClick={() => setDetailsOrder(null)}>
                დახურვა
              </S.ActionButton>
            </S.ModalFooter>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </DashboardLayout>
  );
};

export default OrdersPage;
