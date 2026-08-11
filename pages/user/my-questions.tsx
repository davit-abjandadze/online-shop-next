import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import MyQuestionsComponent from "@/components/pages/profile/MyQuestions";

export default function MyQuestionsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ჩემი დასმული კითხვები - ${t("default-page-title")}`}</title>
        <meta name="description" content="თქვენ მიერ დამატებული კითხვების სტატუსი" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MyQuestionsComponent />
    </>
  );
}
