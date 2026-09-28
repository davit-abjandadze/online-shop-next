import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/types";
import CategoryProductsPage from "@/components/pages/categoryProducts";
import {
  CategoryInitialData,
  categoryProductsKey,
  fetchCategoryChildren,
  fetchCategoryProducts,
} from "@/components/pages/categoryProducts/data";
import Seo from "@/components/shared/Seo";
import { parseCategoryFiltersQuery } from "@/hooks/useCategoryFilters";
import { getCategoryName } from "@/utils/getCategoryName";
import { getCategoryTree } from "@/utils/getCategoryTree";
import { getPublicPageProps } from "@/utils/publicPage";
import { absoluteImage, absoluteUrl, resolveLocale } from "@/utils/seo";

interface CategorySlugPageProps {
  slug: string;
  category: Category | null;
  initialData: CategoryInitialData | null;
  // ფილტრიანი/დალაგებული ვარიანტები canonical-ით ბაზურ URL-ზე მიდის; noindex
  // ზედმეტი კომბინაციების (facet-ების) ინდექსაციას ზღუდავს
  isFiltered: boolean;
  // _app.tsx-ისთვის — noindex გვერდზე canonical/hreflang არ ისმება
  noindex: boolean;
}

// getServerSideProps-ის გარეშე გვერდი სტატიკურად ოპტიმიზდებოდა და SSR-ზე
// router.isReady false იყო — HTML ცარიელი (Header-ისა და <title>-ის გარეშე)
// ბრუნდებოდა, არარსებული slug კი 200-ით. ახლა კატეგორია, ქვეკატეგორიები და
// პირველი გვერდის პროდუქტები სერვერზე იტვირთება, 404-ზე კი ნამდვილი 404 ბრუნდება.
export default function CategorySlugPage({ slug, category, initialData, isFiltered }: CategorySlugPageProps) {
  const { t } = useTranslation("common");
  const { t: tCatalog } = useTranslation("catalog");
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const name = category ? getCategoryName(category, locale) : "";
  const page = initialData?.meta?.page ?? 1;
  const pageSuffix = page > 1 ? ` — ${t("page-n", { n: page })}` : "";

  const title = category
    ? `${category.seoTitle || name}${pageSuffix} - ${t("default-page-title")}`
    : t("default-page-title");
  const description = category
    ? category.seoDescription || tCatalog("category-meta-description", { name })
    : t("page-description");

  const breadcrumbJsonLd = category && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: tCatalog("breadcrumb-home"), url: absoluteUrl(locale, "") },
      ...(category.parent
        ? [{ name: getCategoryName(category.parent, locale), url: absoluteUrl(locale, `/categories/${category.parent.slug}`) }]
        : []),
      { name, url: absoluteUrl(locale, `/categories/${category.slug}`) },
    ].map((item, idx) => ({ "@type": "ListItem", position: idx + 1, name: item.name, item: item.url })),
  };

  return (
    <>
      <Seo
        title={title}
        description={description}
        image={absoluteImage(category?.image)}
        noindex={isFiltered}
        jsonLd={breadcrumbJsonLd ? [breadcrumbJsonLd] : undefined}
      />
      {category?.seoKeywords && (
        // მხოლოდ მეორადი საძიებო სისტემებისთვის (Google keywords-ს იგნორირებს)
        <Head>
          <meta name="keywords" content={category.seoKeywords} />
        </Head>
      )}
      <main>
        {/* key — სხვა კატეგორიაზე გადასვლისას კომპონენტი თავიდან mount-დება
            ახალი სერვერის მონაცემებით (ძველი state-ის ნაცვლად) */}
        <CategoryProductsPage key={slug} slug={slug} initialData={initialData ?? undefined} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CategorySlugPageProps> = async ({ params, locale, query, res }) => {
  const slug = params?.slug as string;
  const lang = resolveLocale(locale);
  const filterState = parseCategoryFiltersQuery(query);
  const isFiltered =
    Object.keys(filterState.filters).length > 0 || !!filterState.subcategory || !!filterState.sortBy;

  let category: Category;
  try {
    const res = await CategoriesAPI(lang, "").categoryControllerFindBySlug(slug);
    category = res.data as unknown as Category;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { notFound: true };
    }
    // სხვა შეცდომისას გვერდი მაინც ირენდერება — კლიენტი კატეგორიას თავად ითხოვს
    console.error(`Could not fetch category ${slug}:`, err);
    // ხე ცალკე (getCategoryTree-ის ქეში/fallback) — ცარიელი [] კლიენტზე ჩატვირთვასაც
    // ბლოკავდა და Header/Footer კატეგორიების გარეშე რჩებოდა. Cache-Control აქ არ ისმება.
    const categoryTree = await getCategoryTree(lang);
    return { props: { slug, category: null, initialData: null, isFiltered, noindex: isFiltered, categoryTree } };
  }

  // ქვეკატეგორიები/პროდუქტები დამატებითია — ჩავარდნისას კლიენტი თავად ჩატვირთავს
  let initialData: CategoryInitialData | null = null;
  try {
    const [children, productsData] = await Promise.all([
      fetchCategoryChildren(lang, category),
      fetchCategoryProducts(lang, slug, filterState),
    ]);
    initialData = {
      // კლიენტზე router.locale "ka"/"en"/"ru"-ა (default ლოკალი redirect-ით /ka-ზე მიდის)
      key: categoryProductsKey(locale, slug, filterState),
      category,
      children,
      ...productsData,
    };
  } catch (err) {
    console.error(`Could not fetch products for category ${slug}:`, err);
  }

  // არარსებული გვერდი (?page=999) — ცარიელი სიის 200-ის (soft 404) ნაცვლად ნამდვილი 404
  if (filterState.page > 1 && initialData?.meta && filterState.page > initialData.meta.totalPages) {
    return { notFound: true };
  }

  const common = await getPublicPageProps(res, locale);
  // noindex — _app.tsx ასეთ გვერდზე canonical/hreflang-ს აღარ სვამს
  return { props: { slug, category: category || null, initialData, isFiltered, noindex: isFiltered, ...common } };
};
