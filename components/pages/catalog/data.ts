import { ParsedUrlQuery } from "querystring";
import { CategoriesAPI, ProductsAPI } from "@/API_Client";
import { ProductsControllerFindAllOrderEnum } from "@/API_Client/client/apis/products-api";
import { Category, PaginatedResponseDto, Product } from "@/API_Client/types";

export const PRODUCTS_PAGE_SIZE = 12;

// დალაგების ვარიანტის მნიშვნელობა → API-ის sortBy/order (label-ები კომპონენტშია, t()-ით)
export const SORT_MAP: Record<string, { sortBy?: string; order?: ProductsControllerFindAllOrderEnum }> = {
  default: {},
  new: { sortBy: "createdAt", order: ProductsControllerFindAllOrderEnum.Desc },
  price_asc: { sortBy: "price", order: ProductsControllerFindAllOrderEnum.Asc },
  price_desc: { sortBy: "price", order: ProductsControllerFindAllOrderEnum.Desc },
};

export interface CatalogParams {
  page: number;
  sort: string;
  search: string;
  category: string | null;
}

// URL-ის query → კატალოგის პარამეტრები (სერვერზეც და კლიენტზეც ერთნაირად)
export const parseCatalogQuery = (query: ParsedUrlQuery): CatalogParams => {
  const page = parseInt(query.page as string, 10);
  const sort = typeof query.sort === "string" && query.sort in SORT_MAP ? query.sort : "default";
  return {
    page: !isNaN(page) && page > 0 ? page : 1,
    sort,
    search: typeof query.search === "string" ? query.search.trim() : "",
    category: typeof query.category === "string" ? query.category : null,
  };
};

export const catalogParamsKey = (params: CatalogParams) =>
  JSON.stringify([params.page, params.sort, params.search, params.category]);

export const fetchCatalogProducts = async (locale: string, params: CatalogParams) => {
  const { sortBy, order } = SORT_MAP[params.sort] || {};
  const res = await ProductsAPI(locale, "").productsControllerFindAll(
    params.page,
    PRODUCTS_PAGE_SIZE,
    sortBy,
    order,
    params.search || undefined,
    params.category ?? undefined
  );
  const data = res.data as unknown as PaginatedResponseDto<Product>;
  return { products: Array.isArray(data?.data) ? data.data : [], meta: data?.meta || null };
};

export const fetchCatalogCategories = async (locale: string): Promise<Category[]> => {
  // categoryControllerFindAll გვერდიანია (PaginatedResponseDto<Category>) —
  // ფილტრის სრული სიისთვის დიდი limit-ით ვითხოვთ (იხ. API_Client/types.ts).
  const res = await CategoriesAPI(locale, "").categoryControllerFindAll(1, 100);
  const data = res.data as unknown as PaginatedResponseDto<Category>;
  return Array.isArray(data?.data) ? data.data : [];
};

export interface CatalogInitialData {
  key: string;
  products: Product[];
  meta: PaginatedResponseDto<Product>["meta"] | null;
  categories: Category[];
}
