import React from "react";
import Link from "next/link";
import { Product } from "@/API_Client/client/models";
import { CartIcon, HeartIcon, StarIcon, TagIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useCart } from "@/context/Cart";
import { useWishlist } from "@/context/Wishlist";
import * as S from "./style";

export interface ProductCardProps {
  product: Product;
}

// 0-დან 1-მდე დეტერმინისტული "შემთხვევითი" რიცხვი პროდუქტის id-დან — იგივე
// პროდუქტს ყოველთვის იგივე rating/ფასდაკლება რომ ჰქონდეს, გვერდის ხელახლა
// ჩატვირთვისას რომ არ იცვლებოდეს.
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// TODO: rating/reviewsCount/oldPrice ბექენდის Product მოდელს ჯერ არ აქვს —
// სანამ ეს ველები API-დან არ მოვა, დიზაინის მოთხოვნით ვაჩვენებთ
// დეტერმინისტულ placeholder მონაცემებს (იხ. product.id-ზე დამოკიდებული seed).
const getDisplayStats = (product: Product) => {
  const rating = (4.5 + seededRandom(product.id * 7 + 1) * 0.5).toFixed(1);
  const reviews = 40 + Math.floor(seededRandom(product.id * 13 + 2) * 500);
  const hasDiscount = seededRandom(product.id * 17 + 3) < 0.35;
  const discountPercent = [10, 15, 20, 25][Math.floor(seededRandom(product.id * 19 + 4) * 4)];
  const price = Number(product.price);
  const oldPrice = hasDiscount ? price / (1 - discountPercent / 100) : null;
  return { rating, reviews, discountPercent, oldPrice };
};

// კატალოგის/მთავარი გვერდის პროდუქტის ბარათი — ბმული პროდუქტის დეტალურ
// გვერდზე. Wishlist და "კალათაში დამატება" ღილაკები ბმულის default
// ნავიგაციას აჩერებენ (preventDefault/stopPropagation).
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addItem, removeItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const image = product.images?.[0];
  const imageSrc = image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;
  const outOfStock = product.stock <= 0;
  const saved = isSaved(product.id);
  const { rating, reviews, discountPercent, oldPrice } = getDisplayStats(product);

  // თუ პროდუქტი უკვე კალათაშია — ღილაკზე დაჭერით ვშლით, თუ არადა ვამატებთ.
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      removeItem(cartItem.id);
    } else {
      addItem(product.id, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link href={`/products/${product.id}`} passHref legacyBehavior>
      <S.Card out={outOfStock}>
        <S.ImageWrap>
          {imageSrc ? <img src={imageSrc} alt={product.name} loading="lazy" /> : <TagIcon size={40} />}
          {oldPrice && <S.DiscountBadge>-{discountPercent}%</S.DiscountBadge>}
          <S.WishlistToggle
            type="button"
            aria-label={saved ? "სასურველებიდან წაშლა" : "სასურველებში დამატება"}
            active={saved}
            onClick={handleToggleWishlist}
          >
            <HeartIcon size={16} filled={saved} />
          </S.WishlistToggle>
        </S.ImageWrap>
        <S.Body>
          <S.Name>{product.name}</S.Name>
         
          <S.Footer>
            <S.PriceGroup>
              <S.Price>{Number(product.price).toFixed(2)} ₾</S.Price>
              {oldPrice && <S.OldPrice>{oldPrice.toFixed(2)} ₾</S.OldPrice>}
            </S.PriceGroup>
            <S.AddButton
              type="button"
              aria-label={isInCart ? "წაშლა კალათიდან" : "კალათაში დამატება"}
              active={isInCart}
              disabled={outOfStock && !isInCart}
              onClick={handleAddToCart}
            >
              <CartIcon size={16} />
              <S.AddButtonLabel active={isInCart}>წაშლა</S.AddButtonLabel>
            </S.AddButton>
          </S.Footer>
        </S.Body>
      </S.Card>
    </Link>
  );
};

export default ProductCard;
