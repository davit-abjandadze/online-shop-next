import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import FavoritesComponent from "@/components/pages/profile/Favorites";

export default function FavoritesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>ფავორიტები - {t("default-page-title")}</title>
        <meta name="description" content="მომხმარებლის ფავორიტი კითხვები" />
      </Head>
      <FavoritesComponent />
    </>
  );
}
