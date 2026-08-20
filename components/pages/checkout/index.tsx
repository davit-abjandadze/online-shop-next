import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { useCart } from "@/context/Cart";
import { OrdersAPI, PaymentsAPI } from "@/API_Client";
import { Order, PaymentInitiateResponse } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import { CartIcon, LockIcon } from "@/components/ui/RefIcons";
import { CheckoutFormValues, checkoutFormSchema } from "./schemas";
import * as S from "./style";

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// შეკვეთის გაფორმების გვერდი — "შეკვეთის დადასტურება" და "გადახდის დაწყება"
// ერთი მოქმედებაა (backend-ის createFromCart → იმწამსვე payable PENDING
// შეკვეთის დიზაინის მიხედვით), ამიტომ წარმატებული submit პირდაპირ
// PaymentsAPI-ის initiate-ს იძახებს და BOG-ის redirectUrl-ზე გადამისამართებს —
// შუალედური "შეკვეთა შეიქმნა, მაგრამ არაფერი არ გვთხოვს გადახდას" გვერდი არ რჩება.
export const CheckoutComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, loading, refresh } = useCart();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { shippingAddress: "" },
  });

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
            <S.AccessDeniedText>შეკვეთის გასაფორმებლად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton type="button" onClick={() => setAuthModalOpen(true)}>
              შესვლა
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageBackground>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </>
    );
  }

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const isEmpty = !loading && items.length === 0;

  const onSubmit = handleSubmit(async (data) => {
    if (!session?.accessToken || isEmpty) return;
    setSubmitting(true);
    try {
      const orderRes = await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerCreate({
        shippingAddress: data.shippingAddress.trim(),
      });
      const order = orderRes.data as unknown as Order;

      // createFromCart-მა კალათა უკვე დაცარიელა backend-ზე — Header-ის
      // ბეჯის განახლებისთვის client-side cache-საც ვასინქრონებთ.
      refresh();

      const paymentRes = await PaymentsAPI(router.locale || "ka", session.accessToken).paymentsControllerInitiate(
        String(order.id)
      );
      const { redirectUrl } = paymentRes.data as unknown as PaymentInitiateResponse;
      // BOG-ის hosted გვერდზე გადასვლა — გარე დომეინია, next/router-ის push
      // კი client-side ნავიგაციისთვისაა, ამიტომ რეალური ბრაუზერის ნავიგაცია გვჭირდება.
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "შეკვეთის გაფორმება ვერ მოხერხდა");
      setSubmitting(false);
    }
  });

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <S.Title>შეკვეთის გაფორმება</S.Title>

          {isEmpty ? (
            <S.EmptyState>
              <CartIcon size={48} />
              <S.EmptyStateTitle>კალათა ცარიელია</S.EmptyStateTitle>
              <S.ActionButton type="button" onClick={() => router.push("/")}>
                კატალოგში დაბრუნება
              </S.ActionButton>
            </S.EmptyState>
          ) : (
            <S.Layout>
              <S.SummaryList>
                {items.map((item) => {
                  const image = resolveImage(item.product.images?.[0]);
                  return (
                    <S.SummaryItem key={item.id}>
                      <S.ItemImage>{image && <img src={image} alt={item.product.name} />}</S.ItemImage>
                      <S.ItemInfo>
                        <S.ItemName>{item.product.name}</S.ItemName>
                        <S.ItemMeta>
                          {item.quantity} x {Number(item.product.price).toFixed(2)} ₾
                        </S.ItemMeta>
                      </S.ItemInfo>
                      <S.ItemSubtotal>{(Number(item.product.price) * item.quantity).toFixed(2)} ₾</S.ItemSubtotal>
                    </S.SummaryItem>
                  );
                })}
                <S.TotalRow>
                  სულ ჯამი
                  <S.TotalValue>{total.toFixed(2)} ₾</S.TotalValue>
                </S.TotalRow>
              </S.SummaryList>

              <S.FormCard onSubmit={onSubmit} noValidate>
                <S.FormGroup>
                  <S.Label>მიწოდების მისამართი</S.Label>
                  <S.Textarea
                    rows={3}
                    placeholder="ქალაქი, ქუჩა, სახლის ნომერი..."
                    {...register("shippingAddress")}
                  />
                  {errors.shippingAddress && <S.FieldError>{errors.shippingAddress.message}</S.FieldError>}
                </S.FormGroup>
                <S.SubmitButton type="submit" disabled={submitting}>
                  {submitting ? "მუშავდება..." : "შეკვეთის დადასტურება და გადახდა"}
                </S.SubmitButton>
              </S.FormCard>
            </S.Layout>
          )}
        </S.Container>
      </S.PageBackground>
      <Footer />
    </>
  );
};

export default CheckoutComponent;
