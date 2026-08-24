import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "ref-wishlist";

interface WishlistContextValue {
  productIds: number[];
  count: number;
  isSaved: (productId: number) => boolean;
  toggle: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextValue>({
  productIds: [],
  count: 0,
  isSaved: () => false,
  toggle: () => {},
});

// "სასურველი" (wishlist) სია — backend-ს ჯერ არ აქვს ამისთვის endpoint, ამიტომ
// მთლიანად localStorage-ზეა დაფუძნებული, მოწყობილობის/ბრაუზერის ფარგლებში.
// მარტივი პროდუქტის ID-ების მასივი, არა სერვერზე სინქრონიზებული ანგარიშის მონაცემი.
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productIds, setProductIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setProductIds(parsed.filter((id) => typeof id === "number"));
      }
    } catch {
      // localStorage მიუწვდომელია (მაგ. კერძო რეჟიმი) — ცარიელი სიით ვაგრძელებთ
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    } catch {
      // ჩუმად ვტოვებთ
    }
  }, [productIds, hydrated]);

  const isSaved = useCallback((productId: number) => productIds.includes(productId), [productIds]);

  const toggle = useCallback((productId: number) => {
    setProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  return (
    <WishlistContext.Provider value={{ productIds, count: productIds.length, isSaved, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
