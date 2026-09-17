import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import NotificationsPage from "@/components/pages/dashboard/NotificationsPage";
export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardNotificationsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="user-ებისთვის შეტყობინებების გაგზავნა და მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <NotificationsPage />
    </>
  );
}
