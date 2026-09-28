import { GetServerSideProps } from "next";
import useTranslation from "next-translate/useTranslation";
import HomeComponent from "@/components/pages/home";
import { HomeData, fetchHomeData } from "@/components/pages/home/data";
import Seo from "@/components/shared/Seo";
import { getPublicPageProps } from "@/utils/publicPage";
import { resolveLocale } from "@/utils/seo";

interface HomePageProps {
  data: HomeData;
}

export default function Home({ data }: HomePageProps) {
  const { t } = useTranslation("common");

  return (
    <>
      <Seo title={t("default-page-title")} description={t("page-description")} type="website" />
      <main>
        <HomeComponent data={data} />
      </main>
    </>
  );
}

// სერვერზე ჩატვირთვა — ადრე მონაცემები მხოლოდ კლიენტზე (useEffect) მოდიოდა
// და საძიებო სისტემები HTML-ში პროდუქტებს/შიდა ბმულებს ვერ ხედავდნენ.
export const getServerSideProps: GetServerSideProps<HomePageProps> = async ({ locale, res }) => {
  const [data, common] = await Promise.all([fetchHomeData(resolveLocale(locale)), getPublicPageProps(res, locale)]);
  return { props: { data, ...common } };
};
