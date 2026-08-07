import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import QuestionsPage from "@/components/pages/dashboard/QuestionsPage";

export default function DashboardQuestionsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="რეფერენდუმის კითხვებისა და პასუხების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <QuestionsPage />
    </>
  );
}
