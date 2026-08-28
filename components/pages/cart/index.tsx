import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { useCart } from "@/context/Cart";
import { useWishlist } from "@/context/Wishlist";
import { CDN_URL } from "@/constants";
import { CartIcon, HeartIcon, LockIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import * as S from "./style";

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// კალათის გვერდი — სერვერზე შენახული კალათის (CartContext) UI-ური წარმოდგენა.
// ავტორიზაციის გარეშე ჩვენება backend-ის JwtAuthGuard-ის შესაბამისად აკრძალულია,
// ამიტომ არაავტორიზებულ ვიზიტორს არსებული AuthModal-ის შესვლის ნაკადში ვმართავთ,
// ახალი ავტორიზაციის ნაკადის აშენების ნაცვლად.
export const CartComponent: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { cart, loading, updateItemQuantity, removeItem } = useCart();
  const { isSaved, toggle: toggleWishlist } = useWishlist();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageBackground>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </S.Container>
        </S.PageBackground>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <S.PageBackground>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>საჭიროა ავტორიზაცია</S.AccessDeniedTitle>
            <S.AccessDeniedText>კალათის სანახავად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton type="button" onClick={() => setAuthModalOpen(true)}>
              შესვლა
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageBackground>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </>
    );
  }

  const items = cart?.items || [];
  const { subtotal, total, itemsCount } = items.reduce(
    (acc, item) => {
      const { price, originalPrice } = getDiscountedPrice(item.product);
      return {
        subtotal: acc.subtotal + (originalPrice ?? price) * item.quantity,
        total: acc.total + price * item.quantity,
        itemsCount: acc.itemsCount + item.quantity,
      };
    },
    { subtotal: 0, total: 0, itemsCount: 0 }
  );
  const discount = subtotal - total;

  const handleQuantityChange = async (itemId: number, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    setPendingItemId(itemId);
    await updateItemQuantity(itemId, nextQuantity);
    setPendingItemId(null);
  };

  const handleRemove = async (itemId: number) => {
    setPendingItemId(itemId);
    await removeItem(itemId);
    setPendingItemId(null);
  };

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <S.Title>კალათა</S.Title>

          {!loading && items.length === 0 ? (
            <S.EmptyState>
              <CartIcon size={48} />
              <S.EmptyStateTitle>კალათა ცარიელია</S.EmptyStateTitle>
              <S.ActionButton type="button" onClick={() => router.push("/")}>
                კატალოგში დაბრუნება
              </S.ActionButton>
            </S.EmptyState>
          ) : (
            <S.Layout>
              <S.ItemsList>
                {items.map((item) => {
                  const image = resolveImage(item.product.images?.[0]);
                  const disabled = pendingItemId === item.id;
                  const atStockLimit = item.quantity >= item.product.stock;
                  const { price: unitPrice, originalPrice, discountPercent } = getDiscountedPrice(item.product);
                  const saved = isSaved(item.product.id);

                  return (
                    <S.Item key={item.id}>
                      <S.ItemImage>{image && <img src={image} alt={item.product.name} />}</S.ItemImage>

                      <S.ItemInfo>
                        <Link href={`/products/${item.product.id}`} passHref legacyBehavior>
                          <S.ItemName>{item.product.name}</S.ItemName>
                        </Link>
                        {atStockLimit && <S.ItemStockWarning>მარაგის ლიმიტი მიღწეულია</S.ItemStockWarning>}
                      </S.ItemInfo>

                      <S.QuantityStepper>
                        <S.StepperButton
                          type="button"
                          disabled={disabled || item.quantity <= 1}
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <MinusIcon size={16} />
                        </S.StepperButton>
                        <S.QuantityValue>{item.quantity}</S.QuantityValue>
                        <S.StepperButton
                          type="button"
                          disabled={disabled || atStockLimit}
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <PlusIcon size={16} />
                        </S.StepperButton>
                      </S.QuantityStepper>

                      <S.ItemPrice>
                        {(unitPrice * item.quantity).toFixed(2)} ₾
                        {originalPrice && <S.ItemOldPrice>{(originalPrice * item.quantity).toFixed(2)} ₾</S.ItemOldPrice>}
                        {discountPercent && <S.ItemDiscountBadge>-{discountPercent}%</S.ItemDiscountBadge>}
                      </S.ItemPrice>

                      <S.ItemActions>
                        <S.WishlistButton
                          type="button"
                          active={saved}
                          aria-label={saved ? "სასურველებიდან წაშლა" : "სასურველებში დამატება"}
                          onClick={() => toggleWishlist(item.product.id)}
                        >
                          <HeartIcon size={18} filled={saved} />
                        </S.WishlistButton>
                        <S.RemoveButton type="button" disabled={disabled} onClick={() => handleRemove(item.id)}>
                          <TrashIcon size={18} />
                        </S.RemoveButton>
                      </S.ItemActions>
                    </S.Item>
                  );
                })}
              </S.ItemsList>

              <S.SummaryCard>
                <S.SummaryTitle>შეკვეთა</S.SummaryTitle>
                <S.SummaryRow>
                  <span>პროდუქტი ({itemsCount})</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                {discount > 0 && (
                  <S.SummaryRow discount>
                    <span>ფასდაკლება:</span>
                    <span>-{discount.toFixed(2)} ₾</span>
                  </S.SummaryRow>
                )}
                <S.TotalRow>
                  მთლიანი ჯამი
                  <S.TotalValue>{total.toFixed(2)} ₾</S.TotalValue>
                </S.TotalRow>
                <S.CheckoutButton type="button" disabled={items.length === 0} onClick={() => router.push("/checkout")}>
                  შეკვეთის გაგრძელება
                </S.CheckoutButton>
              </S.SummaryCard>
            </S.Layout>
          )}
        </S.Container>
      </S.PageBackground>
      <Footer />
    </>
  );
};

export default CartComponent;
