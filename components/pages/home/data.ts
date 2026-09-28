import { HeroSlidesAPI, ProductSlidersAPI, ProductsAPI } from "@/API_Client";
import { HeroSlide, PaginatedResponseDto, Product, ResolvedProductSlider } from "@/API_Client/types";

// `GET /hero-slides` (storefront, საჯარო) locale-ის მიხედვით უკვე resolve-
// ებულ eyebrow/title/description/buttonText/product.name-ს აბრუნებს
// (იხ. enrichHeroSlide, online-shop-nest/src/hero-slides/hero-slides.controller.ts)
// — ამიტომ ესენი `HeroSlide`-ის `translations`-ზე დამატებით ველებადაა საჭირო.
export type ResolvedHeroSlide = HeroSlide & {
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
};

export const FEATURED_LIMIT = 8;
// ადმინ დეშბორდში (/dashboard/product-sliders) მინიჭებული ბლოკის key
export const POPULAR_SLIDER_KEY = "popular-slider";

export interface HomeData {
  featured: Product[];
  heroSlides: ResolvedHeroSlide[];
  // null — ბლოკი არ არსებობს/არააქტიურია (ProductSliderBlock არაფერს აჩვენებს)
  popularSlider: ResolvedProductSlider | null;
}

/**
 * მთავარი გვერდის მონაცემები — getServerSideProps-იდან იძახება, რომ პროდუქტები
 * და hero სლაიდები სერვერის HTML-ში მოხვდეს (SEO). allSettled — ერთი (მაგ.
 * არასავალდებულო /hero-slides) მოთხოვნის ჩავარდნამ დანარჩენი სექციები ცარიელი
 * არ უნდა დატოვოს.
 */
export const fetchHomeData = async (locale: string): Promise<HomeData> => {
  const [featuredRes, heroSlidesRes, sliderRes] = await Promise.allSettled([
    ProductsAPI(locale, "").productsControllerFindAll(
      1,
      FEATURED_LIMIT,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    ),
    // ადმინ დეშბორდში მართული სლაიდები (/dashboard/hero-slides) — უკვე
    // მხოლოდ აქტიური და sortOrder-ით დალაგებული ბრუნდება.
    HeroSlidesAPI(locale, "").heroSlidesControllerFindActive(),
    // 404 — ბლოკი key-ით არ არსებობს; ეს შეცდომა არაა, ამიტომ ქვემოთ არ ილოგება
    ProductSlidersAPI(locale, "").productSlidersControllerFindActiveByKey(POPULAR_SLIDER_KEY),
  ]);

  [featuredRes, heroSlidesRes].forEach((result) => {
    if (result.status === "rejected") console.error("Error fetching home page data:", result.reason);
  });

  const featuredData =
    featuredRes.status === "fulfilled" ? (featuredRes.value.data as unknown as PaginatedResponseDto<Product>) : null;
  const heroSlidesData =
    heroSlidesRes.status === "fulfilled" ? (heroSlidesRes.value.data as unknown as ResolvedHeroSlide[]) : null;

  return {
    featured: Array.isArray(featuredData?.data) ? featuredData!.data : [],
    heroSlides: Array.isArray(heroSlidesData) ? heroSlidesData : [],
    popularSlider:
      sliderRes.status === "fulfilled" ? (sliderRes.value.data as unknown as ResolvedProductSlider) || null : null,
  };
};
