import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CartAPI } from "@/API_Client";
import { Cart } from "@/API_Client/types";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addItem: (productId: number, quantity?: number, colorId?: string) => Promise<boolean>;
  updateItemQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clear: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cart: null,
  itemCount: 0,
  loading: false,
  addItem: async () => false,
  updateItemQuantity: async () => false,
  removeItem: async () => false,
  clear: async () => false,
  refresh: async () => {},
});

// კალათა სერვერზეა შენახული (ერთი კალათა თითო ავტორიზებულ მომხმარებელზე,
// იხ. Phase 2 გეგმაში online-shop-nest-ის CartController) — ეს context მხოლოდ
// თხელი client-side ქეშია იმ endpoint-ების თავზე, არა ჭეშმარიტების წყარო.
// ამიტომ ყოველი მუტაცია საპასუხო კალათას პირდაპირ state-ში წერს, refetch-ის
// გარეშე, მაგრამ mount-ზე/სესიის ცვლილებაზე მაინც refresh ხდება, რომ სხვა
// tab-ში/მოწყობილობაზე გაკეთებული ცვლილება არ დარჩეს "ძველ" state-ში.
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const accessToken = session?.accessToken as string | undefined;

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await CartAPI(router.locale || "ka", accessToken).cartControllerGetCart();
      setCart(res.data as unknown as Cart);
    } catch {
      // კალათის ჩატვირთვის შეცდომას ჩუმად ვტოვებთ — Header-ის ბეჯი უბრალოდ
      // 0-ს აჩვენებს, საჭიროებისამებრ toast აისვლის კონკრეტული ქმედების დროს
    } finally {
      setLoading(false);
    }
  }, [accessToken, router.locale]);

  useEffect(() => {
    if (status === "authenticated") {
      refresh();
    } else if (status === "unauthenticated") {
      setCart(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, accessToken]);

  const withErrorToast = async (action: () => Promise<Cart>): Promise<boolean> => {
    if (!accessToken) {
      toast.info("კალათაში დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია");
      return false;
    }
    try {
      const updated = await action();
      setCart(updated);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მოქმედება ვერ შესრულდა");
      return false;
    }
  };

  const addItem = (productId: number, quantity: number = 1, colorId?: string) =>
    withErrorToast(async () => {
      const res = await CartAPI(router.locale || "ka", accessToken as string).cartControllerAddItem({
        productId,
        quantity,
        ...(colorId ? { colorId } : {}),
      });
      return res.data as unknown as Cart;
    });

  const updateItemQuantity = (itemId: number, quantity: number) =>
    withErrorToast(async () => {
      const res = await CartAPI(router.locale || "ka", accessToken as string).cartControllerUpdateItem(
        String(itemId),
        { quantity }
      );
      return res.data as unknown as Cart;
    });

  const removeItem = (itemId: number) =>
    withErrorToast(async () => {
      const res = await CartAPI(router.locale || "ka", accessToken as string).cartControllerRemoveItem(
        String(itemId)
      );
      return res.data as unknown as Cart;
    });

  const clear = () =>
    withErrorToast(async () => {
      const res = await CartAPI(router.locale || "ka", accessToken as string).cartControllerClearCart();
      return res.data as unknown as Cart;
    });

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, itemCount, loading, addItem, updateItemQuantity, removeItem, clear, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
