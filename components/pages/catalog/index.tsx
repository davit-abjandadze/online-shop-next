import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import Dropdown from "@/components/shared/Dropdown";
import ProductCard from "@/components/shared/ProductCard";
import { SearchIcon, TagIcon } from "@/components/ui/RefIcons";
import { Category, PaginatedResponseDto, Product } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import { scrollToTopSmooth } from "@/utils/scrollToTop";
import {
  CatalogInitialData,
  PRODUCTS_PAGE_SIZE,
  catalogParamsKey,
  fetchCatalogCategories,
  fetchCatalogProducts,
  parseCatalogQuery,
} from "./data";
import PaginationLinks from "./PaginationLinks";
import * as S from "./style";

// დალაგების ხელმისაწვდომი ვარიანტები — Dropdown-ის მნიშვნელობა ორ ველად
// (sortBy/order) იშლება SORT_MAP-იდან (./data.ts, სერვერთან საერთო).
const getSortOptions = (t: (key: string) => string) => [
  { value: "default", label: t("sort-default") },
  { value: "new", label: t("sort-new") },
  { value: "price_asc", label: t("sort-price-asc") },
  { value: "price_desc", label: t("sort-price-desc") },
];

interface CatalogComponentProps {
  // getServerSideProps-იდან (pages/products/index.tsx) — პირველი გვერდის
  // პროდუქტები/კატეგორიები სერვერის HTML-შია; კლიენტი მხოლოდ შემდგომ
  // (shallow) ფილტრის/გვერდის ცვლილებებზე ითხოვს ხელახლა.
  initialData?: CatalogInitialData;
}

export const CatalogComponent: React.FC<CatalogComponentProps> = ({ initialData }) => {
  const router = useRouter();
  const { t } = useTranslation("catalog");
  const SORT_OPTIONS = getSortOptions(t);
  const [initialParams] = useState(() => parseCatalogQuery(router.query));

  const [products, setProducts] = useState<Product[]>(initialData?.products ?? []);
  const [meta, setMeta] = useState<PaginatedResponseDto<Product>["meta"] | null>(initialData?.meta ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData);

  const [categories, setCategories] = useState<Category[]>(initialData?.categories ?? []);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(initialParams.category);

  const [page, setPage] = useState<number>(initialParams.page);
  const [sort, setSort] = useState<string>(initialParams.sort);
  // Header-ის ძებნა `/products?search=...`-ზე გადმოდის — URL-იდან ვკითხულობთ
  const [searchTerm, setSearchTerm] = useState<string>(initialParams.search);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // სერვერზე უკვე ჩატვირთული კომბინაციის (ლოკალი + პარამეტრები) პირველი
  // კლიენტური fetch-ი ზედმეტია — ერთხელ ვტოვებთ.
  const skipProductsKeyRef = useRef<string | null>(initialData ? `${router.locale}|${initialData.key}` : null);
  const skipCategoriesRef = useRef<boolean>(!!initialData);

  // `page`-ს ვასინქრონებთ URL-ის `?page=` პარამეტრთან, გაზიარებული/დაბუქმარკებული
  // ბმული იმავე გვერდიდან გახსნას რომ იძლეოდეს. `?category=` კი საშუალებას
  // აძლევს მთავარი გვერდის კატეგორიის ბარათებს პირდაპირ გაფილტრულ კატალოგზე
  // გადაიყვანონ მომხმარებელი.
  // დამოკიდებულია `router.query.page`/`router.query.category`-ზე (არა მხოლოდ
  // `router.isReady`-ზე), რომ იმავე გვერდზე ყოფნისას query-ის ცვლილებაზეც
  // მოხდეს რეაგირება — მაგ. Header-იდან სხვა კატეგორიის/გვერდის ბმულზე გადასვლისას.
  useEffect(() => {
    if (!router.isReady) return;
    const queryPage = parseInt(router.query.page as string, 10);
    const nextPage = !isNaN(queryPage) && queryPage > 0 ? queryPage : 1;
    setPage((prev) => (prev !== nextPage ? nextPage : prev));

    const queryCategory = (router.query.category as string | undefined) ?? null;
    setActiveCategoryId((prev) => (prev !== queryCategory ? queryCategory : prev));

    const querySearch = typeof router.query.search === "string" ? router.query.search.trim() : "";
    setSearchTerm((prev) => (prev !== querySearch ? querySearch : prev));

    const querySort = typeof router.query.sort === "string" ? router.query.sort : "default";
    const nextSort = SORT_OPTIONS.some((option) => option.value === querySort) ? querySort : "default";
    setSort((prev) => (prev !== nextSort ? nextSort : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.page, router.query.category, router.query.search, router.query.sort]);

  const goToPage = (newPage: number) => {
    setPage(newPage);
    // scroll: false — თორემ Next.js router.push-ის დეფოლტ მყისიერი
    // scroll-to-top ჩვენს ქვემოთ დაწერილ smooth scroll-ს გადაფარავს
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: String(newPage) } },
      undefined,
      { shallow: true, scroll: false }
    );
    scrollToTopSmooth();
  };

  // "ყველა კატეგორია" კვლავ /products-ზე რჩება, კონკრეტული კატეგორია კი
  // /categories/[slug]-ზე გადადის — SEO-სთვის სუფთა, keyword-ianი URL-ით
  // (`?category=<uuid>` query-ის მაგივრად), UUID-ის ნაცვლად slug-ით.
  const handleCategorySelect = (categoryId: string | null) => {
    if (categoryId === null) {
      setActiveCategoryId(null);
      setPage(1);
      const query: Record<string, string> = { ...(router.query as Record<string, string>), page: "1" };
      delete query.category;
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);
    if (!category?.slug) return;
    router.push(`/categories/${category.slug}`);
  };

  // სწრაფი ცვლილებებისას (გვერდი/ძებნა/დალაგება) მხოლოდ ბოლო მოთხოვნის
  // პასუხი ჩაიწერება — ძველი, გვიან დაბრუნებული პასუხი სიას აღარ გადაფარავს.
  const requestIdRef = useRef(0);

  const fetchProducts = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const data = await fetchCatalogProducts(router.locale || "ka", {
        page,
        sort,
        search: searchTerm,
        category: activeCategoryId,
      });
      if (requestId !== requestIdRef.current) return;
      setProducts(data.products);
      setMeta(data.meta);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Error fetching products:", err);
      toast.error(t("load-products-error") as string);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategories(await fetchCatalogCategories(router.locale || "ka"));
    } catch {
      // კატეგორიების ფილტრი არასავალდებულოა, შეცდომას ჩუმად ვტოვებთ
    }
  };

  // router.isReady-მდე query ჯერ ცარიელია — ადრე გაშვებული fetch deep-link-ის
  // (?page=3 / ?search=...) ნაცვლად პირველ გვერდს წამოიღებდა.
  useEffect(() => {
    if (!router.isReady) return;
    const key = `${router.locale}|${catalogParamsKey({ page, sort, search: searchTerm, category: activeCategoryId })}`;
    if (skipProductsKeyRef.current === key) {
      skipProductsKeyRef.current = null;
      return;
    }
    skipProductsKeyRef.current = null;
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, page, activeCategoryId, searchTerm, sort, router.locale]);

  useEffect(() => {
    if (skipCategoriesRef.current) {
      skipCategoriesRef.current = false;
      return;
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId);

  // categoryControllerFindAll (parentId ფილტრის გარეშე) ბრტყელ სიას აბრუნებს,
  // სადაც თითოეულ კატეგორიას `parent` აქვს join-ით ჩატვირთული — აქედან
  // ვაშენებთ ორდონიან ხეს: root კატეგორიები + თითოეულის ქვეკატეგორიები.
  const topLevelCategories = categories.filter((cat) => !cat.parent);
  const getChildCategories = (parentId: string) =>
    categories.filter((cat) => cat.parent?.id === parentId);

  const categoryDropdownOptions = [
    { value: "all", label: t("all-categories") },
    ...topLevelCategories.flatMap((cat) => [
      { value: cat.id, label: getCategoryName(cat, router.locale) },
      ...getChildCategories(cat.id).map((child) => ({
        value: child.id,
        label: `— ${getCategoryName(child, router.locale)}`,
      })),
    ]),
  ];

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.Breadcrumb>
          <Link href="/">{t("breadcrumb-home")}</Link>
          <span>/</span>
          <span>{activeCategory ? getCategoryName(activeCategory, router.locale) : t("shop")}</span>
        </S.Breadcrumb>

        <S.PageHeader>
          <div>
            <S.PageTitle>
              {searchTerm
                ? t("search-results-title", { query: searchTerm })
                : activeCategory
                ? getCategoryName(activeCategory, router.locale)
                : t("shop")}
            </S.PageTitle>
            <S.PageSubtitle>{t("page-subtitle")}</S.PageSubtitle>
          </div>
          {meta && <S.ResultsCount>{t("results-count", { count: meta.total })}</S.ResultsCount>}
        </S.PageHeader>

        <S.Layout>
          {/* გვერდითი კატეგორიის პანელი — მთავარი გვერდის HeroFilterPanel-ის
              იმავე "ბარათის" ენით (bg-elevated, closed კუთხეები, shadow). */}
          <S.Sidebar>
            <S.SidebarCard>
              <S.SidebarCardTitle>{t("categories-title")}</S.SidebarCardTitle>
              <S.SidebarCardBody>
                {/* კატეგორიები <a href>-ებია (crawl-ირებადი ბმულები, SEO) — "ყველა"
                    კლიკზე shallow ფილტრის მოხსნად რჩება */}
                <Link href="/products" passHref legacyBehavior>
                  <S.CategoryOption
                    as="a"
                    active={activeCategoryId === null}
                    onClick={(e: React.MouseEvent) => {
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      handleCategorySelect(null);
                    }}
                  >
                    <S.CategoryOptionLabel>
                      <TagIcon size={16} />
                      {t("all-categories")}
                    </S.CategoryOptionLabel>
                  </S.CategoryOption>
                </Link>

                {topLevelCategories.length === 0 ? (
                  <S.FilterEmpty>{t("no-categories")}</S.FilterEmpty>
                ) : (
                  topLevelCategories.map((category) => {
                    const children = getChildCategories(category.id);
                    return (
                      <React.Fragment key={category.id}>
                        <Link href={`/categories/${category.slug}`} passHref legacyBehavior>
                          <S.CategoryOption as="a" active={activeCategoryId === category.id}>
                            <S.CategoryOptionLabel>
                              <TagIcon size={16} />
                              {getCategoryName(category, router.locale)}
                            </S.CategoryOptionLabel>
                          </S.CategoryOption>
                        </Link>

                        {children.map((child) => (
                          <Link key={child.id} href={`/categories/${child.slug}`} passHref legacyBehavior>
                            <S.SubcategoryOption as="a" active={activeCategoryId === child.id}>
                              <S.CategoryOptionLabel>— {getCategoryName(child, router.locale)}</S.CategoryOptionLabel>
                            </S.SubcategoryOption>
                          </Link>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </S.SidebarCardBody>
            </S.SidebarCard>
          </S.Sidebar>

          <S.Main>
            <S.Toolbar>
              <S.MobileCategorySelect>
                <Dropdown
                  ariaLabel={t("category-aria-label")}
                  minWidth={180}
                  value={activeCategoryId === null ? "all" : activeCategoryId}
                  onChange={(val) => handleCategorySelect(val === "all" ? null : val)}
                  options={categoryDropdownOptions}
                />
              </S.MobileCategorySelect>

              {meta && (
                <S.ToolbarCount>
                  {t("showing")} <strong>{products.length}</strong> {t("of-total", { total: meta.total })}
                </S.ToolbarCount>
              )}

              <S.SortWrap>
                <S.SortLabel>{t("sort-label")}</S.SortLabel>
                <Dropdown
                  ariaLabel={t("sort-aria-label")}
                  minWidth={200}
                  value={sort}
                  onChange={(val) => {
                    setSort(val);
                    setPage(1);
                    // დალაგება URL-შიც — refresh/გაზიარება/Back-ზე არ იკარგება,
                    // და ძველი ?page=N აღარ რჩება ახალ დალაგებასთან.
                    const query: Record<string, string> = { ...(router.query as Record<string, string>), page: "1" };
                    if (val === "default") delete query.sort;
                    else query.sort = val;
                    router.push({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
                  }}
                  options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                />
              </S.SortWrap>
            </S.Toolbar>

            {loading ? (
              <S.ProductsGrid>
                {Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, idx) => (
                  <S.SkeletonCard key={idx}>
                    <S.SkeletonBlock height="220px" />
                    <div style={{ padding: 14 }}>
                      <S.SkeletonBlock height="14px" />
                      <div style={{ marginTop: 8 }}>
                        <S.SkeletonBlock height="18px" />
                      </div>
                    </div>
                  </S.SkeletonCard>
                ))}
              </S.ProductsGrid>
            ) : products.length === 0 ? (
              <S.EmptyState>
                <SearchIcon size={48} />
                <S.EmptyStateTitle>
                  {activeCategoryId === null ? t("no-products") : t("no-products-in-category")}
                </S.EmptyStateTitle>
              </S.EmptyState>
            ) : (
              <S.ProductsGrid>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </S.ProductsGrid>
            )}

            {meta && meta.totalPages > 1 && <PaginationLinks meta={meta} onPageChange={goToPage} />}
          </S.Main>
        </S.Layout>
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default CatalogComponent;
