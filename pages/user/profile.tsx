import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ProfileComponent from "@/components/pages/profile";

export default function ProfilePage() {
  const { t } = useTranslation("common");
  const { t: tProfile } = useTranslation("profile");

  return (
    <>
      <Head>
        <title>{`${tProfile("page-title")} - ${t("default-page-title")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ProfileComponent />
    </>
  );
}
