import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import CatalogComponent from "@/components/pages/catalog";

export default function ProductsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{t("default-page-title")}</title>
        <meta name="description" content={t("page-description")} />
      </Head>
      <main>
        <CatalogComponent />
      </main>
    </>
  );
}
