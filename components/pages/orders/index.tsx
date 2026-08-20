import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { OrdersAPI } from "@/API_Client";
import { Order } from "@/API_Client/types";
import { PaginatedResponseDto } from "@/API_Client/types";
import { ClipboardIcon, LockIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

const PAGE_SIZE = 10;

// ჩემი შეკვეთების ისტორია — გვერდიანი სია, უახლესი პირველი.
export const OrdersComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchOrders = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerFindMine(
        page,
        PAGE_SIZE
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
  }, [session?.accessToken, page]);

  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageBackground>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </S.Container>
        </S.PageBackground>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <S.PageBackground>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>საჭიროა ავტორიზაცია</S.AccessDeniedTitle>
            <S.AccessDeniedText>შეკვეთების ისტორიის სანახავად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.PrimaryButton type="button" onClick={() => setAuthModalOpen(true)}>
              შესვლა
            </S.PrimaryButton>
          </S.AccessDeniedCard>
        </S.PageBackground>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </>
    );
  }

  const handlePayNow = async (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <S.Title>ჩემი შეკვეთები</S.Title>

          {!loading && orders.length === 0 ? (
            <S.EmptyState>
              <ClipboardIcon size={48} />
              <S.EmptyStateTitle>ჯერ არცერთი შეკვეთა არ არის</S.EmptyStateTitle>
              <S.PrimaryButton type="button" onClick={() => router.push("/")}>
                კატალოგში დაბრუნება
              </S.PrimaryButton>
            </S.EmptyState>
          ) : (
            <>
              <S.ListWrapper>
                {orders.map((order) => (
                  <S.OrderCard key={order.id}>
                    <S.OrderInfo>
                      <S.OrderIdRow>
                        <S.OrderId>შეკვეთა #{order.id}</S.OrderId>
                        <OrderStatusBadge status={order.status} />
                      </S.OrderIdRow>
                      <S.OrderMeta>
                        {new Date(order.createdAt).toLocaleDateString("ka-GE")} · {order.items.length} ერთეული
                      </S.OrderMeta>
                    </S.OrderInfo>
                    <S.OrderTotal>{Number(order.totalAmount).toFixed(2)} ₾</S.OrderTotal>
                    <S.OrderActions>
                      <S.ActionButton variant="outline" onClick={() => router.push(`/orders/${order.id}`)}>
                        დეტალები
                      </S.ActionButton>
                      {order.status === "pending" && (
                        <S.ActionButton variant="primary" onClick={() => handlePayNow(order.id)}>
                          გადახდა
                        </S.ActionButton>
                      )}
                    </S.OrderActions>
                  </S.OrderCard>
                ))}
              </S.ListWrapper>

              {totalPages > 1 && (
                <S.PaginationBar>
                  <S.PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    ←
                  </S.PageButton>
                  <S.PageIndicator>
                    {page} / {totalPages}
                  </S.PageIndicator>
                  <S.PageButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    →
                  </S.PageButton>
                </S.PaginationBar>
              )}
            </>
          )}
        </S.Container>
      </S.PageBackground>
      <Footer />
    </>
  );
};

export default OrdersComponent;
