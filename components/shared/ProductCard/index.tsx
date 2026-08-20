import React from "react";
import Link from "next/link";
import { Product } from "@/API_Client/client/models";
import { CartIcon, TagIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useCart } from "@/context/Cart";
import * as S from "./style";

export interface ProductCardProps {
  product: Product;
}

// კატალოგის/კატეგორიის გვერდზე ერთი პროდუქტის ბარათი — ბმული პროდუქტის
// დეტალურ გვერდზე. "კალათაში დამატება" აქ Phase 2-ში დაემატება (CartContext
// მანამდე არ არსებობს), ამჟამად მხოლოდ დათვალიერების ბარათია.
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const image = product.images?.[0];
  const imageSrc = image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;
  const outOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1);
  };

  return (
    <Link href={`/products/${product.id}`} passHref legacyBehavior>
      <S.Card>
        <S.ImageWrap>
          {imageSrc ? <img src={imageSrc} alt={product.name} loading="lazy" /> : <TagIcon size={40} />}
          {outOfStock && <S.StockBadge out>ამოწურულია</S.StockBadge>}
        </S.ImageWrap>
        <S.Body>
          {product.category && (
            <S.CategoryLabel>
              <TagIcon size={12} /> {product.category.name}
            </S.CategoryLabel>
          )}
          <S.Name>{product.name}</S.Name>
          <S.Footer>
            <S.Price>{Number(product.price).toFixed(2)} ₾</S.Price>
            <S.AddButton type="button" disabled={outOfStock} onClick={handleAddToCart}>
              <CartIcon size={14} /> დამატება
            </S.AddButton>
          </S.Footer>
        </S.Body>
      </S.Card>
    </Link>
  );
};

export default ProductCard;
