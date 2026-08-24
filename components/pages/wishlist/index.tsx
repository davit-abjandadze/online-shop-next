import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import ProductCard from "@/components/shared/ProductCard";
import { HeartIcon } from "@/components/ui/RefIcons";
import { useWishlist } from "@/context/Wishlist";
import { ProductsAPI } from "@/API_Client";
import { Product } from "@/API_Client/client/models";
import * as S from "./style";

// "სასურველი" გვერდი — localStorage-ში შენახული პროდუქტის ID-ების მიხედვით
// თითოეულს ცალ-ცალკე ვითხოვთ (findOne), რადგან backend-ს ჯერ არ აქვს
// "ID-ების სიით მოძებნის" endpoint. წაშლილი/დამალული პროდუქტები უბრალოდ
// გამოტოვებულია სიიდან.
export const WishlistComponent: React.FC = () => {
  const router = useRouter();
  const { productIds } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          productIds.map((id) =>
            ProductsAPI(router.locale || "ka", "")
              .productsControllerFindOne(String(id))
              .then((res) => res.data as unknown as Product)
              .catch(() => null)
          )
        );
        setProducts(results.filter((p): p is Product => p !== null));
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds, router.locale]);

  return (
    <S.PageBackground>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <S.Container>
        <S.PageHeader>
          <S.PageTitle>სასურველი პროდუქტები</S.PageTitle>
          <S.PageSubtitle>თქვენს მიერ შენახული პროდუქტები — ინახება მხოლოდ ამ მოწყობილობაზე</S.PageSubtitle>
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
