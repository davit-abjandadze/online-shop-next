import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import AnalyticsPage from "@/components/pages/dashboard/AnalyticsPage";

export default function DashboardAnalyticsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="რეფერენდუმის ანალიტიკა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AnalyticsPage />
    </>
  );
}
