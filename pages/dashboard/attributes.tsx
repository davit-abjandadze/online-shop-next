import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import AttributesPage from "@/components/pages/dashboard/AttributesPage";

export default function DashboardAttributesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="პროდუქტების მახასიათებლების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AttributesPage />
    </>
  );
}
