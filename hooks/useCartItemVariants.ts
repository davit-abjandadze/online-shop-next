import { useEffect, useState } from "react";
import { ProductsAPI } from "@/API_Client";
import { CartItem, ProductVariant } from "@/API_Client/types";

// GET /cart ვარიანტის (ფერი+ზომა) relation-ს არ ტვირთავს (მხოლოდ variantId
// column-ია), ამიტომ ვარიანტის საკუთარი price/stock ცალკე, თითო პროდუქტზე
// ერთხელ, GET /products/:id/variants-იდან მოგვაქვს — cart და checkout
// გვერდებზე ერთი და იგივე ლოგიკაა საჭირო.
export const useCartItemVariants = (items: CartItem[], locale?: string) => {
  const [variantsByProductId, setVariantsByProductId] = useState<Record<number, ProductVariant[]>>({});
  const [failedProductIds, setFailedProductIds] = useState<number[]>([]);

  useEffect(() => {
    const productIds = Array.from(
      new Set(items.filter((item) => item.variantId).map((item) => item.product.id))
    ).filter((id) => !(id in variantsByProductId) && !failedProductIds.includes(id));
    if (productIds.length === 0) return;

    productIds.forEach((productId) => {
      ProductsAPI(locale || "ka", "")
        .productsControllerGetVariants(productId)
        .then((res) => {
          const variants = (res.data as unknown as ProductVariant[]) || [];
          setVariantsByProductId((prev) => ({ ...prev, [productId]: variants }));
        })
        .catch(() => {
          // ჩავარდნისას base product.price-ით ჯამი არასწორი იქნებოდა (ვარიანტს
          // საკუთარი ფასი შეიძლება ჰქონდეს) — ვიმახსოვრებთ, რომ UI-მ იცოდეს.
          setFailedProductIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, locale, failedProductIds]);

  // ვარიანტიან (ფერი+ზომა) პროდუქტს შეიძლება product.price-სგან განსხვავებული
  // საკუთარი price ჰქონდეს (ProductVariant.resolvedPrice) — თუ item-ს
  // variantId აქვს მინიჭებული, ჯამის დათვლაში სწორედ ის უნდა გამოვიყენოთ,
  // თორემ base product.price ჩაანაცვლებს რჩეული ზომის ფასს.
  const getItemPriceSource = (item: CartItem) => {
    const itemVariant = item.variantId
      ? variantsByProductId[item.product.id]?.find((v) => v.id === item.variantId)
      : undefined;
    return {
      price: itemVariant ? itemVariant.resolvedPrice : item.product.price,
      discountPercent: item.product.discountPercent,
    };
  };

  const getItemVariant = (item: CartItem) =>
    item.variantId ? variantsByProductId[item.product.id]?.find((v) => v.id === item.variantId) : undefined;

  // ვარიანტიანი item-ის ფასი ჯერ არ ვიცით (იტვირთება ან ვერ ჩაიტვირთა) —
  // ჯამი ამ დროს base ფასით არის დათვლილი, ამიტომ UI-მ ჯამი/გადახდა უნდა შეაჩეროს.
  const variantsPending = items.some((item) => item.variantId && !getItemVariant(item));
  const variantsFailed = items.some((item) => item.variantId && failedProductIds.includes(item.product.id));

  // ჩავარდნილი პროდუქტების ვარიანტებს ხელახლა ითხოვს
  const retryVariants = () => setFailedProductIds([]);

  return { variantsByProductId, getItemPriceSource, getItemVariant, variantsPending, variantsFailed, retryVariants };
};
