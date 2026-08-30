import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ColorsPage from "@/components/pages/dashboard/ColorsPage";

export default function DashboardColorsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="ფერების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ColorsPage />
    </>
  );
}
