import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import UsersPage from "@/components/pages/dashboard/UsersPage";
export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardUsersPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="პლატფორმის მომხმარებლების მართვა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <UsersPage />
    </>
  );
}
