import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import Dropdown from "@/components/shared/Dropdown";
import ProductCard from "@/components/shared/ProductCard";
import FilterSidebar from "@/components/shared/FilterSidebar";
import { SearchIcon, TagIcon } from "@/components/ui/RefIcons";
import { CategoriesAPI } from "@/API_Client";
import { Category, Product } from "@/API_Client/client/models";
import { CategoryFiltersResponse, PaginatedResponseDto } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import { useCategoryFilters } from "@/hooks/useCategoryFilters";
// Layout/Sidebar/ProductsGrid/PaginationBar-ის სტილები კატალოგის (`/products`)
// ჩვეულ ვიზუალურ ენას იმეორებს — reuse, დუბლირების გარეშე.
import * as C from "@/components/pages/catalog/style";

const PRODUCTS_PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "default", label: "სტანდარტული" },
  { value: "new", label: "ახალი ჩამოსული", sortBy: "createdAt", order: "DESC" },
  { value: "price_asc", label: "ფასი: დაბლიდან მაღლა", sortBy: "price", order: "ASC" },
  { value: "price_desc", label: "ფასი: მაღლიდან დაბლა", sortBy: "price", order: "DESC" },
];

interface CategoryProductsPageProps {
  slug: string;
}

export const CategoryProductsPage: React.FC<CategoryProductsPageProps> = ({ slug }) => {
  const router = useRouter();
  const { filters, subcategory, page, sortBy, order, setFilter, setSubcategory, setPage, setSort, clearFilters } =
    useCategoryFilters();

  const [category, setCategory] = useState<Category | null>(null);
  const [children, setChildren] = useState<Category[]>([]);
  const [facets, setFacets] = useState<CategoryFiltersResponse>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedResponseDto<Product>["meta"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const sortValue =
    SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.order === order)?.value || (sortBy ? "default" : "default");

  // საბაზო კატეგორია + პირდაპირი ქვეკატეგორიები — slug-ის ცვლილებაზე ერთხელ.
  useEffect(() => {
    let active = true;
    CategoriesAPI(router.locale || "ka", "")
      .categoryControllerFindBySlug(slug)
      .then(async (res) => {
        if (!active) return;
        const cat = res.data as unknown as Category;
        setCategory(cat);
        const childrenRes = await CategoriesAPI(router.locale || "ka", "").categoryControllerFindAll(
          1,
          100,
          undefined,
          undefined,
          String(cat.id)
        );
        if (!active) return;
        const childrenData = childrenRes.data as unknown as PaginatedResponseDto<Category>;
        setChildren(Array.isArray(childrenData?.data) ? childrenData.data : []);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router.locale]);

  // ფილტრები/facet-ები — activeFilters/subcategory ცვლილებაზე ხელახლა.
  useEffect(() => {
    if (!category) return;
    CategoriesAPI(router.locale || "ka", "")
      .categoryControllerGetFilters(slug, { params: { ...filters, ...(subcategory ? { subcategory } : {}) } } as any)
      .then((res) => setFacets((res.data as unknown as CategoryFiltersResponse) || []))
      .catch(() => {
        // ფილტრები დამატებითია — ჩუმად ვტოვებთ, პროდუქტების სია მაინც ჩაირთვება
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, slug, JSON.stringify(filters), subcategory, router.locale]);

  // პროდუქტების სია — ფილტრები/subcategory/page/sort ცვლილებაზე.
  useEffect(() => {
    if (!category) return;
    setLoading(true);
    CategoriesAPI(router.locale || "ka", "")
      .categoryControllerGetProducts(slug, {
        params: {
          ...filters,
          ...(subcategory ? { subcategory } : {}),
          page: String(page),
          limit: String(PRODUCTS_PAGE_SIZE),
          ...(sortBy ? { sortBy } : {}),
          ...(order ? { order } : {}),
        },
      } as any)
      .then((res) => {
        const data = res.data as unknown as PaginatedResponseDto<Product>;
        setProducts(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta || null);
      })
      .catch(() => toast.error("პროდუქტების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, slug, JSON.stringify(filters), subcategory, page, sortBy, order, router.locale]);

  const activeChild = children.find((c) => c.slug === subcategory);

  if (notFound) {
    return (
      <C.PageBackground>
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <C.Container>
          <C.EmptyState>
            <SearchIcon size={48} />
            <C.EmptyStateTitle>კატეგორია არ მოიძებნა</C.EmptyStateTitle>
          </C.EmptyState>
        </C.Container>
        <Footer />
      </C.PageBackground>
    );
  }

  return (
    <C.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <C.Container>
        <C.Breadcrumb>
          <Link href="/">მთავარი</Link>
          <span>/</span>
          <Link href="/products">მაღაზია</Link>
          {category && (
            <>
              <span>/</span>
              <span>{getCategoryName(category, router.locale)}</span>
            </>
          )}
          {activeChild && (
            <>
              <span>/</span>
              <span>{getCategoryName(activeChild, router.locale)}</span>
            </>
          )}
        </C.Breadcrumb>

        <C.PageHeader>
          <div>
            <C.PageTitle>
              {activeChild ? getCategoryName(activeChild, router.locale) : category ? getCategoryName(category, router.locale) : ""}
            </C.PageTitle>
            <C.PageSubtitle>დაათვალიერეთ ქვეკატეგორიები და ფილტრები</C.PageSubtitle>
          </div>
          {meta && <C.ResultsCount>{meta.total} პროდუქტი</C.ResultsCount>}
        </C.PageHeader>

        <C.Layout>
          <C.Sidebar>
            {children.length > 0 && (
              <C.SidebarCard>
                <C.SidebarCardTitle>ქვეკატეგორიები</C.SidebarCardTitle>
                <C.SidebarCardBody>
                  <C.CategoryOption active={!subcategory} onClick={() => setSubcategory(null)}>
                    <C.CategoryOptionLabel>
                      <TagIcon size={16} />
                      ყველა
                    </C.CategoryOptionLabel>
                  </C.CategoryOption>
                  {children.map((child) => (
                    <C.CategoryOption
                      key={child.id}
                      active={subcategory === child.slug}
                      onClick={() => setSubcategory(child.slug)}
                    >
                      <C.CategoryOptionLabel>
                        <TagIcon size={16} />
                        {getCategoryName(child, router.locale)}
                      </C.CategoryOptionLabel>
                    </C.CategoryOption>
                  ))}
                </C.SidebarCardBody>
              </C.SidebarCard>
            )}

            <FilterSidebar
              facets={facets}
              filters={filters}
              locale={router.locale}
              onChange={setFilter}
              onClear={clearFilters}
            />
          </C.Sidebar>

          <C.Main>
            <C.Toolbar>
              {meta && (
                <C.ToolbarCount>
                  ნაჩვენებია <strong>{products.length}</strong> / {meta.total}-დან
                </C.ToolbarCount>
              )}
              <C.SortWrap>
                <C.SortLabel>დალაგება:</C.SortLabel>
                <Dropdown
                  ariaLabel="დალაგება"
                  minWidth={200}
                  value={sortValue}
                  onChange={(val) => {
                    const opt = SORT_OPTIONS.find((o) => o.value === val);
                    setSort(opt?.sortBy, opt?.order);
                  }}
                  options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                />
              </C.SortWrap>
            </C.Toolbar>

            {loading ? (
              <C.ProductsGrid>
                {Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, idx) => (
                  <C.SkeletonCard key={idx}>
                    <C.SkeletonBlock height="220px" />
                    <div style={{ padding: 14 }}>
                      <C.SkeletonBlock height="14px" />
                      <div style={{ marginTop: 8 }}>
                        <C.SkeletonBlock height="18px" />
                      </div>
                    </div>
                  </C.SkeletonCard>
                ))}
              </C.ProductsGrid>
            ) : products.length === 0 ? (
              <C.EmptyState>
                <SearchIcon size={48} />
                <C.EmptyStateTitle>ამ ფილტრებით პროდუქტი არ მოიძებნა</C.EmptyStateTitle>
              </C.EmptyState>
            ) : (
              <C.ProductsGrid>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </C.ProductsGrid>
            )}

            {meta && meta.totalPages > 1 && (
              <C.PaginationBar>
                <C.PageButton onClick={() => setPage(Math.max(1, meta.page - 1))} disabled={!meta.hasPrevious}>
                  ←
                </C.PageButton>
                <C.PageNumbers>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                    <C.PageNumberButton key={n} active={n === meta.page} onClick={() => setPage(n)}>
                      {n}
                    </C.PageNumberButton>
                  ))}
                </C.PageNumbers>
                <C.PageButton onClick={() => setPage(meta.page + 1)} disabled={!meta.hasNext}>
                  →
                </C.PageButton>
              </C.PaginationBar>
            )}
          </C.Main>
        </C.Layout>
      </C.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </C.PageBackground>
  );
};

export default CategoryProductsPage;
