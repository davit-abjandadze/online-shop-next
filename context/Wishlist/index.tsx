import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { FavoritesAPI } from "@/API_Client";
import { Favorite } from "@/API_Client/types";

interface WishlistContextValue {
  favorites: Favorite[];
  productIds: number[];
  count: number;
  loading: boolean;
  isSaved: (productId: number) => boolean;
  toggle: (productId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue>({
  favorites: [],
  productIds: [],
  count: 0,
  loading: false,
  isSaved: () => false,
  toggle: async () => false,
  refresh: async () => {},
});

// "სასურველი" (wishlist/favorites) სია სერვერზეა შენახული — ერთი მომხმარებელი
// ერთ პროდუქტს მხოლოდ ერთხელ ინახავს (იხ. FavoritesController online-shop-nest-ში).
// Cart context-ის მსგავსად, ეს context მხოლოდ თხელი client-side ქეშია იმ
// endpoint-ების თავზე — ავტორიზაციის გარეშე ცარიელია და toggle ავტორიზაციას მოითხოვს.
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const accessToken = session?.accessToken as string | undefined;

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await FavoritesAPI(router.locale || "ka", accessToken).favoritesControllerFindAll();
      setFavorites((res.data as unknown as Favorite[]) || []);
    } catch {
      // ჩატვირთვის შეცდომას ჩუმად ვტოვებთ — badge/სია უბრალოდ ცარიელი დარჩება
    } finally {
      setLoading(false);
    }
  }, [accessToken, router.locale]);

  useEffect(() => {
    if (status === "authenticated") {
      refresh();
    } else if (status === "unauthenticated") {
      setFavorites([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, accessToken]);

  const isSaved = useCallback(
    (productId: number) => favorites.some((f) => f.product?.id === productId),
    [favorites]
  );

  const toggle = useCallback(
    async (productId: number) => {
      if (!accessToken) {
        toast.info("სასურველებში დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია");
        return false;
      }

      const api = FavoritesAPI(router.locale || "ka", accessToken);
      const existing = favorites.find((f) => f.product?.id === productId);

      try {
        if (existing) {
          await api.favoritesControllerRemoveFavorite(String(productId));
          setFavorites((prev) => prev.filter((f) => f.product?.id !== productId));
        } else {
          const res = await api.favoritesControllerAddFavorite(String(productId));
          const added = res.data as unknown as Favorite;
          setFavorites((prev) => [added, ...prev]);
        }
        return true;
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "მოქმედება ვერ შესრულდა");
        return false;
      }
    },
    [accessToken, favorites, router.locale]
  );

  const productIds = favorites.map((f) => f.product?.id).filter((id): id is number => typeof id === "number");

  return (
    <WishlistContext.Provider
      value={{ favorites, productIds, count: favorites.length, loading, isSaved, toggle, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
