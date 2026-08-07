import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import CategoriesPage from "@/components/pages/dashboard/CategoriesPage";

export default function DashboardCategoryPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="რეფერენდუმის კატეგორიების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <CategoriesPage />
    </>
  );
}
