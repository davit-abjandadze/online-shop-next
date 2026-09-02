import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import OrderStatusBadge from "@/components/shared/OrderStatusBadge";
import { OrdersAPI, PaymentsAPI } from "@/API_Client";
import { Order, PaymentInitiateResponse } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import { ClipboardIcon, LockIcon } from "@/components/ui/RefIcons";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import * as S from "./style";

// BOG-იდან დაბრუნებისას redirect_urls.success/fail ორივე ამ გვერდზე
// (/orders/[id]?payment=success|fail) მოდის — callback (POST /payments/callback/bog)
// კი ასინქრონულია და შესაძლოა ჯერ არ იყოს დამუშავებული redirect-ის დროისთვის,
// ამიტომ "success"-ზე პირდაპირ არ ვენდობით: შეკვეთას რამდენჯერმე ხელახლა ვითხოვთ
// (ზრდადი ინტერვალით), სანამ სტატუსი რეალურად არ გადავა pending-იდან.
const CONFIRM_POLL_DELAYS_MS = [1500, 3000, 5000, 8000];

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

interface OrderDetailProps {
  orderId: string;
}

// კონკრეტული შეკვეთის დეტალური გვერდი — საკუთარი ან ADMIN. Backend 403/404-ს
// აბრუნებს სხვისი შეკვეთის/არარსებული id-ის შემთხვევაში, ორივეს აქ ცალკე,
// გასაგებ მდგომარეობად ვამუშავებთ (არა Next-ის default error page).
export const OrderDetailComponent: React.FC<OrderDetailProps> = ({ orderId }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [forbidden, setForbidden] = useState<boolean>(false);
  const [paying, setPaying] = useState<boolean>(false);
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false);
  const [confirmTimedOut, setConfirmTimedOut] = useState<boolean>(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const paymentQuery = router.query.payment as string | undefined;

  const fetchOrder = async (): Promise<Order | undefined> => {
    if (!session?.accessToken || !orderId) return undefined;
    setLoading(true);
    setNotFound(false);
    setForbidden(false);
    try {
      const res = await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerFindOne(orderId);
      const fetched = res.data as unknown as Order;
      setOrder(fetched);
      return fetched;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else if (err?.response?.status === 403) {
        setForbidden(true);
      } else {
        toast.error("შეკვეთის ჩატვირთვა ვერ მოხერხდა");
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken && orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, orderId]);

  // "payment=success"-ით დაბრუნებისას redirect თავისთავად არაფერს ადასტურებს —
  // BOG-ის webhook (POST /payments/callback/bog) ბექენდზე ასინქრონულადაა.
  // შესაბამისად შეკვეთას ვითხოვთ თავიდან ზრდადი ინტერვალებით, სანამ სტატუსი
  // pending-იდან ან ფაქტობრივად არ შეიცვლება, ან მცდელობები არ ამოიწურება.
  useEffect(() => {
    if (paymentQuery !== "success" || !order) return undefined;
    if (order.status !== "pending") return undefined;

    let attempt = 0;
    setConfirmingPayment(true);
    setConfirmTimedOut(false);

    const scheduleNext = () => {
      if (attempt >= CONFIRM_POLL_DELAYS_MS.length) {
        setConfirmingPayment(false);
        setConfirmTimedOut(true);
        return;
      }
      const delay = CONFIRM_POLL_DELAYS_MS[attempt];
      attempt += 1;
      confirmTimerRef.current = setTimeout(async () => {
        const fetched = await fetchOrder();
        if (fetched && fetched.status !== "pending") {
          setConfirmingPayment(false);
        } else {
          scheduleNext();
        }
      }, delay);
    };
    scheduleNext();

    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentQuery, order?.id, order?.status]);

  const handlePayNow = async () => {
    if (!session?.accessToken || !order) return;
    setPaying(true);
    try {
      const res = await PaymentsAPI(router.locale || "ka", session.accessToken).paymentsControllerInitiate(
        String(order.id)
      );
      const { redirectUrl } = res.data as unknown as PaymentInitiateResponse;
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "გადახდის დაწყება ვერ მოხერხდა");
      setPaying(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
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
            <S.AccessDeniedText>შეკვეთის სანახავად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.PrimaryButton type="button" onClick={() => setAuthModalOpen(true)}>
              შესვლა
            </S.PrimaryButton>
          </S.AccessDeniedCard>
        </S.PageBackground>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </>
    );
  }

  if (notFound || forbidden) {
    return (
      <>
        <Header />
        <S.PageBackground>
          <S.Container>
            <S.EmptyState>
              <ClipboardIcon size={48} />
              <S.EmptyStateTitle>
                {forbidden ? "ამ შეკვეთის ნახვის უფლება არ გაქვთ" : "შეკვეთა ვერ მოიძებნა"}
              </S.EmptyStateTitle>
              <S.PrimaryButton type="button" onClick={() => router.push("/orders")}>
                ჩემს შეკვეთებში დაბრუნება
              </S.PrimaryButton>
            </S.EmptyState>
          </S.Container>
        </S.PageBackground>
        <Footer />
      </>
    );
  }

  if (!order) {
    return null;
  }

  const items = order.items || [];

  // unitPrice ბექენდზე შენახული ფასდაკლებული ფასის სნეპშოტია — ორიგინალ
  // (ფასდაკლებამდე) ფასს OrderItem არ ინახავს, ამიტომ ვიღებთ პროდუქტის
  // ცოცხალი discountPercent/price-იდან (გამოჩნდება მხოლოდ მოქმედი
  // ფასდაკლების შემთხვევაში — თუ პროდუქტი წაშლილია/discountPercent 0-ია,
  // ორიგინალი ფასი არ გამოჩნდება).
  const itemsWithPricing = items.map((item) => {
    const originalUnitPrice = item.product ? getDiscountedPrice(item.product).originalPrice : null;
    return { item, originalUnitPrice };
  });
  const totalOriginalAmount = itemsWithPricing.reduce(
    (sum, { item, originalUnitPrice }) => sum + (originalUnitPrice ?? Number(item.unitPrice)) * item.quantity,
    0
  );
  const hasDiscount = totalOriginalAmount > Number(order.totalAmount);

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <S.BackLink type="button" onClick={() => router.push("/orders")}>
            ← ჩემი შეკვეთები
          </S.BackLink>

          {paymentQuery === "success" && confirmingPayment && (
            <S.PaymentBanner variant="pending">
              დასტურდება გადახდა... გთხოვთ დაელოდოთ.
            </S.PaymentBanner>
          )}
          {paymentQuery === "success" && confirmTimedOut && order.status === "pending" && (
            <S.PaymentBanner variant="pending">
              გადახდის დადასტურებას ცოტა მეტი დრო სჭირდება — სტატუსი აქვე განახლდება, როგორც კი დამუშავდება. თუ
              დიდხანს გაჭიანურდა, დაგვიკავშირდით.
            </S.PaymentBanner>
          )}
          {paymentQuery === "success" && !confirmingPayment && order.status !== "pending" && (
            <S.PaymentBanner variant="success">გადახდა წარმატებით დასრულდა.</S.PaymentBanner>
          )}
          {paymentQuery === "fail" && (
            <S.PaymentBanner variant="fail">
              გადახდა ვერ შესრულდა. შეგიძლიათ ხელახლა სცადოთ იმავე შეკვეთისთვის ან დაბრუნდეთ კალათაში.
              <S.PaymentBannerActions>
                {order.status === "pending" && (
                  <S.PaymentBannerButton type="button" disabled={paying} onClick={handlePayNow}>
                    {paying ? "მუშავდება..." : "ხელახლა ცდა"}
                  </S.PaymentBannerButton>
                )}
                <S.PaymentBannerLinkButton type="button" onClick={() => router.push("/cart")}>
                  კალათაში დაბრუნება
                </S.PaymentBannerLinkButton>
              </S.PaymentBannerActions>
            </S.PaymentBanner>
          )}

          <S.Card>
            <S.HeaderRow>
              <S.OrderTitle>შეკვეთა #{order.id}</S.OrderTitle>
              <OrderStatusBadge status={order.status} />
            </S.HeaderRow>

            <S.MetaGrid>
              <S.MetaItem>
                <S.MetaLabel>თარიღი</S.MetaLabel>
                <S.MetaValue>{new Date(order.createdAt).toLocaleDateString("ka-GE")}</S.MetaValue>
              </S.MetaItem>
              <S.MetaItem>
                <S.MetaLabel>მიწოდების მისამართი</S.MetaLabel>
                <S.MetaValue>{order.shippingAddress}</S.MetaValue>
              </S.MetaItem>
            </S.MetaGrid>

            <S.ItemsList>
              {itemsWithPricing.map(({ item, originalUnitPrice }) => {
                const image = item.product ? resolveImage(item.product.images?.[0]) : undefined;
                return (
                  <S.Item key={item.id}>
                    <S.ItemImage>{image && <img src={image} alt={item.productName} />}</S.ItemImage>
                    <S.ItemInfo>
                      {item.product ? (
                        <Link href={`/products/${item.product.id}`} passHref legacyBehavior>
                          <S.ItemName>{item.productName}</S.ItemName>
                        </Link>
                      ) : (
                        <S.ItemName as="span">{item.productName}</S.ItemName>
                      )}
                      <S.ItemMeta>
                        {item.quantity} x{" "}
                        {originalUnitPrice !== null && (
                          <S.ItemOriginalPrice>{originalUnitPrice.toFixed(2)} ₾</S.ItemOriginalPrice>
                        )}
                        {Number(item.unitPrice).toFixed(2)} ₾
                      </S.ItemMeta>
                    </S.ItemInfo>
                    <div>
                      <S.ItemSubtotal>{(Number(item.unitPrice) * item.quantity).toFixed(2)} ₾</S.ItemSubtotal>
                      {originalUnitPrice !== null && (
                        <S.ItemSubtotalOriginal>
                          {(originalUnitPrice * item.quantity).toFixed(2)} ₾
                        </S.ItemSubtotalOriginal>
                      )}
                    </div>
                  </S.Item>
                );
              })}
            </S.ItemsList>

            <S.TotalRow>
              სულ ჯამი
              <S.TotalValueGroup>
                <S.TotalValue>{Number(order.totalAmount).toFixed(2)} ₾</S.TotalValue>
                {hasDiscount && <S.TotalOriginalValue>{totalOriginalAmount.toFixed(2)} ₾</S.TotalOriginalValue>}
              </S.TotalValueGroup>
            </S.TotalRow>

            {order.status === "pending" && (
              <S.PayButton type="button" disabled={paying} onClick={handlePayNow}>
                {paying ? "მუშავდება..." : "გადახდა ახლავე"}
              </S.PayButton>
            )}
          </S.Card>
        </S.Container>
      </S.PageBackground>
      <Footer />
    </>
  );
};

export default OrderDetailComponent;
