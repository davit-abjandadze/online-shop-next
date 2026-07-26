import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import DashboardComponent from "@/components/pages/dashboard";

export default function DashboardPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>ადმინ დეშბორდი - {t("default-page-title")}</title>
        <meta name="description" content="რეფერენდუმის კითხვებისა და პასუხების მართვა" />
      </Head>
      <DashboardComponent />
    </>
  );
}
