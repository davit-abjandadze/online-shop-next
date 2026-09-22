import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import SizesPage from "@/components/pages/dashboard/SizesPage";
export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardSizesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="ზომების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SizesPage />
    </>
  );
}
