import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { ProductsAPI } from "@/API_Client";
import { Product } from "@/API_Client/client/models";
import { ProductAttributeValue } from "@/API_Client/types";
import { CartIcon, TagIcon } from "@/components/ui/RefIcons";
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

// პროდუქტის დეტალური გვერდი.
export const ProductDetailComponent: React.FC<ProductDetailProps> = ({ product }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [attrValues, setAttrValues] = useState<ProductAttributeValue[]>([]);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImage = resolveImage(images[activeImageIdx]);
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

  const handleAddToCart = () => {
    addItem(product.id, 1);
  };

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.Layout>
          <S.Gallery>
            <S.MainImage>
              {activeImage ? <img src={activeImage} alt={product.name} /> : <TagIcon size={64} />}
            </S.MainImage>
            {images.length > 1 && (
              <S.Thumbnails>
                {images.map((img, idx) => (
                  <S.Thumbnail key={img + idx} active={idx === activeImageIdx} onClick={() => setActiveImageIdx(idx)}>
                    <img src={resolveImage(img)} alt={`${product.name} ${idx + 1}`} />
                  </S.Thumbnail>
                ))}
              </S.Thumbnails>
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
            <S.AddToCartButton type="button" disabled={outOfStock} onClick={handleAddToCart}>
              <CartIcon size={18} /> {outOfStock ? "ამოწურულია" : "კალათაში დამატება"}
            </S.AddToCartButton>
          </S.Info>
        </S.Layout>
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default ProductDetailComponent;
