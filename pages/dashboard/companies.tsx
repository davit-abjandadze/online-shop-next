import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import CompaniesPage from "@/components/pages/dashboard/CompaniesPage";

export default function DashboardCompaniesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="კომპანიების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <CompaniesPage />
    </>
  );
}
