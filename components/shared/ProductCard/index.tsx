import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { ProductsAPI } from "@/API_Client";
import { Product, ProductColor } from "@/API_Client/types";
import { CartIcon, HeartIcon, StarIcon, TagIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useCart } from "@/context/Cart";
import { useWishlist } from "@/context/Wishlist";
import { getCategoryName } from "@/utils/getCategoryName";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import * as S from "./style";

export interface ProductCardProps {
  product: Product;
}

// 0-დან 1-მდე დეტერმინისტული "შემთხვევითი" რიცხვი პროდუქტის id-დან — იგივე
// პროდუქტს ყოველთვის იგივე rating ჰქონდეს, გვერდის ხელახლა ჩატვირთვისას
// რომ არ იცვლებოდეს.
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// TODO: rating/reviewsCount ბექენდის Product მოდელს ჯერ არ აქვს — სანამ ეს
// ველები API-დან არ მოვა, დიზაინის მოთხოვნით ვაჩვენებთ დეტერმინისტულ
// placeholder მონაცემებს (იხ. product.id-ზე დამოკიდებული seed). ფასდაკლება
// კი უკვე რეალურია — `product.discountPercent`-იდან, `getDiscountedPrice`-ით.
const getDisplayStats = (product: Product) => {
  const rating = (4.5 + seededRandom(product.id * 7 + 1) * 0.5).toFixed(1);
  const reviews = 40 + Math.floor(seededRandom(product.id * 13 + 2) * 500);
  return { rating, reviews };
};

// კატალოგის/მთავარი გვერდის პროდუქტის ბარათი — ბმული პროდუქტის დეტალურ
// გვერდზე. Wishlist და "კალათაში დამატება" ღილაკები ბმულის default
// ნავიგაციას აჩერებენ (preventDefault/stopPropagation).
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { t } = useTranslation("catalog");
  const { cart, addItem, removeItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const productName = getCategoryName(product, router.locale);
  const image = product.images?.[0];
  const imageSrc = image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;
  const outOfStock = product.stock <= 0;
  const saved = isSaved(product.id);
  const { rating, reviews } = getDisplayStats(product);
  const { price: displayPrice, originalPrice: oldPrice, discountPercent } = getDiscountedPrice(product);

  // ფერების ჩამონათვალი მარაგთან ერთად — ბარათზე ბეიჯისთვის და "კალათაში
  // დამატების" ავტომატური ფერის შერჩევისთვის ორივესთვის ერთი და იგივე
  // მოთხოვნა გვჭირდება, ამიტომ ერთხელ, mount-ზე ვტვირთავთ.
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const colorsInStock = productColors.filter((pc) => pc.stock > 0);

  useEffect(() => {
    let cancelled = false;
    ProductsAPI(router.locale || "ka", "")
      .productsControllerGetColors(String(product.id))
      .then((res) => {
        if (!cancelled) setProductColors((res.data as unknown as ProductColor[]) || []);
      })
      .catch(() => {
        // ფერების წამოღება ვერ მოხერხდა — ბეიჯი უბრალოდ არ გამოჩნდება
      });
    return () => {
      cancelled = true;
    };
  }, [product.id, router.locale]);

  // თუ პროდუქტი უკვე კალათაშია — ღილაკზე დაჭერით ვშლით, თუ არადა ვამატებთ.
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      removeItem(cartItem.id);
      return;
    }

    // თუ პროდუქტს ფერები აქვს მიბმული, ბექენდი ფერის მითითებას ითხოვს —
    // ბარათიდან პირდაპირი დამატებისას მასივში პირველი ხელმისაწვდომი ფერი
    // ავტომატურად იგულისხმება მონიშნულად.
    addItem(product.id, 1, colorsInStock[0]?.colorId);
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
          {imageSrc ? <img src={imageSrc} alt={productName} loading="lazy" /> : <TagIcon size={40} />}
          {oldPrice && <S.DiscountBadge>-{discountPercent}%</S.DiscountBadge>}
          <S.WishlistToggle
            type="button"
            aria-label={saved ? t("wishlist-remove-aria") : t("wishlist-add-aria")}
            active={saved}
            onClick={handleToggleWishlist}
          >
            <HeartIcon size={16} filled={saved} />
          </S.WishlistToggle>
        </S.ImageWrap>
        <S.Body>
          <S.Name>{productName}</S.Name>

          {/* {colorsInStock.length > 0 && (
            <S.ColorStockBadge aria-label={t("colors-stock-aria")}>
              {colorsInStock.map((pc) => (
                <S.ColorStockItem
                  key={pc.colorId}
                  title={pc.color ? getCategoryName(pc.color, router.locale) : undefined}
                >
                  <S.ColorDot hexCode={pc.color?.hexCode} />
                  {pc.stock}
                </S.ColorStockItem>
              ))}
            </S.ColorStockBadge>
          )} */}

          <S.Footer>
            <S.PriceGroup>
              <S.Price>{displayPrice.toFixed(2)} ₾</S.Price>
              {oldPrice && <S.OldPrice>{oldPrice.toFixed(2)} ₾</S.OldPrice>}
            </S.PriceGroup>
            <S.AddButton
              type="button"
              aria-label={isInCart ? t("remove-from-cart-aria") : t("add-to-cart-aria")}
              active={isInCart}
              disabled={outOfStock && !isInCart}
              onClick={handleAddToCart}
            >
              <CartIcon size={16} />
              <S.AddButtonLabel active={isInCart}>{t("remove-label")}</S.AddButtonLabel>
            </S.AddButton>
          </S.Footer>
        </S.Body>
      </S.Card>
    </Link>
  );
};

export default ProductCard;
