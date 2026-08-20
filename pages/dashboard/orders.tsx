import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import OrdersPage from "@/components/pages/dashboard/OrdersPage";

export default function DashboardOrdersPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="მაღაზიის შეკვეთების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <OrdersPage />
    </>
  );
}
