import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import StatsPage from "@/components/pages/dashboard/StatsPage";
export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardStatsPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`ადმინ დეშბორდი - ${t("default-page-title")}`}</title>
        <meta name="description" content="მაღაზიის ანალიტიკა და სტატისტიკა" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <StatsPage />
    </>
  );
}
