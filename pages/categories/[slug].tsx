import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/types";
import CategoryProductsPage from "@/components/pages/categoryProducts";
import { getCategoryName } from "@/utils/getCategoryName";

interface CategorySlugPageProps {
  slug: string;
  category: Category | null;
}

// getServerSideProps-ის გარეშე გვერდი სტატიკურად ოპტიმიზდებოდა და SSR-ზე
// router.isReady false იყო — HTML ცარიელი (Header-ისა და <title>-ის გარეშე)
// ბრუნდებოდა, არარსებული slug კი 200-ით. ახლა slug სერვერზე მოდის,
// კატეგორია სათაურისთვის იტვირთება, 404-ზე კი ნამდვილი 404 ბრუნდება.
export default function CategorySlugPage({ slug, category }: CategorySlugPageProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const title = category
    ? `${getCategoryName(category, router.locale)} - ${t("default-page-title")}`
    : t("default-page-title");

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("page-description")} />
      </Head>
      <main>
        <CategoryProductsPage slug={slug} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CategorySlugPageProps> = async ({ params, locale }) => {
  const slug = params?.slug as string;

  try {
    const res = await CategoriesAPI(locale || "ka", "").categoryControllerFindBySlug(slug);
    return { props: { slug, category: (res.data as unknown as Category) || null } };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { notFound: true };
    }
    // სხვა შეცდომისას გვერდი მაინც ირენდერება — კლიენტი კატეგორიას თავად ითხოვს
    console.error(`Could not fetch category ${slug}:`, err);
    return { props: { slug, category: null } };
  }
};
