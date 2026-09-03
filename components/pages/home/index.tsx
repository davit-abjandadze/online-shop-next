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
import {
  ArrowRightIcon,
  BoxIcon,
  CartIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FireIcon,
  LockIcon,
  TagIcon,
  UndoIcon,
} from "@/components/ui/RefIcons";
import { CategoriesAPI, ProductsAPI } from "@/API_Client";
import { ProductsControllerFindAllOrderEnum } from "@/API_Client/client/apis/products-api";
import { Category, PaginatedResponseDto, Product } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

const FEATURED_LIMIT = 8;
const NEW_ARRIVALS_LIMIT = 8;
const CATEGORIES_LIMIT = 6;
const HERO_AUTOPLAY_MS = 6000;

// Hero Slider-ის სლაიდები — რეალურ პროდუქტის ფოტოებამდე თითოეულს აქვს საკუთარი
// გრადიენტი+ხატულა "ხელოვნური" ვიზუალი, სათაური, მოკლე ტექსტი და CTA ბმული.
// ტექსტები t()-ით მოდის (იხ. buildHeroSlides/buildBenefits) — მხოლოდ ვიზუალური
// მონაცემები (გრადიენტი, ბმული, ხატულა) რჩება სტატიკურად.
const HERO_SLIDE_VISUALS = [
  { href: "/products", gradientFrom: "#ebddc9", gradientTo: "#c9af87" },
  { href: "/products", gradientFrom: "#98a6d6", gradientTo: "#3b4e92" },
  { href: "/products", gradientFrom: "#e3dccf", gradientTo: "#b7a98c" },
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

  const HERO_SLIDES = HERO_SLIDE_VISUALS.map((visual, idx) => ({
    ...visual,
    eyebrow: t(`hero-${idx + 1}-eyebrow`),
    title: t(`hero-${idx + 1}-title`),
    text: t(`hero-${idx + 1}-text`),
    cta: t(`hero-${idx + 1}-cta`),
  }));

  const BENEFITS = BENEFITS_CONFIG.map(({ key, icon }) => ({
    icon,
    title: t(`benefit-${key}-title`),
    text: t(`benefit-${key}-text`),
  }));

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSwiperRef = useRef<SwiperType | null>(null);

  // ჰედერის ქვემოთ კატეგორიების დროპდაუნ-ზოლი — რომელი კატეგორიის დროპდაუნია
  // გახსნილი (id ან null). ერთდროულად მხოლოდ ერთი შეიძლება იყოს გახსნილი.
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<number | string | null>(null);
  const categoryFilterBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryFilterBarRef.current && !categoryFilterBarRef.current.contains(event.target as Node)) {
        setOpenCategoryDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, featuredRes, newArrivalsRes] = await Promise.all([
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
        ]);

        const categoriesData = categoriesRes.data as unknown as Category[];
        setCategories(Array.isArray(categoriesData) ? categoriesData.slice(0, CATEGORIES_LIMIT) : []);

        const featuredData = featuredRes.data as unknown as PaginatedResponseDto<Product>;
        setFeatured(Array.isArray(featuredData?.data) ? featuredData.data : []);

        const newArrivalsData = newArrivalsRes.data as unknown as PaginatedResponseDto<Product>;
        setNewArrivals(Array.isArray(newArrivalsData?.data) ? newArrivalsData.data : []);
      } catch (err) {
        console.error("Error fetching home page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

  // ერთი კატეგორიის დროპდაუნი ჰედერის ქვემოთ ზოლში. თუ ქვეკატეგორია აქვს,
  // ხელის დაჭერისას იშლება "ყველა" + ქვეკატეგორიების სია — "ყველა" ისევე
  // ფილტრავს, როგორც ადრე კატეგორიაზე დაჭერა ფილტრავდა. თუ ქვეკატეგორია არ
  // აქვს (მაგ. აკუმულატორი), პირდაპირ ბმულია კატეგორიის გვერდზე, დროპდაუნის გარეშე.
  const renderCategoryFilter = (category: Category) => {
    const children = category.children || [];
    const name = getCategoryName(category, router.locale);

    if (children.length === 0) {
      return (
        <Link key={category.id} href={`/categories/${category.slug}`} passHref legacyBehavior>
          <S.FilterBarLink>{name}</S.FilterBarLink>
        </Link>
      );
    }

    const isOpen = openCategoryDropdown === category.id;

    return (
      <S.FilterDropdown key={category.id}>
        <S.FilterDropdownTrigger
          type="button"
          open={isOpen}
          onClick={() => setOpenCategoryDropdown((prev) => (prev === category.id ? null : category.id))}
        >
          {name}
          <S.FilterDropdownChevron open={isOpen}>
            <ChevronDownIcon size={14} />
          </S.FilterDropdownChevron>
        </S.FilterDropdownTrigger>

        {isOpen && (
          <S.FilterDropdownPanel>
            <Link href={`/categories/${category.slug}`} passHref legacyBehavior>
              <S.FilterDropdownItem onClick={() => setOpenCategoryDropdown(null)}>{t("filter-dropdown-all")}</S.FilterDropdownItem>
            </Link>
            {children.map((child) => (
              <Link key={child.id} href={`/categories/${child.slug}`} passHref legacyBehavior>
                <S.FilterDropdownItem onClick={() => setOpenCategoryDropdown(null)}>
                  {getCategoryName(child, router.locale)}
                </S.FilterDropdownItem>
              </Link>
            ))}
          </S.FilterDropdownPanel>
        )}
      </S.FilterDropdown>
    );
  };

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* კატეგორიების დროპდაუნ-ზოლი ჰედერის ქვემოთ — ჰერო სლაიდერის ყოფილი
          გვერდითი ფილტრის ნაცვლად (იხ. renderCategoryFilter). */}
      <S.CategoryFilterBar ref={categoryFilterBarRef}>
        <S.CategoryFilterBarInner>
          {categories.length === 0 ? (
            <S.FilterEmpty>{t("filter-bar-empty")}</S.FilterEmpty>
          ) : (
            categories.map(renderCategoryFilter)
          )}
        </S.CategoryFilterBarInner>
      </S.CategoryFilterBar>

      {/* Hero Slider — swiper-ით, 1 სლაიდი ერთ ხედში, ავტომატური გადართვით. */}
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
              {HERO_SLIDES.map((slide, idx) => (
                <SwiperSlide key={idx}>
                  <S.HeroSlide>
                    <S.HeroContent>
                      <S.HeroEyebrow>
                        <S.HeroEyebrowBar />
                        <span>{slide.eyebrow}</span>
                      </S.HeroEyebrow>
                      <S.HeroTitle>{slide.title}</S.HeroTitle>
                      <S.HeroText>{slide.text}</S.HeroText>
                      <Link href={slide.href} passHref legacyBehavior>
                        <S.HeroButton>
                          {slide.cta} <ArrowRightIcon size={16} />
                        </S.HeroButton>
                      </Link>
                    </S.HeroContent>
                    <S.HeroArt from={slide.gradientFrom} to={slide.gradientTo}>
                      <CartIcon size={88} />
                    </S.HeroArt>
                  </S.HeroSlide>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* ნავიგაცია ჩვეულებრივ ნაკადშია სლაიდის შემდეგ (არა overlay) — მუდამ
                კონტენტის ქვემოთაა და არასდროს გადაეფარება მას (იხ. HeroControls
                margin-top: 30px). */}
            <S.HeroControls>
              <S.HeroDots>
                {HERO_SLIDES.map((_, idx) => (
                  <S.HeroDot
                    key={idx}
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

      <S.Container>
        {/* Popular categories */}
        <S.Section>
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
        </S.Section>

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

        {/* New arrivals */}
        {(loading || newArrivals.length > 0) && (
          <S.Section>
            <S.SectionHeader>
              <div>
                <S.SectionTitle>{t("new-arrivals-title")}</S.SectionTitle>
              </div>
            </S.SectionHeader>

            {loading ? (
              <S.ScrollRow>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <S.SkeletonCard key={idx}>
                    <S.SkeletonBlock height="220px" />
                    <div style={{ padding: 14 }}>
                      <S.SkeletonBlock height="14px" />
                    </div>
                  </S.SkeletonCard>
                ))}
              </S.ScrollRow>
            ) : (
              <S.ScrollRow>
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </S.ScrollRow>
            )}
          </S.Section>
        )}

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
