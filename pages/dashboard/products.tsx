import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ProductsPage from "@/components/pages/dashboard/ProductsPage";

export default function DashboardProductsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="მაღაზიის პროდუქტების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ProductsPage />
    </>
  );
}
