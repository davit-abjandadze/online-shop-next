import Head from "next/head";
import { useRouter } from "next/router";
import OrderDetailComponent from "@/components/pages/orderDetail";

// შეკვეთის დეტალები JwtAuthGuard-ითაა დაცული ბექენდზე, ამიტომ (Cart-ის/
// Profile-ის მსგავსად) client-side fetch-ს ვიყენებთ session.accessToken-ით,
// SSR-ის ნაცვლად — id-ს router.query-დან ვიღებთ.
const OrderDetailPage = () => {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <>
      <Head>
        <title>{id ? `შეკვეთა #${id} - მაღაზია` : "შეკვეთა - მაღაზია"}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {id && <OrderDetailComponent orderId={id} />}
    </>
  );
};

export default OrderDetailPage;
