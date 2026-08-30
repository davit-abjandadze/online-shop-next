import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import BranchesPage from "@/components/pages/dashboard/BranchesPage";

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
