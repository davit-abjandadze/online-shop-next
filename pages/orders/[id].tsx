import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import OrderDetailComponent from "@/components/pages/orderDetail";

// შეკვეთის დეტალები JwtAuthGuard-ითაა დაცული ბექენდზე, ამიტომ (Cart-ის/
// Profile-ის მსგავსად) client-side fetch-ს ვიყენებთ session.accessToken-ით,
// SSR-ის ნაცვლად — id-ს router.query-დან ვიღებთ.
const OrderDetailPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { t } = useTranslation("orders");
  const { t: tc } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${id ? t("order-id", { id }) : t("order-detail-page-title")} - ${tc("default-page-title")}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {id && <OrderDetailComponent orderId={id} />}
    </>
  );
};

export default OrderDetailPage;
