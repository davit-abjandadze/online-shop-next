import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ChangePasswordComponent from "@/components/pages/profile/ChangePassword";

export default function ChangePasswordPage() {
  const { t } = useTranslation("common");
  const { t: tProfile } = useTranslation("profile");

  return (
    <>
      <Head>
        <title>{`${tProfile("change-password-title")} - ${t("default-page-title")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ChangePasswordComponent />
    </>
  );
}
