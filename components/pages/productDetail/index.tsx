import React, { useState } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { Product } from "@/API_Client/client/models";
import { CartIcon, TagIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useCart } from "@/context/Cart";
import * as S from "./style";

interface ProductDetailProps {
  product: Product;
}

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// პროდუქტის დეტალური გვერდი.
export const ProductDetailComponent: React.FC<ProductDetailProps> = ({ product }) => {
  const { addItem } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImage = resolveImage(images[activeImageIdx]);
  const outOfStock = product.stock <= 0;

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
                <TagIcon size={14} /> {product.category.name}
              </S.CategoryLabel>
            )}
            <S.Title>{product.name}</S.Title>
            <S.Price>{Number(product.price).toFixed(2)} ₾</S.Price>
            <S.StockLine out={outOfStock}>
              {outOfStock ? "ამოწურულია" : `მარაგშია: ${product.stock} ცალი`}
            </S.StockLine>
            {product.description && <S.Description>{product.description}</S.Description>}
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
