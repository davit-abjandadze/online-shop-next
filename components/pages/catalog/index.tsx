import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import Dropdown from "@/components/shared/Dropdown";
import ProductCard from "@/components/shared/ProductCard";
import CategoryFilterBar from "@/components/shared/CategoryFilterBar";
import { SearchIcon, TagIcon } from "@/components/ui/RefIcons";
import { CategoriesAPI, ProductsAPI } from "@/API_Client";
import { ProductsControllerFindAllOrderEnum } from "@/API_Client/client/apis/products-api";
import { Category, PaginatedResponseDto, Product } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

const PRODUCTS_PAGE_SIZE = 12;

// დალაგების ხელმისაწვდომი ვარიანტები — Dropdown-ის მნიშვნელობა ორ ველად
// (sortBy/order) იშლება SORT_OPTIONS-იდან SELECTED-ის მიხედვით.
const getSortOptions = (
  t: (key: string) => string
): { value: string; label: string; sortBy?: string; order?: ProductsControllerFindAllOrderEnum }[] => [
  { value: "default", label: t("sort-default") },
  { value: "new", label: t("sort-new"), sortBy: "createdAt", order: ProductsControllerFindAllOrderEnum.Desc },
  { value: "price_asc", label: t("sort-price-asc"), sortBy: "price", order: ProductsControllerFindAllOrderEnum.Asc },
  { value: "price_desc", label: t("sort-price-desc"), sortBy: "price", order: ProductsControllerFindAllOrderEnum.Desc },
];

export const CatalogComponent: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation("catalog");
  const SORT_OPTIONS = getSortOptions(t);

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedResponseDto<Product>["meta"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>("default");
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // `page`-ს ვასინქრონებთ URL-ის `?page=` პარამეტრთან, გაზიარებული/დაბუქმარკებული
  // ბმული იმავე გვერდიდან გახსნას რომ იძლეოდეს. `?category=` კი საშუალებას
  // აძლევს მთავარი გვერდის კატეგორიის ბარათებს პირდაპირ გაფილტრულ კატალოგზე
  // გადაიყვანონ მომხმარებელი.
  useEffect(() => {
    if (!router.isReady) return;
    const queryPage = parseInt(router.query.page as string, 10);
    if (!isNaN(queryPage) && queryPage > 0 && queryPage !== page) {
      setPage(queryPage);
    }
    const queryCategory = router.query.category as string | undefined;
    if (queryCategory && queryCategory !== activeCategoryId) {
      setActiveCategoryId(queryCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const goToPage = (newPage: number) => {
    setPage(newPage);
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: String(newPage) } },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const sortOption = SORT_OPTIONS.find((option) => option.value === sort);
      const res = await ProductsAPI(router.locale || "ka", "").productsControllerFindAll(
        page,
        PRODUCTS_PAGE_SIZE,
        sortOption?.sortBy,
        sortOption?.order,
        undefined,
        activeCategoryId ?? undefined
      );
      const data = res.data as unknown as PaginatedResponseDto<Product>;
      setProducts(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error(t("load-products-error") as string);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // categoryControllerFindAll ახლა გვერდიანია (PaginatedResponseDto<Category>) —
      // ფილტრის სრული სიისთვის დიდი limit-ით ვითხოვთ (იხ. API_Client/types.ts).
      const res = await CategoriesAPI(router.locale || "ka", "").categoryControllerFindAll(1, 100);
      const data = res.data as unknown as PaginatedResponseDto<Category>;
      setCategories(Array.isArray(data?.data) ? data.data : []);
    } catch {
      // კატეგორიების ფილტრი არასავალდებულოა, შეცდომას ჩუმად ვტოვებთ
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeCategoryId, sort, router.locale]);

  useEffect(() => {
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

      {/* კატეგორიების ზოლი ჰედერის ქვემოთ — მთავარი გვერდის CategoryFilterBar-ის
          იმავე პოზიციითა და ვიზუალით (იხ. components/shared/CategoryFilterBar). */}
      <CategoryFilterBar />

      <S.Container>
        <S.Breadcrumb>
          <Link href="/">{t("breadcrumb-home")}</Link>
          <span>/</span>
          <span>{activeCategory ? getCategoryName(activeCategory, router.locale) : t("shop")}</span>
        </S.Breadcrumb>

        <S.PageHeader>
          <div>
            <S.PageTitle>{activeCategory ? getCategoryName(activeCategory, router.locale) : t("shop")}</S.PageTitle>
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
                <S.CategoryOption active={activeCategoryId === null} onClick={() => handleCategorySelect(null)}>
                  <S.CategoryOptionLabel>
                    <TagIcon size={16} />
                    {t("all-categories")}
                  </S.CategoryOptionLabel>
                </S.CategoryOption>

                {topLevelCategories.length === 0 ? (
                  <S.FilterEmpty>{t("no-categories")}</S.FilterEmpty>
                ) : (
                  topLevelCategories.map((category) => {
                    const children = getChildCategories(category.id);
                    return (
                      <React.Fragment key={category.id}>
                        <S.CategoryOption
                          active={activeCategoryId === category.id}
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <S.CategoryOptionLabel>
                            <TagIcon size={16} />
                            {getCategoryName(category, router.locale)}
                          </S.CategoryOptionLabel>
                        </S.CategoryOption>

                        {children.map((child) => (
                          <S.SubcategoryOption
                            key={child.id}
                            active={activeCategoryId === child.id}
                            onClick={() => handleCategorySelect(child.id)}
                          >
                            <S.CategoryOptionLabel>— {getCategoryName(child, router.locale)}</S.CategoryOptionLabel>
                          </S.SubcategoryOption>
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

            {meta && meta.totalPages > 1 && (
              <S.PaginationBar>
                <S.PageButton onClick={() => goToPage(Math.max(1, meta.page - 1))} disabled={!meta.hasPrevious}>
                  ←
                </S.PageButton>
                <S.PageNumbers>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                    <S.PageNumberButton key={n} active={n === meta.page} onClick={() => goToPage(n)}>
                      {n}
                    </S.PageNumberButton>
                  ))}
                </S.PageNumbers>
                <S.PageButton onClick={() => goToPage(meta.page + 1)} disabled={!meta.hasNext}>
                  →
                </S.PageButton>
              </S.PaginationBar>
            )}
          </S.Main>
        </S.Layout>
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default CatalogComponent;
