import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import ProductCard from "@/components/shared/ProductCard";
import { HeartIcon } from "@/components/ui/RefIcons";
import { useWishlist } from "@/context/Wishlist";
import * as S from "./style";

// "სასურველი" გვერდი — სერვერზე შენახული ფავორიტების მიხედვით (FavoritesAPI,
// იხ. context/Wishlist). პროდუქტი Favorite-ის relation-ითვე მოდის, ცალ-ცალკე
// findOne-ების გარეშე.
export const WishlistComponent: React.FC = () => {
  const { favorites, loading } = useWishlist();
  const products = favorites.map((f) => f.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.PageHeader>
          <S.PageTitle>სასურველი პროდუქტები</S.PageTitle>
          <S.PageSubtitle>თქვენს მიერ შენახული პროდუქტები</S.PageSubtitle>
        </S.PageHeader>

        {!loading && products.length === 0 ? (
          <S.EmptyState>
            <HeartIcon size={48} />
            <S.EmptyStateTitle>სასურველი სია ცარიელია</S.EmptyStateTitle>
            <Link href="/products" passHref legacyBehavior>
              <S.EmptyStateLink>კატალოგის დათვალიერება</S.EmptyStateLink>
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
