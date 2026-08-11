import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import UserQuestionsPage from "@/components/pages/dashboard/UserQuestionsPage";

export default function DashboardUserQuestionsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`მომხმარებლების კითხვები - ${t("default-page-title")}`}</title>
        <meta name="description" content="მომხმარებლების მიერ დამატებული, დამტკიცებული და უარყოფილი კითხვები" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <UserQuestionsPage />
    </>
  );
}
