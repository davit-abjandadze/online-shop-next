import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Swiper as SwiperType } from "swiper";
import "swiper/css";
import { ProductSlidersAPI } from "@/API_Client";
import { ResolvedProductSlider } from "@/API_Client/types";
import ProductCard from "@/components/shared/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

interface ProductSliderBlockProps {
  /** ბლოკის უნიკალური key, ადმინ დეშბორდში (/dashboard/product-sliders) მინიჭებული —
   * `GET /product-sliders/key/:key`-ით იტვირთება. */
  keyName: string;
  /** სქელეტონის ბარათების რაოდენობა ჩატვირთვისას (ნაგულისხმევი — 4). */
  skeletonCount?: number;
}

/**
 * ნებისმიერ გვერდზე ჩასაშენებელი "სათაური + პროდუქტების სლაიდერი" ბლოკი —
 * ბლოკის კონტენტი (სათაური/"ყველას ნახვა"/პროდუქტები) მთლიანად ადმინ
 * დეშბორდიდან იმართება (/dashboard/product-sliders), ამ კომპონენტს მხოლოდ
 * `keyName` სჭირდება. თუ ბლოკი key-ით არ არსებობს, არააქტიურია, ან
 * პროდუქტები არ აქვს მიბმული — კომპონენტი საერთოდ არაფერს რენდერავს (home.tsx-ის
 * hero სლაიდერის იგივე "დამალვის" პატერნი).
 *
 * პროდუქტების სია swiper სლაიდერითაა (მუდმივი სქროლის ნაცვლად) — ნავიგაციის
 * ისრები "ყველას ნახვა" ღილაკის გვერდით, სექციის სათაურშივეა (იხ. home.tsx-ის
 * hero სლაიდერის HeroArrow/HeroArrows იგივე ვიზუალური პატერნი, S.SliderNavButton).
 */
export const ProductSliderBlock: React.FC<ProductSliderBlockProps> = ({ keyName, skeletonCount = 4 }) => {
  const router = useRouter();
  const [slider, setSlider] = useState<ResolvedProductSlider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ProductSlidersAPI(router.locale || "ka", "")
      .productSlidersControllerFindActiveByKey(keyName)
      .then((res) => {
        if (!cancelled) setSlider(res.data as unknown as ResolvedProductSlider);
      })
      .catch(() => {
        // ბლოკი key-ით ვერ მოიძებნა (404) ან არააქტიურია — უბრალოდ არ გამოჩნდება.
        if (!cancelled) setSlider(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [keyName, router.locale]);

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

  if (!slider || slider.products.length === 0) {
    return null;
  }

  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>{slider.title}</S.SectionTitle>
        <S.SectionHeaderActions>
          {slider.products.length > 1 && (
            <S.SliderNav>
              <S.SliderNavButton ref={prevRef} type="button" aria-label="წინა" disabled={isBeginning}>
                <ChevronLeftIcon size={16} />
              </S.SliderNavButton>
              <S.SliderNavButton ref={nextRef} type="button" aria-label="შემდეგი" disabled={isEnd}>
                <ChevronRightIcon size={16} />
              </S.SliderNavButton>
            </S.SliderNav>
          )}
          {slider.viewAllLink && (
            <Link href={slider.viewAllLink} passHref legacyBehavior>
              <S.ViewAllLink>{slider.viewAllText || "ყველას ნახვა"}</S.ViewAllLink>
            </Link>
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
          {slider.products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </S.ScrollRow>
    </S.Section>
  );
};

export default ProductSliderBlock;
