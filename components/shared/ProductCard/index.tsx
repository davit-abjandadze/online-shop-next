import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { toast } from "react-toastify";
import { ProductsAPI } from "@/API_Client";
import { Product, ProductColor, ProductVariant } from "@/API_Client/types";
import { CartIcon, HeartIcon, ShareIcon, StarIcon, TagIcon } from "@/components/ui/RefIcons";
import ShareModal from "@/components/shared/ShareModal";
import { BASEPATH, CDN_URL } from "@/constants";
import { useCart } from "@/context/Cart";
import { useWishlist } from "@/context/Wishlist";
import { getCategoryName, getLocalizedDescription } from "@/utils/getCategoryName";
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
  const { t: tc } = useTranslation("common");
  const { cart, addItem, removeItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const productName = getCategoryName(product, router.locale);
  const productDescription = getLocalizedDescription(product, router.locale);
  const image = product.images?.[0];
  const imageSrc = image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;
  const saved = isSaved(product.id);
  const { rating, reviews } = getDisplayStats(product);
  const { price: displayPrice, originalPrice: oldPrice, discountPercent } = getDiscountedPrice(product);

  // ფერების ჩამონათვალი მარაგთან ერთად — ბარათზე ბეიჯისთვის და "კალათაში
  // დამატების" ავტომატური ფერის შერჩევისთვის ორივესთვის ერთი და იგივე
  // მოთხოვნა გვჭირდება, ამიტომ ერთხელ, mount-ზე ვტვირთავთ.
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // ფერები+ვარიანტები ჯერ არ ჩატვირთულა — ამ დროს hasVariants false-ია და
  // დამატება variantId-ის გარეშე წავიდოდა (ბექენდი 400-ს აბრუნებს).
  const [optionsLoading, setOptionsLoading] = useState(true);
  // ორმაგი კლიკისგან დაცვა — პირველი პასუხის მოსვლამდე cartItem ჯერ undefined-ია
  // და მეორე კლიკიც "დამატებად" ითვლებოდა (რაოდენობა 2 ხდებოდა).
  const cartPendingRef = useRef(false);
  const colorsInStock = productColors.filter((pc) => pc.stock > 0);
  const hasVariants = productVariants.length > 0;
  const outOfStock = hasVariants ? !productVariants.some((v) => v.stock > 0) : product.stock <= 0;

  useEffect(() => {
    let cancelled = false;
    setOptionsLoading(true);
    const colorsRequest = ProductsAPI(router.locale || "ka", "")
      .productsControllerGetColors(Number(product.id))
      .then((res) => {
        if (!cancelled) setProductColors((res.data as unknown as ProductColor[]) || []);
      })
      .catch(() => {
        // ფერების წამოღება ვერ მოხერხდა — ბეიჯი უბრალოდ არ გამოჩნდება
      });
    const variantsRequest = ProductsAPI(router.locale || "ka", "")
      .productsControllerGetVariants(product.id)
      .then((res) => {
        if (!cancelled) setProductVariants((res.data as unknown as ProductVariant[]) || []);
      })
      .catch(() => {
        // ვარიანტების წამოღება ვერ მოხერხდა — "დან" ფასი უბრალოდ არ გამოჩნდება
      });
    Promise.allSettled([colorsRequest, variantsRequest]).then(() => {
      if (!cancelled) setOptionsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [product.id, router.locale]);

  // თუ პროდუქტს ვარიანტები (ფერი+ზომა) აქვს მიბმული, ბარათზე ყველაზე იაფი
  // ვარიანტის ფასი ჩანს "დან" პრეფიქსით — spec-ის მოთხოვნით. ფასდაკლება
  // ვარიანტის ფასზეც ვრცელდება (დეტალური გვერდის/კალათის/ბექენდის მსგავსად).
  const cheapestVariant = hasVariants
    ? (() => {
        const inStock = productVariants.filter((v) => v.stock > 0);
        const candidates = inStock.length > 0 ? inStock : productVariants;
        return candidates.reduce((min, v) => (Number(v.resolvedPrice) < Number(min.resolvedPrice) ? v : min));
      })()
    : undefined;
  const cheapestVariantPrice = cheapestVariant
    ? getDiscountedPrice({ price: cheapestVariant.resolvedPrice, discountPercent: product.discountPercent })
    : undefined;

  // თუ პროდუქტი უკვე კალათაშია — ღილაკზე დაჭერით ვშლით, თუ არადა ვამატებთ.
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartPendingRef.current) return;
    cartPendingRef.current = true;
    try {
      await toggleCart();
    } finally {
      cartPendingRef.current = false;
    }
  };

  const toggleCart = async () => {
    if (cartItem) {
      if (await removeItem(cartItem.id)) toast.info(String(tc("toast-removed-from-cart")));
      return;
    }

    // თუ პროდუქტს ვარიანტები (ფერი+ზომა) აქვს მიბმული, ბექენდი variantId-ს
    // ითხოვს — ბარათიდან პირდაპირი დამატებისას პირველი მარაგში მყოფი
    // ვარიანტი ავტომატურად იგულისხმება. თუ პროდუქტს მხოლოდ ძველი
    // (მხოლოდ-ფერის) სისტემა აქვს, პირველი ხელმისაწვდომი ფერი გამოიყენება.
    const added = hasVariants
      ? await addItem(product.id, 1, undefined, productVariants.find((v) => v.stock > 0)?.id)
      : await addItem(product.id, 1, colorsInStock[0]?.colorId);
    if (added) toast.success(String(tc("toast-added-to-cart")));
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const handleOpenShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareModalOpen(true);
  };

  return (
    <>
    <Link href={`/products/${product.id}`} passHref legacyBehavior>
      <S.Card out={outOfStock}>
        <S.ImageWrap>
          {imageSrc ? <img src={imageSrc} alt={productName} loading="lazy" /> : <TagIcon size={40} />}
          {oldPrice && <S.DiscountBadge>-{discountPercent}%</S.DiscountBadge>}
          <S.ShareToggle
            type="button"
            aria-label={tc("share-button-aria")}
            onClick={handleOpenShare}
          >
            <ShareIcon size={15} />
          </S.ShareToggle>
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
          {/* {productDescription && <S.Description>{productDescription}</S.Description>} */}

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
              <S.Price>
                {cheapestVariantPrice !== undefined
                  ? t("from-price", { price: cheapestVariantPrice.price.toFixed(2) })
                  : `${displayPrice.toFixed(2)} ₾`}
              </S.Price>
              {cheapestVariantPrice !== undefined
                ? cheapestVariantPrice.originalPrice && (
                    <S.OldPrice>{cheapestVariantPrice.originalPrice.toFixed(2)} ₾</S.OldPrice>
                  )
                : oldPrice && <S.OldPrice>{oldPrice.toFixed(2)} ₾</S.OldPrice>}
            </S.PriceGroup>
            <S.AddButton
              type="button"
              aria-label={isInCart ? t("remove-from-cart-aria") : t("add-to-cart-aria")}
              active={isInCart}
              disabled={!isInCart && (outOfStock || optionsLoading)}
              onClick={handleAddToCart}
            >
              <CartIcon size={16} />
              <S.AddButtonLabel active={isInCart}>{t("remove-label")}</S.AddButtonLabel>
            </S.AddButton>
          </S.Footer>
        </S.Body>
      </S.Card>
    </Link>
    {shareModalOpen && (
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={`${BASEPATH}/${router.locale || "ka"}/products/${product.id}`}
        title={productName}
        price={`${displayPrice.toFixed(2)} ₾`}
        imageSrc={imageSrc}
        description={productDescription}
      />
    )}
    </>
  );
};

export default ProductCard;
