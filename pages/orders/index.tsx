import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import OrdersComponent from "@/components/pages/orders";

const OrdersPage = () => {
  const { t } = useTranslation("orders");
  const { t: tc } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("page-title")} - ${tc("default-page-title")}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <OrdersComponent />
    </>
  );
};

export default OrdersPage;
