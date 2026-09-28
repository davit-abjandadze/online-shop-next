import { GetServerSideProps } from "next";
import useTranslation from "next-translate/useTranslation";
import CatalogComponent from "@/components/pages/catalog";
import {
  CatalogInitialData,
  catalogParamsKey,
  fetchCatalogCategories,
  fetchCatalogProducts,
  parseCatalogQuery,
} from "@/components/pages/catalog/data";
import Seo from "@/components/shared/Seo";
import { getPublicPageProps } from "@/utils/publicPage";
import { resolveLocale } from "@/utils/seo";

interface ProductsPageProps {
  initialData: CatalogInitialData | null;
  search: string;
  // _app.tsx-ისთვის — noindex გვერდზე canonical/hreflang არ ისმება
  noindex: boolean;
  page: number;
}

export default function ProductsPage({ initialData, search, page }: ProductsPageProps) {
  const { t } = useTranslation("common");
  const { t: tCatalog } = useTranslation("catalog");

  const heading = search ? tCatalog("search-results-title", { query: search }) : tCatalog("shop");
  const pageSuffix = page > 1 ? ` — ${t("page-n", { n: page })}` : "";

  return (
    <>
      {/* ძიების შედეგები უსასრულო, თხელი კომბინაციებია — არ ინდექსირდება,
          მაგრამ ბმულებს (პროდუქტებს) Google მაინც მიჰყვება. */}
      <Seo
        title={`${heading}${pageSuffix} - ${t("default-page-title")}`}
        description={tCatalog("catalog-meta-description")}
        noindex={!!search}
      />
      <main>
        <CatalogComponent initialData={initialData ?? undefined} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ProductsPageProps> = async ({ locale, query, res }) => {
  const params = parseCatalogQuery(query);
  const lang = resolveLocale(locale);

  // ჩავარდნისას გვერდი მაინც ირენდერება — კლიენტი მონაცემებს თავად ითხოვს
  let initialData: CatalogInitialData | null = null;
  try {
    const [productsData, categories] = await Promise.all([
      fetchCatalogProducts(lang, params),
      fetchCatalogCategories(lang).catch(() => []),
    ]);
    initialData = { key: catalogParamsKey(params), ...productsData, categories };
  } catch (err) {
    console.error("Could not fetch catalog products:", err);
  }

  // არარსებული გვერდი (?page=999) — ცარიელი სიის 200-ის (soft 404) ნაცვლად ნამდვილი 404
  if (params.page > 1 && initialData?.meta && params.page > initialData.meta.totalPages) {
    return { notFound: true };
  }

  const common = await getPublicPageProps(res, locale);
  // noindex — _app.tsx ასეთ გვერდზე canonical/hreflang-ს აღარ სვამს
  return { props: { initialData, search: params.search, page: params.page, noindex: !!params.search, ...common } };
};
