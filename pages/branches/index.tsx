import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import BranchesComponent from "@/components/pages/branches";

export default function BranchesPage() {
  const { t: tBranches } = useTranslation("branches");
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${tBranches("page-title")} | ${t("default-page-title")}`}</title>
        <meta name="description" content={tBranches("page-subtitle")} />
      </Head>
      <main>
        <BranchesComponent />
      </main>
    </>
  );
}
