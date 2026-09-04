import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import SimilarProductsSlider from "@/components/shared/SimilarProductsSlider";
import { ProductsAPI } from "@/API_Client";
import { Product, ProductAdditionalInfo, ProductAttributeValue, ProductColor } from "@/API_Client/types";
import { CartIcon, TagIcon, PlayIcon, CloseIcon, CheckCircleIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { useCart } from "@/context/Cart";
import { getCategoryName, getLocalizedDescription, getLocalizedValue } from "@/utils/getCategoryName";
import * as S from "./style";

const formatAttributeValue = (
  v: ProductAttributeValue,
  locale: string | undefined,
  t: (key: string) => string
) => {
  if (v.attributeOption) return getLocalizedValue(v.attributeOption, locale);
  if (v.valueBoolean !== undefined && v.valueBoolean !== null) return v.valueBoolean ? t("yes") : t("no");
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
  const { t } = useTranslation("product");
  const { cart, addItem, removeItem } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [attrValues, setAttrValues] = useState<ProductAttributeValue[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<ProductAdditionalInfo[]>([]);
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(undefined);
  const thumbsTrackRef = useRef<HTMLDivElement>(null);

  const productName = getCategoryName(product, router.locale);
  const productDescription = getLocalizedDescription(product, router.locale);
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

  // მარაგში მხოლოდ ის ფერები ჩნდება, რომლებსაც stock > 0 აქვთ.
  const availableColors = React.useMemo(
    () => productColors.filter((pc) => pc.stock > 0),
    [productColors]
  );
  const selectedColor = availableColors.find((pc) => pc.colorId === selectedColorId);

  // ხელმისაწვდომი ფერების მასივში პირველი ფერი ავტომატურად აირჩევა.
  useEffect(() => {
    if (availableColors.length > 0) {
      setSelectedColorId(availableColors[0].colorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productColors]);

  // თუ პროდუქტს ფერები აქვს მიბმული, მარაგი კონკრეტული არჩეული ფერის
  // stock-ის მიხედვით დგინდება — არჩევამდე კი დამატება არ დაიშვება.
  const outOfStock = availableColors.length > 0 ? !selectedColor || selectedColor.stock <= 0 : product.stock <= 0;

  useEffect(() => {
    ProductsAPI(router.locale || "ka", "")
      .productsControllerGetAttributeValues(String(product.id))
      .then((res) => setAttrValues((res.data as unknown as ProductAttributeValue[]) || []))
      .catch(() => {
        // spec-ცხრილი დამატებითია — ჩუმად ვტოვებთ, ძირითადი გვერდი მაინც ჩაირთვება
      });

    ProductsAPI(router.locale || "ka", "")
      .productsControllerGetAdditionalInfo(String(product.id))
      .then((res) => setAdditionalInfo((res.data as unknown as ProductAdditionalInfo[]) || []))
      .catch(() => {
        // დამატებითი ინფორმაციის ბლოკიც არასავალდებულოა — ჩუმად ვტოვებთ
      });

    ProductsAPI(router.locale || "ka", "")
      .productsControllerGetColors(String(product.id))
      .then((res) => setProductColors((res.data as unknown as ProductColor[]) || []))
      .catch(() => {
        // ფერების ბლოკიც არასავალდებულოა — ჩუმად ვტოვებთ
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
      const value = formatAttributeValue(v, router.locale, t);
      if (!value) continue;
      if (existing) {
        existing.values.push(value);
      } else {
        byAttribute.set(key, { name: getCategoryName(v.attribute, router.locale), values: [value] });
      }
    }
    const rows = Array.from(byAttribute.values());
    // ფიზიკური პარამეტრები (წონა/სიგრძე/სიგანე) — ბექენდიდან მოდის, სპეც-ცხრილში
    // ჩნდება მხოლოდ თუ პროდუქტისთვის შევსებულია.
    if (product.weight != null && product.weight !== "") {
      rows.push({ name: t("weight"), values: [`${product.weight} ${t("kg-unit")}`] });
    }
    if (product.length != null && product.length !== "") {
      rows.push({ name: t("length"), values: [`${product.length} ${t("cm-unit")}`] });
    }
    if (product.width != null && product.width !== "") {
      rows.push({ name: t("width"), values: [`${product.width} ${t("cm-unit")}`] });
    }
    return rows;
  }, [attrValues, router.locale, product.weight, product.length, product.width, t]);

  // თუ პროდუქტი უკვე კალათაშია — ღილაკზე დაჭერით ვშლით, თუ არადა ვამატებთ.
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  // ფერის არჩევა სავალდებულოა, თუ პროდუქტს მარაგში მყოფი ფერები აქვს მიბმული.
  const colorSelectionRequired = availableColors.length > 0 && !selectedColorId;

  const handleAddToCart = () => {
    if (cartItem) {
      removeItem(cartItem.id);
    } else {
      addItem(product.id, 1, selectedColorId);
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
                    alt={t("youtube-video-alt")}
                  />
                  <S.PlayBadge>
                    <PlayIcon size={56} />
                  </S.PlayBadge>
                </>
              ) : activeImage ? (
                <img src={activeImage} alt={productName} />
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
                            alt={t("youtube-video-alt")}
                          />
                          <S.PlayBadge>
                            <PlayIcon size={22} />
                          </S.PlayBadge>
                        </>
                      ) : (
                        <img src={resolveImage(slide.src)} alt={`${productName} ${idx + 1}`} />
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
            <S.Title>{productName}</S.Title>
            <S.Price>{Number(product.price).toFixed(2)} ₾</S.Price>
            <S.StockLine out={outOfStock && availableColors.length === 0}>
              {availableColors.length > 0 ? (
                  <>
                    <CheckCircleIcon size={16} /> {t("in-stock")}
                  </>
              ) : outOfStock ? (
                 <>
                    <CloseIcon className="close-icon" size={16} /> {t("out-of-stock")}
                  </>
              ) : (
                  <>
                    <CheckCircleIcon size={16} /> {t("in-stock")}
                  </>
              )}
            </S.StockLine>
            {productDescription && <S.Description>{productDescription}</S.Description>}
            {availableColors.length > 0 && (
              <S.ColorSection>
                <S.ColorSectionLabel>{t("color-label")}</S.ColorSectionLabel>
                <S.ColorOptions>
                  {availableColors.map((pc) => (
                    <S.ColorOption
                      key={pc.colorId}
                      type="button"
                      active={pc.colorId === selectedColorId}
                      title={pc.color ? getCategoryName(pc.color, router.locale) : undefined}
                      style={{ backgroundColor: pc.color?.hexCode || "#ccc" }}
                      onClick={() => setSelectedColorId(pc.colorId)}
                    />
                  ))}
                </S.ColorOptions>
              </S.ColorSection>
            )}
             <S.AddToCartButton
              type="button"
              disabled={(outOfStock || colorSelectionRequired) && !isInCart}
              onClick={handleAddToCart}
            >
              <CartIcon size={18} />{" "}
              {isInCart
                ? t("remove-from-cart")
                : colorSelectionRequired
                ? t("select-color")
                : outOfStock
                ? t("out-of-stock")
                : t("add-to-cart")}
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

        {additionalInfo.length > 0 && (
          <S.AdditionalInfoSection>
            {additionalInfo
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((info) => (
                <S.AdditionalInfoBlock key={info.id}>
                  <S.AdditionalInfoTitle>{info.title}</S.AdditionalInfoTitle>
                  <S.AdditionalInfoDescription
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(info.description) }}
                  />
                </S.AdditionalInfoBlock>
              ))}
          </S.AdditionalInfoSection>
        )}
        <SimilarProductsSlider productId={product.id} />
      </S.Container>

      <Footer />

      {lightboxOpen && activeSlide && (
        <S.LightboxOverlay onClick={() => setLightboxOpen(false)}>
          <S.LightboxClose type="button" onClick={() => setLightboxOpen(false)}>
            <CloseIcon className="close-icon" size={34} />
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
                title={t("product-video-title")}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={resolveImage(activeSlide.src)} alt={productName} />
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
                        alt={t("youtube-video-alt")}
                      />
                      <S.PlayBadge>
                        <PlayIcon size={22} />
                      </S.PlayBadge>
                    </>
                  ) : (
                    <img src={resolveImage(slide.src)} alt={`${productName} ${idx + 1}`} />
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
