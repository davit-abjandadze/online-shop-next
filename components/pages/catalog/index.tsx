import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import Dropdown from "@/components/shared/Dropdown";
import ProductCard from "@/components/shared/ProductCard";
import { SearchIcon } from "@/components/ui/RefIcons";
import { CategoriesAPI, ProductsAPI } from "@/API_Client";
import { Category, Product } from "@/API_Client/client/models";
import { PaginatedResponseDto } from "@/API_Client/types";
import * as S from "./style";

const PRODUCTS_PAGE_SIZE = 12;

export const CatalogComponent: React.FC = () => {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedResponseDto<Product>["meta"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // `page`-ს ვასინქრონებთ URL-ის `?page=` პარამეტრთან, გაზიარებული/დაბუქმარკებული
  // ბმული იმავე გვერდიდან გახსნას რომ იძლეოდეს
  useEffect(() => {
    if (!router.isReady) return;
    const queryPage = parseInt(router.query.page as string, 10);
    if (!isNaN(queryPage) && queryPage > 0 && queryPage !== page) {
      setPage(queryPage);
    }
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

  const handleCategorySelect = (categoryId: number | null) => {
    setActiveCategoryId(categoryId);
    setPage(1);
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: "1" } },
      undefined,
      { shallow: true }
    );
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductsAPI(router.locale || "ka", "").productsControllerFindAll(
        page,
        PRODUCTS_PAGE_SIZE,
        undefined,
        undefined,
        undefined,
        activeCategoryId ?? undefined
      );
      const data = res.data as unknown as PaginatedResponseDto<Product>;
      setProducts(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("პროდუქტების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoriesAPI(router.locale || "ka", "").categoryControllerFindAll();
      const data = res.data as unknown as Category[];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // კატეგორიების ფილტრი არასავალდებულოა, შეცდომას ჩუმად ვტოვებთ
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeCategoryId, router.locale]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.PageHeader>
          <S.PageTitle>მაღაზია</S.PageTitle>
          <S.PageSubtitle>დაათვალიერეთ ჩვენი პროდუქტების კატალოგი</S.PageSubtitle>
        </S.PageHeader>

        <S.FilterBar>
          <S.CategorySelectWrap>
            <S.SortLabel>კატეგორია:</S.SortLabel>
            <Dropdown
              ariaLabel="კატეგორია"
              minWidth={180}
              value={activeCategoryId === null ? "all" : String(activeCategoryId)}
              onChange={(val) => handleCategorySelect(val === "all" ? null : Number(val))}
              options={[
                { value: "all", label: "ყველა კატეგორია" },
                ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
              ]}
            />
          </S.CategorySelectWrap>
        </S.FilterBar>

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
              {activeCategoryId === null ? "პროდუქტები არ არის" : "ამ კატეგორიაში პროდუქტები არ არის"}
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
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default CatalogComponent;
