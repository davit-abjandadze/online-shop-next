import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import AskQuestionComponent from "@/components/pages/askQuestion";

export default function AskQuestionPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`კითხვის დამატება - ${t("default-page-title")}`}</title>
        <meta name="description" content="დასვით საკუთარი კითხვა რეფერენდუმზე" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AskQuestionComponent />
    </>
  );
}
