import React, { useRef, useState } from "react";
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
import { CDN_URL } from "@/constants";
import { productPath } from "@/utils/seo";
import { HomeData, POPULAR_SLIDER_KEY } from "./data";
import * as S from "./style";

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

interface HomeComponentProps {
  // getServerSideProps-იდან (pages/index.tsx) — სერვერზე ჩატვირთული, რომ
  // პროდუქტები/სლაიდები HTML-ში იყოს. ლოკალის შეცვლა ახალ gSSP-ს იწვევს,
  // ამიტომ კლიენტზე ცალკე ხელახლა ჩატვირთვა აღარ სჭირდება.
  data: HomeData;
}

export const HomeComponent: React.FC<HomeComponentProps> = ({ data }) => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("common");

  const BENEFITS = BENEFITS_CONFIG.map(({ key, icon }) => ({
    icon,
    title: t(`benefit-${key}-title`),
    text: t(`benefit-${key}-text`),
  }));

  const { featured, heroSlides, popularSlider } = data;
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSwiperRef = useRef<SwiperType | null>(null);

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />
      <S.VisuallyHiddenH1>{`${tc("default-page-title")} — ${tc("page-description")}`}</S.VisuallyHiddenH1>

      {/* კატეგორიების დროპდაუნ-ზოლი ჰედერშივეა ჩაშენებული (იხ.
          components/shared/Header) — მთავარ გვერდზე ცალკე აღარ დუბლირდება. */}

      {/* Hero Slider — swiper-ით, 1 სლაიდი ერთ ხედში, ავტომატური გადართვით.
          სლაიდები ადმინ დეშბორდიდან მოდის (/dashboard/hero-slides), საჯარო
          /hero-slides endpoint-იდან (იხ. heroSlides fetch ზემოთ) — თუ სლაიდი
          არცერთი არაა კონფიგურირებული, სექცია საერთოდ არ ჩნდება. */}
      {heroSlides.length > 0 && (
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
                  const href = slide.buttonLink || (slide.product ? productPath(slide.product) : "/products");
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
        <ProductSliderBlock keyName={POPULAR_SLIDER_KEY} initialSlider={popularSlider} />

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

          {featured.length === 0 ? (
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
