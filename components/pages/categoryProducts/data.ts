import { CategoriesAPI } from "@/API_Client";
import { Category, PaginatedResponseDto, Product } from "@/API_Client/types";
import { CategoryFiltersState } from "@/hooks/useCategoryFilters";

export const PRODUCTS_PAGE_SIZE = 12;

// თუ კატეგორიას აქვს parent (ანუ თავად ქვეკატეგორიაა), ვაჩვენებთ მის და-ძმა
// კატეგორიებს (parent-ის შვილებს); root კატეგორიაზე კი — თავისივე შვილებს.
export const fetchCategoryChildren = async (locale: string, category: Category): Promise<Category[]> => {
  const res = await CategoriesAPI(locale, "").categoryControllerFindAll(
    1,
    100,
    undefined,
    undefined,
    String(category.parent ? category.parent.id : category.id)
  );
  const data = res.data as unknown as PaginatedResponseDto<Category>;
  return Array.isArray(data?.data) ? data.data : [];
};

export const fetchCategoryProducts = async (locale: string, slug: string, state: CategoryFiltersState) => {
  const res = await CategoriesAPI(locale, "").categoryControllerGetProducts(slug, {
    params: {
      ...state.filters,
      ...(state.subcategory ? { subcategory: state.subcategory } : {}),
      page: String(state.page),
      limit: String(PRODUCTS_PAGE_SIZE),
      ...(state.sortBy ? { sortBy: state.sortBy } : {}),
      ...(state.order ? { order: state.order } : {}),
    },
  } as any);
  const data = res.data as unknown as PaginatedResponseDto<Product>;
  return { products: Array.isArray(data?.data) ? data.data : [], meta: data?.meta || null };
};

// იგივე ფორმა, რაც products effect-ის dependency-ებს აქვს — სერვერზე ჩატვირთული
// კომბინაციის პირველი კლიენტური fetch-ის გამოსატოვებლად.
export const categoryProductsKey = (locale: string | undefined, slug: string, state: CategoryFiltersState) =>
  JSON.stringify([locale, slug, state.filters, state.subcategory, state.page, state.sortBy, state.order]);

export interface CategoryInitialData {
  key: string;
  category: Category;
  children: Category[];
  products: Product[];
  meta: PaginatedResponseDto<Product>["meta"] | null;
}
