// ბექენდის `PaginatedResponseDto<T>`/`PaginationMetaDto`-ს ხელით ჩაწერილი ტიპები.
// ეს ორი DTO გენერირებულ კლიენტში აღარ ჩნდება, რადგან ბექენდის კონტროლერების
// გვერდიანი სიის endpoint-ებს (`GET /products`, `GET /categories`) OpenAPI-ში
// ცხადი `@ApiResponse({ type })` არ აქვს მითითებული (იხ. src/products/products.controller.ts,
// src/category/category.controller.ts online-shop-nest-ში) — ამიტომ generate-api.js-ის
// გენერირებულ კლიენტში `findAll`-ის დაბრუნების ტიპი `void`-ია. რანთაიმზე პასუხი მაინც
// რეალურად ამ ფორმის ობიექტია, ამიტომ აქ ხელით ვაფიქსირებთ actual shape-ს.
export interface PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}

// იგივე მიზეზით (findAll/findOne-ს OpenAPI-ში ცხადი პასუხის ტიპი არ აქვს
// მითითებული, იხ. src/users/users.controller.ts online-shop-nest-ში) `User`
// ტიპი გენერირებულ კლიენტში აღარ ჩნდება — ხელით ვაფიქსირებთ ბექენდის
// `User` entity-ის ფორმას (src/users/entities/user.entity.ts), password ველის გარეშე.
export type UserGenderEnum = "male" | "female";
export type UserRoleEnum = "admin" | "user";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoleEnum;
  gender?: UserGenderEnum;
  age?: number;
  createdAt: string;
}

// იგივე მიზეზით (CartController-ის მეთოდებს OpenAPI-ში ცხადი პასუხის ტიპი
// არ აქვს მითითებული, იხ. src/cart/cart.controller.ts online-shop-nest-ში)
// `Cart`/`CartItem` გენერირებულ კლიენტში აღარ ჩნდება — ხელით ვაფიქსირებთ
// ბექენდის entity-ების ფორმას (src/cart/entities/{cart,cart-item}.entity.ts).
// CartItem-ს ფასს არ ვინახავთ ცალკე — ყოველთვის `product.price`-დან იკითხება.
import type { Product } from "./client/models";

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// იგივე მიზეზით (OrdersController-ის მეთოდებს OpenAPI-ში ცხადი პასუხის ტიპი
// არ აქვს მითითებული, იხ. src/orders/orders.controller.ts online-shop-nest-ში)
// `Order`/`OrderItem` გენერირებულ კლიენტში აღარ ჩნდება — ხელით ვაფიქსირებთ
// ბექენდის entity-ების ფორმას (src/orders/entities/{order,order-item}.entity.ts).
// OrderItem-ს productName/unitPrice snapshot-ად ინახავს ბექენდი შეკვეთის
// შექმნის მომენტში — არასდროს არ იკითხება ცოცხლად product.name/product.price-დან,
// რომ პროდუქტის მომავალმა ცვლილებამ ისტორიული შეკვეთა არ გადაწეროს.
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "expired";

export interface OrderItem {
  id: number;
  product?: Product | null;
  productName: string;
  unitPrice: string;
  quantity: number;
}

// ბექენდი findOneForUser/findAllPaginated-ში user-ის მხოლოდ ამ ველებს
// ირჩევს (password არასდროს არ ჟონავს, იხ. orders.service.ts-ის `select`).
export interface OrderUserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Order {
  id: number;
  user: OrderUserSummary;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: string;
  currency: string;
  shippingAddress: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// PaymentsController-ის `initiate`-საც არ აქვს ცხადი @ApiResponse({ type }),
// მაგრამ PaymentsService.initiate რანთაიმზე ამ ფორმას აბრუნებს
// (იხ. src/payments/payments.service.ts online-shop-nest-ში).
export interface PaymentInitiateResponse {
  redirectUrl: string;
}

// AttributeController/CategoryController-ის (attribute-set/filter) endpoint-ებს
// OpenAPI-ში ცხადი @ApiResponse({ type }) არ აქვს, ამიტომ generate-api.js-ის
// გენერირებულ კლიენტში ეს ყველა `AxiosPromise<void>`-ია — ხელით ვაფიქსირებთ
// ბექენდზე რეალურად გადამოწმებულ (curl) response shape-ს
// (src/attribute/, src/category/, src/products/ online-shop-nest-ში).
export type AttributeType =
  | "select"
  | "multi_select"
  | "number"
  | "text"
  | "boolean"
  | "range";

export interface AttributeOption {
  id: string;
  attributeId: string;
  valueKa: string;
  valueEn: string;
  code: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  nameKa: string;
  nameEn: string;
  code: string;
  type: AttributeType;
  unit?: string | null;
  isFilterable: boolean;
  isRequired: boolean;
  sortOrder: number;
  options?: AttributeOption[];
  createdAt: string;
  updatedAt: string;
}

// GET /categories/:id/attributes-ის row — `categoryId` ყოველთვის იმ
// კატეგორიის id-ია, სადაც attribute პირდაპირ არის მიბმული (არა querying
// კატეგორია) — ამის შედარებით queried category.id-თან შორისდება
// "საკუთარი" vs "მემკვიდრეობით მიღებული" row (იხ. CategoryService.
// findAttributesForCategory).
export interface CategoryAttribute {
  id: string;
  categoryId: string;
  attributeId: string;
  sortOrder: number;
  isRequiredOverride: boolean | null;
  attribute: Attribute;
  createdAt: string;
  updatedAt: string;
}

// GET/PUT /products/:id/attribute-values row.
export interface ProductAttributeValue {
  id: string;
  productId: number;
  attributeId: string;
  attributeOptionId?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  attribute?: Attribute;
  attributeOption?: AttributeOption | null;
  createdAt: string;
  updatedAt: string;
}

// GET/POST/PUT/DELETE /products/:id/additional-info row — პასუხიც
// envelope-ის გარეშე, headless-ია (ProductsService.getAdditionalInfo და ა.შ.).
export interface ProductAdditionalInfo {
  id: string;
  productId: number;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// GET /categories/:slug/filters — მთელი პასუხი ერთი flat მასივია (არა
// `{ data, meta }`-ის მსგავსი envelope), თითო filterable attribute-ზე ერთი
// row, `attribute.type`-ის მიხედვით სხვადასხვა დამატებითი ველით
// (CategoryService.getFilters).
export interface CategoryFilterAttributeSummary {
  id: string;
  nameKa: string;
  nameEn: string;
  code: string;
  type: AttributeType;
  unit?: string | null;
}

export interface CategoryFilterOptionCount {
  id: string;
  valueKa: string;
  valueEn: string;
  code: string;
  count: number;
}

export interface CategoryFilterEntry {
  attribute: CategoryFilterAttributeSummary;
  // select/multi_select
  options?: CategoryFilterOptionCount[];
  // number/range
  min?: number | null;
  max?: number | null;
  // boolean
  counts?: { true: number; false: number };
  // text — მხოლოდ attribute-ის ჩვენებისთვის, count-ის გარეშე
}

export type CategoryFiltersResponse = CategoryFilterEntry[];

// იგივე მიზეზით (FavoritesController-ის მეთოდებს OpenAPI-ში ცხადი პასუხის
// ტიპი არ აქვს მითითებული, იხ. src/favorites/favorites.controller.ts
// online-shop-nest-ში) `Favorite` გენერირებულ კლიენტში აღარ ჩნდება — ხელით
// ვაფიქსირებთ ბექენდის entity-ის ფორმას (src/favorites/entities/favorite.entity.ts).
// `findAll` პასუხს product.category-ც ჩატანილი აქვს (FavoritesService relations).
export interface Favorite {
  id: number;
  product: Product;
  createdAt: string;
}
