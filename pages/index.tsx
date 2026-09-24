import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import HomeComponent from "@/components/pages/home";

export default function Home() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{t("default-page-title")}</title>
        <meta name="description" content={t("page-description")} />
      </Head>
      <main>
        <HomeComponent />
      </main>
    </>
  );
}
