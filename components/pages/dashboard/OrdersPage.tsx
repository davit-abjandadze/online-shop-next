import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { OrdersAPI } from "@/API_Client";
import { OrdersControllerFindAllStatusEnum } from "@/API_Client/client";
import { Order, OrderStatus, PaginatedResponseDto } from "@/API_Client/types";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { ClipboardIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import DashboardLayout from "./DashboardLayout";
import { ListSkeleton } from "./Skeletons";
import * as S from "./style";

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

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

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
          <S.QuestionsList>
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
                    </S.CardActions>
                  </S.CardHeader>
                </S.QuestionCard>
              );
            })}
          </S.QuestionsList>

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
    </DashboardLayout>
  );
};

export default OrdersPage;
