import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ProductSlidersPage from "@/components/pages/dashboard/ProductSlidersPage";
export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardProductSlidersPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="პროდუქტების სლაიდერების ბლოკების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ProductSlidersPage />
    </>
  );
}
