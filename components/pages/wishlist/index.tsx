import React, { useState } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useSession } from "next-auth/react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import ProductCard from "@/components/shared/ProductCard";
import { HeartIcon, LockIcon } from "@/components/ui/RefIcons";
import { useWishlist } from "@/context/Wishlist";
import * as S from "./style";
import * as CartS from "../cart/style";

// "სასურველი" გვერდი — სერვერზე შენახული ფავორიტების მიხედვით (FavoritesAPI,
// იხ. context/Wishlist). პროდუქტი Favorite-ის relation-ითვე მოდის, ცალ-ცალკე
// findOne-ების გარეშე.
export const WishlistComponent: React.FC = () => {
  const { t } = useTranslation("catalog");
  const { status } = useSession();
  const { favorites, loading } = useWishlist();
  const products = favorites.map((f) => f.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // სტუმარს "სია ცარიელია"-ს ნაცვლად ავტორიზაციის მოთხოვნა ვაჩვენოთ — კალათის
  // გვერდის იგივე პატერნი (ფავორიტები მხოლოდ ავტორიზებულზე ინახება სერვერზე).
  if (status === "unauthenticated") {
    return (
      <S.PageBackground>
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <CartS.AccessDeniedCard>
          <LockIcon size={48} />
          <CartS.AccessDeniedTitle>{t("wishlist-auth-required-title")}</CartS.AccessDeniedTitle>
          <CartS.AccessDeniedText>{t("wishlist-auth-required-text")}</CartS.AccessDeniedText>
          <CartS.ActionButton type="button" onClick={() => setAuthModalOpen(true)}>
            {t("wishlist-login-button")}
          </CartS.ActionButton>
        </CartS.AccessDeniedCard>
        <Footer />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </S.PageBackground>
    );
  }

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.PageHeader>
          <S.PageTitle>{t("wishlist-title")}</S.PageTitle>
          <S.PageSubtitle>{t("wishlist-subtitle")}</S.PageSubtitle>
        </S.PageHeader>

        {status === "loading" || loading ? null : products.length === 0 ? (
          <S.EmptyState>
            <HeartIcon size={48} />
            <S.EmptyStateTitle>{t("wishlist-empty-title")}</S.EmptyStateTitle>
            <Link href="/products" passHref legacyBehavior>
              <S.EmptyStateLink>{t("wishlist-browse-catalog")}</S.EmptyStateLink>
            </Link>
          </S.EmptyState>
        ) : (
          <S.ProductsGrid>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </S.ProductsGrid>
        )}
      </S.Container>

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </S.PageBackground>
  );
};

export default WishlistComponent;
