import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import WishlistComponent from "@/components/pages/wishlist";

export default function WishlistPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{t("default-page-title")}</title>
        <meta name="description" content={t("page-description")} />
      </Head>
      <main>
        <WishlistComponent />
      </main>
    </>
  );
}
