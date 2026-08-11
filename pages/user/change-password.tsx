import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import ChangePasswordComponent from "@/components/pages/profile/ChangePassword";

export default function ChangePasswordPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`პაროლის შეცვლა - ${t("default-page-title")}`}</title>
        <meta name="description" content="მომხმარებლის პაროლის შეცვლა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ChangePasswordComponent />
    </>
  );
}
