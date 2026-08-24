import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
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
import { Category, Product } from "@/API_Client/client/models";
import { ProductsControllerFindAllOrderEnum } from "@/API_Client/client/apis/products-api";
import { PaginatedResponseDto } from "@/API_Client/types";
import * as S from "./style";

const FEATURED_LIMIT = 8;
const NEW_ARRIVALS_LIMIT = 8;
const CATEGORIES_LIMIT = 6;
const HERO_AUTOPLAY_MS = 6000;

const BENEFITS = [
  { icon: BoxIcon, title: "სწრაფი მიწოდება", text: "შეკვეთის სწრაფი და საიმედო ტრანსპორტირება" },
  { icon: LockIcon, title: "უსაფრთხო გადახდა", text: "დაცული და დაშიფრული გადახდის პროცესი" },
  { icon: UndoIcon, title: "მარტივი დაბრუნება", text: "არ მოგეწონათ? მარტივად დააბრუნეთ" },
  { icon: ClipboardIcon, title: "მხარდაჭერა", text: "დაგვიკავშირდით ნებისმიერი კითხვისთვის" },
];

// ჰერო სლაიდერის მარცხნივ განთავსებული ფილტრის სტატიკური ჯგუფები — კატეგორიების
// ჯგუფი ქვემოთ დინამიურად ივსება რეალური კატეგორიების მონაცემით.
//
// კატეგორიის ბექენდის მოდელს (Category) parent/subcategory ველი არ აქვს, ამიტომ
// 3-დონიანი hover-ფლაუთისთვის (კატეგორია → ქვეკატეგორია → ქვე-ქვეკატეგორია)
// ქვედა ორი დონე პლეისჰოლდერული, ზოგადი დაზუსტების ბმულებია — ყველა ერთსა და
// იმავე კატეგორიაზე გადადის; რეალურ ქვეკატეგორიის მონაცემზე გადასვლისას საკმარისია
// ამ მასივების ჩანაცვლება ბექენდიდან წამოსული subcategory-ებით.
const SUBCATEGORY_TEMPLATE = ["ბესტსელერები", "ახალი ჩამოსული", "ფასდაკლებული"];
const SUBSUBCATEGORY_TEMPLATE = ["პოპულარული", "ტოპ შეფასებული", "იაფიდან ძვირისკენ"];

const POPULAR_FILTERS = [
  { label: "ახალი ჩამოსული", href: "/products?sort=createdAt&order=desc" },
  { label: "ფასდაკლებული", href: "/products?sort=sale" },
  { label: "ყველაზე პოპულარული", href: "/products?sort=popular" },
  { label: "ტოპ შეფასებული", href: "/products?sort=rating" },
];

// Hero Slider-ის სლაიდები — რეალურ პროდუქტის ფოტოებამდე თითოეულს აქვს საკუთარი
// გრადიენტი+ხატულა "ხელოვნური" ვიზუალი, სათაური, მოკლე ტექსტი და CTA ბმული.
const HERO_SLIDES = [
  {
    eyebrow: "ახალი კოლექცია",
    title: "ყოველდღიური სტილი, თანამედროვე ხარისხით",
    text: "დაათვალიერეთ ჩვენი პროდუქტების არჩევანი და შეუკვეთეთ სწრაფად და უსაფრთხოდ.",
    cta: "მაღაზიაში გადასვლა",
    href: "/products",
    gradientFrom: "#ebddc9",
    gradientTo: "#c9af87",
  },
  {
    eyebrow: "შეზღუდული დროით",
    title: "ფასდაკლებები 40%-მდე",
    text: "განაახლეთ თქვენი კოლექცია სეზონის ფავორიტებით საუკეთესო ფასად.",
    cta: "ფასდაკლებების ნახვა",
    href: "/products",
    gradientFrom: "#98a6d6",
    gradientTo: "#3b4e92",
  },
  {
    eyebrow: "ახალი ჩამოსული",
    title: "იპოვეთ ის, რაც გჭირდებათ",
    text: "ახალი პროდუქტები რეგულარულად ემატება ჩვენს კატალოგში.",
    cta: "ახლების ნახვა",
    href: "/products",
    gradientFrom: "#e3dccf",
    gradientTo: "#b7a98c",
  },
];

export const HomeComponent: React.FC = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSwiperRef = useRef<SwiperType | null>(null);

  // ჰერო-ს გვერდითი ფილტრის აკორდეონი — რომელი ჯგუფებია გაშლილი (0 — პოპულარული
  // ფილტრები). კატეგორიები ყოველთვის პირდაპირაა ჩამოწერილი, აკორდეონს არ საჭიროებს.
  const [openFilterSections, setOpenFilterSections] = useState<number[]>([0]);
  const toggleFilterSection = (idx: number) =>
    setOpenFilterSections((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, featuredRes, newArrivalsRes] = await Promise.all([
          CategoriesAPI(router.locale || "ka", "").categoryControllerFindAll(),
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

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Hero Slider — swiper-ით, 1 სლაიდი ერთ ხედში, ავტომატური გადართვით.
          მარცხნივ დამატებული "3 ჩაშლიანი" ფილტრის პანელი (კატეგორიები/ფასი/პოპულარული). */}
      <S.Hero>
        <S.HeroRow>
          <S.HeroFilterPanel>
            {/* ჯგუფი 1 — კატეგორიები (რეალური მონაცემი), ყოველთვის პირდაპირ
                ჩამოწერილი, აკორდეონის გარეშე. hover-ზე იშლება 3-დონიანი
                ქვეკატეგორია/ქვე-ქვეკატეგორიის ფლაუთი. */}
            <S.FilterSection>
              <S.FilterSectionLabel style={{ padding: "0px 18px 6px 18px" }}>
              </S.FilterSectionLabel>
              <S.FilterSectionBody>
                {categories.length === 0 ? (
                  <S.FilterEmpty>კატეგორიები ჯერ არ არის დამატებული</S.FilterEmpty>
                ) : (
                  categories.map((category) => (
                    <S.CategoryRow key={category.id}>
                      <Link href={`/products?category=${category.id}`} passHref legacyBehavior>
                        <S.CategoryFlyoutTrigger>
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <TagIcon size={16} />
                            {category.name}
                          </span>
                          <ChevronRightIcon size={14} />
                        </S.CategoryFlyoutTrigger>
                      </Link>

                      {/* დონე 2 — ქვეკატეგორია (placeholder) */}
                      <S.FlyoutPanel data-role="flyout">
                        {SUBCATEGORY_TEMPLATE.map((sub) => (
                          <S.SubcategoryRow key={sub}>
                            <Link href={`/products?category=${category.id}`} passHref legacyBehavior>
                              <S.CategoryFlyoutTrigger>
                                {sub}
                                <ChevronRightIcon size={13} />
                              </S.CategoryFlyoutTrigger>
                            </Link>

                            {/* დონე 3 — ქვე-ქვეკატეგორია (placeholder) */}
                            <S.FlyoutPanel data-role="flyout">
                              {SUBSUBCATEGORY_TEMPLATE.map((subsub) => (
                                <Link
                                  key={subsub}
                                  href={`/products?category=${category.id}`}
                                  passHref
                                  legacyBehavior
                                >
                                  <S.FilterItem>{subsub}</S.FilterItem>
                                </Link>
                              ))}
                            </S.FlyoutPanel>
                          </S.SubcategoryRow>
                        ))}
                      </S.FlyoutPanel>
                    </S.CategoryRow>
                  ))
                )}
              </S.FilterSectionBody>
            </S.FilterSection>
          </S.HeroFilterPanel>

          <S.HeroSliderArea>
            <Swiper
              modules={[Autoplay]}
              slidesPerView={1}
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
                    aria-label={`სლაიდი ${idx + 1}`}
                    onClick={() => heroSwiperRef.current?.slideToLoop(idx)}
                  />
                ))}
              </S.HeroDots>

              <S.HeroArrows>
                <S.HeroArrow
                  type="button"
                  aria-label="წინა სლაიდი"
                  onClick={() => heroSwiperRef.current?.slidePrev()}
                >
                  <ChevronLeftIcon size={16} />
                </S.HeroArrow>
                <S.HeroArrow
                  type="button"
                  aria-label="შემდეგი სლაიდი"
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
            <S.CategoryTitle>პოპულარული კატეგორიები</S.CategoryTitle>
          </S.CategoryHeader>

          {!loading && categories.length === 0 ? (
            <S.EmptyRow>კატეგორიები ჯერ არ არის დამატებული</S.EmptyRow>
          ) : (
            <S.CategoryGrid>
              {(loading ? Array.from({ length: CATEGORIES_LIMIT }) : categories).map((category: any, idx) => {
                const isActive = category && String(router.query.category) === String(category.id);
                return (
                  <Link
                    key={category?.id ?? idx}
                    href={category ? `/products?category=${category.id}` : "/products"}
                    passHref
                    legacyBehavior
                  >
                    <S.CategoryCard active={isActive}>
                      <S.CategoryIconBadge active={isActive}>
                        <TagIcon size={22} />
                      </S.CategoryIconBadge>
                      <S.CategoryName active={isActive}>{category?.name || ""}</S.CategoryName>
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
              <S.SectionTitle>გამორჩეული პროდუქტები</S.SectionTitle>
            </div>
            <Link href="/products" passHref legacyBehavior>
              <S.ViewAllLink>ყველას ნახვა →</S.ViewAllLink>
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
            <S.EmptyRow>პროდუქტები ჯერ არ არის დამატებული</S.EmptyRow>
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
              <S.PromoTitle>გაეცანით სრულ კატალოგს</S.PromoTitle>
              <S.PromoSubtitle>
                ახალი პროდუქტები რეგულარულად ემატება — ნუ გამოტოვებთ საინტერესო შემოთავაზებებს.
              </S.PromoSubtitle>
            </S.PromoText>
            <Link href="/products" passHref legacyBehavior>
              <S.PromoButton>დათვალიერება</S.PromoButton>
            </Link>
          </S.PromoBanner>
        </S.Section>

        {/* New arrivals */}
        {(loading || newArrivals.length > 0) && (
          <S.Section>
            <S.SectionHeader>
              <div>
                <S.SectionTitle>ახალი ჩამოსული</S.SectionTitle>
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
