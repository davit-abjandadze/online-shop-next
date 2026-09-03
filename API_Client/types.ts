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
  phoneNumber?: string;
  personalNumber?: string;
  // ბექენდზე დამოწმებული მხოლოდ OTP-ის წარმატებული გავლის შემდეგ (რეგისტრაცია/
  // Google OAuth/პროფილის ცვლილება) — იხ. UsersService.create/update online-shop-nest-ში.
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

// იგივე მიზეზით (CartController-ის მეთოდებს OpenAPI-ში ცხადი პასუხის ტიპი
// არ აქვს მითითებული, იხ. src/cart/cart.controller.ts online-shop-nest-ში)
// `Cart`/`CartItem` გენერირებულ კლიენტში აღარ ჩნდება — ხელით ვაფიქსირებთ
// ბექენდის entity-ების ფორმას (src/cart/entities/{cart,cart-item}.entity.ts).
// CartItem-ს ფასს არ ვინახავთ ცალკე — ყოველთვის `product.price`-დან იკითხება.
import type { Company, Product as GeneratedProduct } from "./client/models";
import type {
  NameTranslationsDto,
  ProductTranslationsDto,
  ValueTranslationsDto,
} from "./translations";

// გენერირებული `Category` ტიპი (`./client/models`) ჯერ არ ასახავს ბექენდის
// Phase 1-ის მრავალენოვან კონტენტს (`nameKa`/`nameEn` ისევ იქ წერია, რადგან
// `yarn generate:api` ჯერ არ გაშვებულა backend-ის განახლებული swagger.json-ის
// წინააღმდეგ) — ხელით ვაფიქსირებთ რეალურ runtime shape-ს, დანარჩენი ველები
// უცვლელად generated `Category`-დან (src/category/entities/category.entity.ts).
export interface Category {
  id: string;
  translations: NameTranslationsDto;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

// გენერირებული `Product` ტიპი (`name`/`description`) ხელუხლებელი რჩება — ეს
// ველები ბექენდიდან ისევ მოდის, უბრალოდ ახლა უკვე `Accept-Language`-ის
// მიხედვით ლოკალიზებულია (`resolveTranslation`, products.controller.ts
// online-shop-nest-ში). დამატებით ემატება ორიგინალი `translations` obj —
// admin dashboard-ს ეს სჭირდება სამივე ენის ერთდროულად რედაქტირებისთვის
// (იხ. `translations.ka`/`.en`/`.ru`), ხოლო `category` relation-საც ზემოთ
// გადაწერილ `Category`-ზე ვამისამართებთ, არა გენერირებულ ორიგინალზე.
export interface Product extends Omit<GeneratedProduct, "category"> {
  translations: ProductTranslationsDto;
  category?: Category;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  // ბექენდის getOrCreateForUser (CartService) `color` relation-ს არ ტვირთავს
  // (`relations: { items: { product: { category: true } } }`), მაგრამ colorId
  // საკუთარი column-ია და ყოველთვის ჩნდება — ფერის დასახელება/hex-ი
  // ცალკე GET /products/:id/colors-ის მიხედვით უნდა მოიძებნოს (იხ. cart-ის
  // გვერდზე).
  colorId?: string | null;
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

export type DeliveryMethod = "courier" | "pickup";

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
  deliveryMethod: DeliveryMethod;
  branch?: Branch | null;
  shippingAddress?: string;
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
  // ბექენდის Phase 1-ის ცვლილების შემდეგ `valueKa`/`valueEn`-ის მაგივრად
  // მრავალენოვანი `translations` obj მოდის — იხ. `getLocalizedValue`
  // (`@/utils/getCategoryName`) ლოკალიზებული მნიშვნელობის წასაკითხად.
  translations: ValueTranslationsDto;
  code: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  // ბექენდის Phase 1-ის ცვლილების შემდეგ `nameKa`/`nameEn`-ის მაგივრად
  // მრავალენოვანი `translations` obj მოდის — იხ. `getCategoryName`
  // (`@/utils/getCategoryName`) ლოკალიზებული სახელის წასაკითხად.
  translations: NameTranslationsDto;
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

// იგივე მიზეზით (AddressesController-ის მეთოდებს OpenAPI-ში ცხადი პასუხის
// ტიპი არ აქვს მითითებული, იხ. src/addresses/addresses.controller.ts
// online-shop-nest-ში) `Address` გენერირებულ კლიენტში აღარ ჩნდება — ხელით
// ვაფიქსირებთ ბექენდის entity-ის ფორმას (src/addresses/entities/address.entity.ts).
export interface Address {
  id: number;
  title: string;
  phoneNumber: string;
  city: string;
  address: string;
  comment?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// იგივე მიზეზით (BranchesController-ის მეთოდებს OpenAPI-ში ცხადი პასუხის
// ტიპი არ აქვს მითითებული, იხ. src/branches/branches.controller.ts
// online-shop-nest-ში) `Branch` გენერირებულ კლიენტში აღარ ჩნდება — ხელით
// ვაფიქსირებთ ბექენდის entity-ის ფორმას (src/branches/entities/branch.entity.ts).
// `null` მნიშვნელობა კვირის ერთ დღეზე ნიშნავს, რომ ფილიალი ამ დღეს დახურულია.
// `companyId` სავალდებულოა (ფილიალი ყოველთვის ერთ კონკრეტულ კომპანიას ეკუთვნის),
// `company` relation კი `GET /branches`/`/branches/admin/all`/`/branches/available`-ზე
// ყოველთვის ჩატანილია (BranchesService-ის `relations: { company: true }`).
export interface BranchDayHours {
  open: string;
  close: string;
}

export interface BranchWorkingHours {
  mon: BranchDayHours | null;
  tue: BranchDayHours | null;
  wed: BranchDayHours | null;
  thu: BranchDayHours | null;
  fri: BranchDayHours | null;
  sat: BranchDayHours | null;
  sun: BranchDayHours | null;
}

export interface Branch {
  id: number;
  companyId: string;
  company?: Company;
  title: string;
  address: string;
  phoneNumber: string;
  email?: string;
  latitude: number;
  longitude: number;
  workingHours: BranchWorkingHours;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// იგივე მიზეზით (ColorsController-ის findAll/findOne/create/update-ს OpenAPI-ში
// ცხადი პასუხის ტიპი არ აქვს მითითებული, იხ. src/colors/colors.controller.ts
// online-shop-nest-ში) `Color` გენერირებულ კლიენტში აღარ ჩნდება — ხელით
// ვაფიქსირებთ ბექენდის entity-ის ფორმას (src/colors/entities/color.entity.ts).
export interface Color {
  id: string;
  // ბექენდის Phase 1-ის ცვლილების შემდეგ `nameKa`/`nameEn`-ის მაგივრად
  // მრავალენოვანი `translations` obj მოდის — იხ. `getCategoryName`
  // (`@/utils/getCategoryName`) ლოკალიზებული სახელის წასაკითხად.
  translations: NameTranslationsDto;
  hexCode?: string;
  createdAt: string;
  updatedAt: string;
}

// GET/PUT /products/:id/colors row — იგივე მიზეზით (ProductsController-ის
// getColors/setColors-ს OpenAPI-ში ცხადი პასუხის ტიპი არ აქვს მითითებული)
// ხელით ვაფიქსირებთ ბექენდის entity-ის ფორმას
// (src/products/entities/product-color.entity.ts). `color` relation GET-ზე
// ყოველთვის ჩატანილია (ProductsService.getColors), PUT-ის პასუხზე კი არა.
export interface ProductColor {
  id: string;
  productId: number;
  colorId: string;
  color?: Color;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// GET/PUT /products/:id/branches row — იგივე მიზეზით (ProductsController-ის
// getBranches/setBranches-ს OpenAPI-ში ცხადი პასუხის ტიპი არ აქვს მითითებული)
// ხელით ვაფიქსირებთ ბექენდის entity-ის ფორმას
// (src/products/entities/product-branch.entity.ts). `branch` relation (თავისი
// `company` ჩაშენებული relation-ითურთ) GET-ზე ყოველთვის ჩატანილია
// (ProductsService.getBranches-ის `relations: { branch: { company: true } }`),
// PUT-ის პასუხზე კი არა — colors-ის იგივე ასიმეტრია. ProductBranch.stock,
// ProductColor-ისგან განსხვავებით, product.stock-ში არ სინქრონდება — დამოუკიდებელი
// განზომილებაა (checkout-ის pickup-ნაკადი ცალკე ამოწმებს).
export interface ProductBranch {
  id: string;
  productId: number;
  branchId: number;
  branch?: Branch;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// GET /categories/:slug/filters — მთელი პასუხი ერთი flat მასივია (არა
// `{ data, meta }`-ის მსგავსი envelope), თითო filterable attribute-ზე ერთი
// row, `attribute.type`-ის მიხედვით სხვადასხვა დამატებითი ველით
// (CategoryService.getFilters).
export interface CategoryFilterAttributeSummary {
  id: string;
  translations: NameTranslationsDto;
  code: string;
  type: AttributeType;
  unit?: string | null;
}

export interface CategoryFilterOptionCount {
  id: string;
  translations: ValueTranslationsDto;
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
