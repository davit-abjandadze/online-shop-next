import { GetServerSideProps } from "next";
import useTranslation from "next-translate/useTranslation";
import BranchesComponent from "@/components/pages/branches";
import Seo from "@/components/shared/Seo";
import { getPublicPageProps } from "@/utils/publicPage";

export default function BranchesPage() {
  const { t: tBranches } = useTranslation("branches");
  const { t } = useTranslation("common");

  return (
    <>
      <Seo title={`${tBranches("page-title")} | ${t("default-page-title")}`} description={tBranches("page-subtitle")} />
      <main>
        <BranchesComponent />
      </main>
    </>
  );
}

// კატეგორიების ხე Header/Footer-ის ბმულებისთვის (SEO) — იხ. utils/publicPage.ts
export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => ({
  props: await getPublicPageProps(res, locale),
});
