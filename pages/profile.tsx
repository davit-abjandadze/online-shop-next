import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ProfileComponent from "@/components/pages/profile";

export default function ProfilePage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>პროფილი - {t("default-page-title")}</title>
        <meta name="description" content="მომხმარებლის პროფილი და ფავორიტი კითხვები" />
      </Head>
      <ProfileComponent />
    </>
  );
}
