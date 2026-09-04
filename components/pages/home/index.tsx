import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Swiper as SwiperType } from "swiper";
import "swiper/css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import ProductCard from "@/components/shared/ProductCard";
import ProductSliderBlock from "@/components/shared/ProductSliderBlock";
import {
  ArrowRightIcon,
  BoxIcon,
  CartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FireIcon,
  LockIcon,
  TagIcon,
  UndoIcon,
} from "@/components/ui/RefIcons";
import { CategoriesAPI, HeroSlidesAPI, ProductsAPI } from "@/API_Client";
import { ProductsControllerFindAllOrderEnum } from "@/API_Client/client/apis/products-api";
import { Category, HeroSlide, PaginatedResponseDto, Product } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

// `GET /hero-slides` (storefront, საჯარო) locale-ის მიხედვით უკვე resolve-
// ებულ eyebrow/title/description/buttonText/product.name-ს აბრუნებს
// (იხ. enrichHeroSlide, online-shop-nest/src/hero-slides/hero-slides.controller.ts)
// — ამიტომ ესენი `HeroSlide`-ის `translations`-ზე დამატებით ველებადაა საჭირო.
type ResolvedHeroSlide = HeroSlide & {
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
};

const FEATURED_LIMIT = 8;
const NEW_ARRIVALS_LIMIT = 8;
const CATEGORIES_LIMIT = 6;
const HERO_AUTOPLAY_MS = 6000;

// სურათის URL-ს CDN-ის საბაზო მისამართთან აერთებს (თუ უკვე absolute არაა) —
// იგივე ლოგიკა, რაც ProductCard-ში/HeroSlidesPage.tsx-შია.
const resolveImage = (url?: string) => (url ? (url.startsWith("http") ? url : `${CDN_URL}${url}`) : undefined);

// ფოლბექ გრადიენტები, თუ სლაიდს სურათი არ აქვს (არ უნდა მოხდეს, სურათი
// ადმინის ფორმაში სავალდებულოა, მაგრამ დამატებით დაცვად ვტოვებთ).
const FALLBACK_GRADIENTS = [
  { gradientFrom: "#ebddc9", gradientTo: "#c9af87" },
  { gradientFrom: "#98a6d6", gradientTo: "#3b4e92" },
  { gradientFrom: "#e3dccf", gradientTo: "#b7a98c" },
];

const BENEFITS_CONFIG = [
  { key: "delivery", icon: BoxIcon },
  { key: "payment", icon: LockIcon },
  { key: "returns", icon: UndoIcon },
  { key: "support", icon: ClipboardIcon },
];

export const HomeComponent: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation("home");

  const BENEFITS = BENEFITS_CONFIG.map(({ key, icon }) => ({
    icon,
    title: t(`benefit-${key}-title`),
    text: t(`benefit-${key}-text`),
  }));

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<ResolvedHeroSlide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSwiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, featuredRes, newArrivalsRes, heroSlidesRes] = await Promise.all([
          // /categories/tree — root კატეგორიები ნესთებული children-ით, რომ
          // hover-ზე გახსნილ მეგა-მენიუში რეალური ქვეკატეგორიები გამოჩნდეს.
          CategoriesAPI(router.locale || "ka", "").categoryControllerFindTree(),
          ProductsAPI(router.locale || "ka", "").productsControllerFindAll(
            1,
            FEATURED_LIMIT,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            true
          ),
          ProductsAPI(router.locale || "ka", "").productsControllerFindAll(
            1,
            NEW_ARRIVALS_LIMIT,
            "createdAt",
            ProductsControllerFindAllOrderEnum.Desc,
            undefined,
            undefined,
            undefined,
            undefined,
            true
          ),
          // hero სლაიდერისთვის — /hero-slides საჯარო endpoint-ია (findActive),
          // ადმინ დეშბორდში მართული სლაიდები (/dashboard/hero-slides),
          // უკვე მხოლოდ აქტიური და sortOrder-ით დალაგებული ბრუნდება.
          HeroSlidesAPI(router.locale || "ka", "").heroSlidesControllerFindActive(),
        ]);

        const categoriesData = categoriesRes.data as unknown as Category[];
        setCategories(Array.isArray(categoriesData) ? categoriesData.slice(0, CATEGORIES_LIMIT) : []);

        const featuredData = featuredRes.data as unknown as PaginatedResponseDto<Product>;
        setFeatured(Array.isArray(featuredData?.data) ? featuredData.data : []);

        const newArrivalsData = newArrivalsRes.data as unknown as PaginatedResponseDto<Product>;
        setNewArrivals(Array.isArray(newArrivalsData?.data) ? newArrivalsData.data : []);

        const heroSlidesData = heroSlidesRes.data as unknown as ResolvedHeroSlide[];
        setHeroSlides(Array.isArray(heroSlidesData) ? heroSlidesData : []);
      } catch (err) {
        console.error("Error fetching home page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* კატეგორიების დროპდაუნ-ზოლი ჰედერშივეა ჩაშენებული (იხ.
          components/shared/Header) — მთავარ გვერდზე ცალკე აღარ დუბლირდება. */}

      {/* Hero Slider — swiper-ით, 1 სლაიდი ერთ ხედში, ავტომატური გადართვით.
          სლაიდები ადმინ დეშბორდიდან მოდის (/dashboard/hero-slides), საჯარო
          /hero-slides endpoint-იდან (იხ. heroSlides fetch ზემოთ) — თუ სლაიდი
          არცერთი არაა კონფიგურირებული, სექცია საერთოდ არ ჩნდება. */}
      {(loading || heroSlides.length > 0) && (
        <S.Hero>
          <S.HeroRow>
            <S.HeroSliderArea>
              <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                spaceBetween={20}
                loop
                autoplay={{ delay: HERO_AUTOPLAY_MS, disableOnInteraction: false }}
                onSwiper={(swiper) => {
                  heroSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => setHeroIndex(swiper.realIndex)}
              >
                {heroSlides.map((slide, idx) => {
                  const gradient = FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];
                  const href = slide.buttonLink || (slide.product ? `/products/${slide.product.id}` : "/products");
                  return (
                    <SwiperSlide key={slide.id}>
                      <S.HeroSlide>
                        <S.HeroContent>
                          {slide.eyebrow && (
                            <S.HeroEyebrow>
                              <S.HeroEyebrowBar />
                              <span>{slide.eyebrow}</span>
                            </S.HeroEyebrow>
                          )}
                          <S.HeroTitle>{slide.title}</S.HeroTitle>
                          {slide.description && <S.HeroText>{slide.description}</S.HeroText>}
                          <Link href={href} passHref legacyBehavior>
                            <S.HeroButton>
                              {slide.buttonText || t("hero-1-cta")} <ArrowRightIcon size={16} />
                            </S.HeroButton>
                          </Link>
                        </S.HeroContent>
                        <S.HeroArt from={gradient.gradientFrom} to={gradient.gradientTo} image={resolveImage(slide.image)}>
                          {!slide.image && <CartIcon size={88} />}
                        </S.HeroArt>
                      </S.HeroSlide>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* ნავიგაცია ჩვეულებრივ ნაკადშია სლაიდის შემდეგ (არა overlay) — მუდამ
                  კონტენტის ქვემოთაა და არასდროს გადაეფარება მას (იხ. HeroControls
                  margin-top: 30px). */}
              <S.HeroControls>
                <S.HeroDots>
                  {heroSlides.map((slide, idx) => (
                    <S.HeroDot
                      key={slide.id}
                      active={idx === heroIndex}
                      type="button"
                      aria-label={t("hero-slide-aria", { n: idx + 1 })}
                      onClick={() => heroSwiperRef.current?.slideToLoop(idx)}
                    />
                  ))}
                </S.HeroDots>

                <S.HeroArrows>
                  <S.HeroArrow
                    type="button"
                    aria-label={t("hero-prev-aria")}
                    onClick={() => heroSwiperRef.current?.slidePrev()}
                  >
                    <ChevronLeftIcon size={16} />
                  </S.HeroArrow>
                  <S.HeroArrow
                    type="button"
                    aria-label={t("hero-next-aria")}
                    onClick={() => heroSwiperRef.current?.slideNext()}
                  >
                    <ChevronRightIcon size={16} />
                  </S.HeroArrow>
                </S.HeroArrows>
              </S.HeroControls>
            </S.HeroSliderArea>
          </S.HeroRow>
        </S.Hero>
      )}

      <S.Container>
        {/* Popular categories */}
        {/* <S.Section>
          <S.CategoryHeader>
            <S.CategoryTitle>{t("popular-categories-title")}</S.CategoryTitle>
          </S.CategoryHeader>

          {!loading && categories.length === 0 ? (
            <S.EmptyRow>{t("categories-empty")}</S.EmptyRow>
          ) : (
            <S.CategoryGrid>
              {(loading ? Array.from({ length: CATEGORIES_LIMIT }) : categories).map((category: any, idx) => {
                const isActive = category && router.query.slug === category.slug;
                return (
                  <Link
                    key={category?.id ?? idx}
                    href={category ? `/categories/${category.slug}` : "/products"}
                    passHref
                    legacyBehavior
                  >
                    <S.CategoryCard active={isActive}>
                      <S.CategoryIconBadge active={isActive}>
                        <TagIcon size={22} />
                      </S.CategoryIconBadge>
                      <S.CategoryName active={isActive}>
                        {category ? getCategoryName(category, router.locale) : ""}
                      </S.CategoryName>
                    </S.CategoryCard>
                  </Link>
                );
              })}
            </S.CategoryGrid>
          )}
        </S.Section> */}

<ProductSliderBlock keyName="popular-slider" />

        {/* Featured products */}
        <S.Section>
          <S.SectionHeader>
            <div>
              <S.SectionTitle>{t("featured-title")}</S.SectionTitle>
            </div>
            <Link href="/products" passHref legacyBehavior>
              <S.ViewAllLink>{t("view-all")}</S.ViewAllLink>
            </Link>
          </S.SectionHeader>

          {loading ? (
            <S.ProductsGrid>
              {Array.from({ length: FEATURED_LIMIT }).map((_, idx) => (
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
          ) : featured.length === 0 ? (
            <S.EmptyRow>{t("products-empty")}</S.EmptyRow>
          ) : (
            <S.ProductsGrid>
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </S.ProductsGrid>
          )}
        </S.Section>

        {/* Promo banner */}
        <S.Section>
          <S.PromoBanner>
            <S.PromoText>
              <S.PromoTitle>{t("promo-title")}</S.PromoTitle>
              <S.PromoSubtitle>{t("promo-subtitle")}</S.PromoSubtitle>
            </S.PromoText>
            <Link href="/products" passHref legacyBehavior>
              <S.PromoButton>{t("promo-cta")}</S.PromoButton>
            </Link>
          </S.PromoBanner>
        </S.Section>

     
        {/* Benefits / trust */}
        <S.Section>
          <S.BenefitsGrid>
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <S.BenefitCard key={title}>
                <S.BenefitIconBadge>
                  <Icon size={22} />
                </S.BenefitIconBadge>
                <div>
                  <S.BenefitTitle>{title}</S.BenefitTitle>
                  <S.BenefitText>{text}</S.BenefitText>
                </div>
              </S.BenefitCard>
            ))}
          </S.BenefitsGrid>
        </S.Section>
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default HomeComponent;
