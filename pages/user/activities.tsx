import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ActivitiesComponent from "@/components/pages/profile/Activities";

export default function ActivitiesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>აქტივობები - {t("default-page-title")}</title>
        <meta name="description" content="მომხმარებლის აქტივობები" />
      </Head>
      <ActivitiesComponent />
    </>
  );
}
