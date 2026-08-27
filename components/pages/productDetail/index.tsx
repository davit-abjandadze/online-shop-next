import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { ProductsAPI } from "@/API_Client";
import { Product } from "@/API_Client/client/models";
import { ProductAttributeValue } from "@/API_Client/types";
import { CartIcon, TagIcon, PlayIcon, CloseIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useCart } from "@/context/Cart";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

const getAttributeName = (attr: { nameKa: string; nameEn: string }, locale?: string) =>
  locale === "en" ? attr.nameEn || attr.nameKa : attr.nameKa || attr.nameEn;

// AttributeOption-ს `nameKa`/`nameEn` არა, `valueKa`/`valueEn` აქვს.
const getOptionValue = (opt: { valueKa: string; valueEn: string }, locale?: string) =>
  locale === "en" ? opt.valueEn || opt.valueKa : opt.valueKa || opt.valueEn;

const formatAttributeValue = (v: ProductAttributeValue, locale?: string) => {
  if (v.attributeOption) return getOptionValue(v.attributeOption, locale);
  if (v.valueBoolean !== undefined && v.valueBoolean !== null) return v.valueBoolean ? "კი" : "არა";
  if (v.valueNumber !== undefined && v.valueNumber !== null) {
    return v.attribute?.unit ? `${v.valueNumber} ${v.attribute.unit}` : String(v.valueNumber);
  }
  return v.valueText ?? "";
};

interface ProductDetailProps {
  product: Product;
}

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// YouTube-ის სხვადასხვა ფორმატის ლინკიდან (watch?v=, youtu.be/, /embed/) video ID-ის ამოღება.
const getYoutubeId = (url?: string): string | undefined => {
  if (!url) return undefined;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1];
};

type Slide = { type: "image"; src?: string } | { type: "video"; videoId: string };

// პროდუქტის დეტალური გვერდი.
export const ProductDetailComponent: React.FC<ProductDetailProps> = ({ product }) => {
  const router = useRouter();
  const { cart, addItem, removeItem } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [attrValues, setAttrValues] = useState<ProductAttributeValue[]>([]);
  const thumbsTrackRef = useRef<HTMLDivElement>(null);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const youtubeId = getYoutubeId(product.videoUrl);

  // youtube ვიდეო, თუ არსებობს, ყოველთვის სლაიდერისა და გალერეის ბოლოშია.
  const slides: Slide[] = React.useMemo(() => {
    const items: Slide[] = images.map((img) => ({ type: "image", src: img }));
    if (youtubeId) items.push({ type: "video", videoId: youtubeId });
    return items;
  }, [images, youtubeId]);

  const activeSlide = slides[activeImageIdx];
  const activeImage = activeSlide?.type === "image" ? resolveImage(activeSlide.src) : undefined;
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    ProductsAPI(router.locale || "ka", "")
      .productsControllerGetAttributeValues(String(product.id))
      .then((res) => setAttrValues((res.data as unknown as ProductAttributeValue[]) || []))
      .catch(() => {
        // spec-ცხრილი დამატებითია — ჩუმად ვტოვებთ, ძირითადი გვერდი მაინც ჩაირთვება
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, router.locale]);

  // ლაითბოქსის კლავიატურით მართვა: Escape — დახურვა, ისრები — წინა/შემდეგი სლაიდი.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setActiveImageIdx((idx) => (idx - 1 + slides.length) % slides.length);
      }
      if (e.key === "ArrowRight") {
        setActiveImageIdx((idx) => (idx + 1) % slides.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, slides.length]);

  const scrollThumbnails = (dir: 1 | -1) => {
    thumbsTrackRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

  // multi_select-ს ერთ attribute-ზე რამდენიმე row აქვს (თითო option-ზე ერთი) —
  // attributeId-ის მიხედვით ჯავშნით ერთ spec-row-ად ვაერთიანებთ.
  const specRows = React.useMemo(() => {
    const byAttribute = new Map<string, { name: string; values: string[] }>();
    for (const v of attrValues) {
      if (!v.attribute) continue;
      const key = v.attributeId;
      const existing = byAttribute.get(key);
      const value = formatAttributeValue(v, router.locale);
      if (!value) continue;
      if (existing) {
        existing.values.push(value);
      } else {
        byAttribute.set(key, { name: getAttributeName(v.attribute, router.locale), values: [value] });
      }
    }
    return Array.from(byAttribute.values());
  }, [attrValues, router.locale]);

  // თუ პროდუქტი უკვე კალათაშია — ღილაკზე დაჭერით ვშლით, თუ არადა ვამატებთ.
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const handleAddToCart = () => {
    if (cartItem) {
      removeItem(cartItem.id);
    } else {
      addItem(product.id, 1);
    }
  };

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.Layout>
          <S.Gallery>
            <S.MainImage
              clickable={slides.length > 0}
              onClick={() => slides.length > 0 && setLightboxOpen(true)}
            >
              {activeSlide?.type === "video" ? (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${activeSlide.videoId}/hqdefault.jpg`}
                    alt="YouTube ვიდეო"
                  />
                  <S.PlayBadge>
                    <PlayIcon size={56} />
                  </S.PlayBadge>
                </>
              ) : activeImage ? (
                <img src={activeImage} alt={product.name} />
              ) : (
                <TagIcon size={64} />
              )}
            </S.MainImage>
            {slides.length > 1 && (
              <S.ThumbnailsWrap>
                <S.ThumbnailsNavBtn type="button" onClick={() => scrollThumbnails(-1)}>
                  ‹
                </S.ThumbnailsNavBtn>
                <S.Thumbnails ref={thumbsTrackRef}>
                  {slides.map((slide, idx) => (
                    <S.Thumbnail
                      key={slide.type === "video" ? `video-${slide.videoId}` : `${slide.src}-${idx}`}
                      active={idx === activeImageIdx}
                      onClick={(e) => {
                        setActiveImageIdx(idx);
                        e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                      }}
                    >
                      {slide.type === "video" ? (
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${slide.videoId}/default.jpg`}
                            alt="YouTube ვიდეო"
                          />
                          <S.PlayBadge>
                            <PlayIcon size={22} />
                          </S.PlayBadge>
                        </>
                      ) : (
                        <img src={resolveImage(slide.src)} alt={`${product.name} ${idx + 1}`} />
                      )}
                    </S.Thumbnail>
                  ))}
                </S.Thumbnails>
                <S.ThumbnailsNavBtn type="button" onClick={() => scrollThumbnails(1)}>
                  ›
                </S.ThumbnailsNavBtn>
              </S.ThumbnailsWrap>
            )}
          </S.Gallery>

          <S.Info>
            {product.category && (
              <S.CategoryLabel>
                <TagIcon size={14} /> {getCategoryName(product.category, router.locale)}
              </S.CategoryLabel>
            )}
            <S.Title>{product.name}</S.Title>
            <S.Price>{Number(product.price).toFixed(2)} ₾</S.Price>
            <S.StockLine out={outOfStock}>
              {outOfStock ? "ამოწურულია" : `მარაგშია: ${product.stock} ცალი`}
            </S.StockLine>
            {product.description && <S.Description>{product.description}</S.Description>}
             <S.AddToCartButton
              type="button"
              disabled={outOfStock && !isInCart}
              onClick={handleAddToCart}
            >
              <CartIcon size={18} />{" "}
              {outOfStock && !isInCart ? "ამოწურულია" : isInCart ? "წაშლა კალათიდან" : "კალათაში დამატება"}
            </S.AddToCartButton>
            {specRows.length > 0 && (
              <S.SpecTable>
                {specRows.map((row) => (
                  <React.Fragment key={row.name}>
                    <S.SpecLabel>{row.name}</S.SpecLabel>
                    <S.SpecValue>{row.values.join(", ")}</S.SpecValue>
                  </React.Fragment>
                ))}
              </S.SpecTable>
            )}
           
          </S.Info>
        </S.Layout>
      </S.Container>

      <Footer />

      {lightboxOpen && activeSlide && (
        <S.LightboxOverlay onClick={() => setLightboxOpen(false)}>
          <S.LightboxClose type="button" onClick={() => setLightboxOpen(false)}>
            <CloseIcon size={28} />
          </S.LightboxClose>
          {slides.length > 1 && (
            <S.LightboxNav
              side="left"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx((idx) => (idx - 1 + slides.length) % slides.length);
              }}
            >
              ‹
            </S.LightboxNav>
          )}
          <S.LightboxContent onClick={(e) => e.stopPropagation()}>
            {activeSlide.type === "video" ? (
              <iframe
                key={activeSlide.videoId}
                src={`https://www.youtube.com/embed/${activeSlide.videoId}?autoplay=1`}
                title="product video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={resolveImage(activeSlide.src)} alt={product.name} />
            )}
          </S.LightboxContent>
          {slides.length > 1 && (
            <S.LightboxNav
              side="right"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx((idx) => (idx + 1) % slides.length);
              }}
            >
              ›
            </S.LightboxNav>
          )}
          {slides.length > 1 && (
            <S.LightboxThumbnails onClick={(e) => e.stopPropagation()}>
              {slides.map((slide, idx) => (
                <S.Thumbnail
                  key={slide.type === "video" ? `lb-video-${slide.videoId}` : `lb-${slide.src}-${idx}`}
                  active={idx === activeImageIdx}
                  onClick={(e) => {
                    setActiveImageIdx(idx);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                >
                  {slide.type === "video" ? (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${slide.videoId}/default.jpg`}
                        alt="YouTube ვიდეო"
                      />
                      <S.PlayBadge>
                        <PlayIcon size={22} />
                      </S.PlayBadge>
                    </>
                  ) : (
                    <img src={resolveImage(slide.src)} alt={`${product.name} ${idx + 1}`} />
                  )}
                </S.Thumbnail>
              ))}
            </S.LightboxThumbnails>
          )}
        </S.LightboxOverlay>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default ProductDetailComponent;
