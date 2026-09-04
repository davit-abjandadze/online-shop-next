import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Swiper as SwiperType } from "swiper";
import "swiper/css";
import { ProductsAPI } from "@/API_Client";
import { Product } from "@/API_Client/types";
import ProductCard from "@/components/shared/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/RefIcons";
// ვიზუალურად იდენტურია ადმინიდან მართული ProductSliderBlock-ისა — იგივე
// სტილების ფაილს ვიყენებთ დუბლირების გარეშე (Section/SectionHeader/
// SliderNav/ScrollRow/სქელეტონები).
import * as S from "@/components/shared/ProductSliderBlock/style";

interface SimilarProductsSliderProps {
  /** მიმდინარე პროდუქტის id — `GET /products/:id/similar`-ისთვის. */
  productId: number | string;
  skeletonCount?: number;
}

/**
 * "მსგავსი პროდუქტების" სლაიდერი პროდუქტის დეტალების გვერდზე — იმავე
 * კატეგორიის აქტიური პროდუქტები, საწყისის გამოკლებით (იხ.
 * ProductsService.findSimilar, online-shop-nest/src/products/products.service.ts).
 * თუ პროდუქტს კატეგორია არ აქვს ან მსგავსი პროდუქტი ვერ მოიძებნა — კომპონენტი
 * საერთოდ არაფერს რენდერავს (ProductSliderBlock-ის იგივე "დამალვის" პატერნი).
 */
export const SimilarProductsSlider: React.FC<SimilarProductsSliderProps> = ({ productId, skeletonCount = 4 }) => {
  const router = useRouter();
  const { t } = useTranslation("product");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ProductsAPI(router.locale || "ka", "")
      .productsControllerFindSimilar(String(productId), { limit: 8 })
      .then((res) => {
        if (!cancelled) setProducts((res.data as unknown as Product[]) || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, router.locale]);

  if (loading) {
    return (
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle>&nbsp;</S.SectionTitle>
        </S.SectionHeader>
        <S.SkeletonRow>
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <S.SkeletonCard key={idx}>
              <S.SkeletonBlock height="220px" />
              <div style={{ padding: 14 }}>
                <S.SkeletonBlock height="14px" />
              </div>
            </S.SkeletonCard>
          ))}
        </S.SkeletonRow>
      </S.Section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>{t("similar-products-title")}</S.SectionTitle>
        <S.SectionHeaderActions>
          {products.length > 1 && (
            <S.SliderNav>
              <S.SliderNavButton ref={prevRef} type="button" aria-label="წინა" disabled={isBeginning}>
                <ChevronLeftIcon size={16} />
              </S.SliderNavButton>
              <S.SliderNavButton ref={nextRef} type="button" aria-label="შემდეგი" disabled={isEnd}>
                <ChevronRightIcon size={16} />
              </S.SliderNavButton>
            </S.SliderNav>
          )}
        </S.SectionHeaderActions>
      </S.SectionHeader>
      <S.ScrollRow>
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={20}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          onBeforeInit={(swiper) => {
            // @ts-expect-error - swiper-ის ტიპები navigation-ს optional-ად აღიქვამს
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-expect-error - swiper-ის ტიპები navigation-ს optional-ად აღიქვამს
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </S.ScrollRow>
    </S.Section>
  );
};

export default SimilarProductsSlider;
