import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import BranchesPage from "@/components/pages/dashboard/BranchesPage";
export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardBranchesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="ფილიალების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <BranchesPage />
    </>
  );
}
