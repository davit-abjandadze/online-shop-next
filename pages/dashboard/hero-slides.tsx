import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import HeroSlidesPage from "@/components/pages/dashboard/HeroSlidesPage";

export default function DashboardHeroSlidesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="მთავარი გვერდის hero სლაიდერის მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <HeroSlidesPage />
    </>
  );
}
