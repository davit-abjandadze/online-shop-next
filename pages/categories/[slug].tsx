import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import CategoryProductsPage from "@/components/pages/categoryProducts";

export default function CategorySlugPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const slug = router.query.slug as string;

  if (!router.isReady || !slug) return null;

  return (
    <>
      <Head>
        <title>{t("default-page-title")}</title>
        <meta name="description" content={t("page-description")} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <CategoryProductsPage slug={slug} />
      </main>
    </>
  );
}
