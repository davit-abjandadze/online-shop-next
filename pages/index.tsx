import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import HomeComponent from "@/components/pages/home";

export default function Home() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("default-page-title")} - სახალხო რეფერენდუმი`}</title>
        <meta name="description" content="მიიღეთ მონაწილეობა სახალხო რეფერენდუმში და იხილეთ საზოგადოებრივი აზრის შედეგები" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <HomeComponent />
      </main>
    </>
  );
}
