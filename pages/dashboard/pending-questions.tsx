import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import PendingQuestionsPage from "@/components/pages/dashboard/PendingQuestionsPage";

export default function DashboardPendingQuestionsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`დასადასტურებელი კითხვები - ${t("default-page-title")}`}</title>
        <meta name="description" content="მომხმარებლების მიერ დამატებული კითხვების დამტკიცება/უარყოფა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PendingQuestionsPage />
    </>
  );
}
