import Head from "next/head";
import OrdersComponent from "@/components/pages/orders";

const OrdersPage = () => {
  return (
    <>
      <Head>
        <title>ჩემი შეკვეთები - მაღაზია</title>
        <meta name="robots" content="noindex" />
      </Head>
      <OrdersComponent />
    </>
  );
};

export default OrdersPage;
