// პროდუქტის `price`/`discountPercent`-იდან ფაქტობრივი (ფასდაკლებული) ფასის
// გამოთვლა — `product.price` ბაზისური (ორიგინალი) ფასია, `discountPercent`
// კი (0-100) მისგან ჩამოსაკლები პროცენტია. ერთი ადგილიდან იმეორება ყველგან,
// სადაც ფასდაკლება უნდა აისახოს (ProductCard, კალათა, checkout).
export interface DiscountablePriceSource {
  price: string | number;
  discountPercent?: number | null;
}

export interface DiscountedPriceResult {
  // ფაქტობრივად გადასახდელი ფასი (ფასდაკლების გათვალისწინებით).
  price: number;
  // ორიგინალი ფასი — მხოლოდ მაშინ, თუ ფასდაკლება მოქმედია (სხვა შემთხვევაში null).
  originalPrice: number | null;
  discountPercent: number | null;
}

export const getDiscountedPrice = (product: DiscountablePriceSource): DiscountedPriceResult => {
  const basePrice = Number(product.price);
  const percent = product.discountPercent;

  if (!percent || percent <= 0) {
    return { price: basePrice, originalPrice: null, discountPercent: null };
  }

  // ბექენდის (orders.service createFromCart) იგივე დამრგვალება: unitPrice
  // ჯერ 2 ათწილადამდე მრგვალდება და მერე მრავლდება რაოდენობაზე. ამის
  // გარეშე toFixed(2) float-ის ცდომილებას ქვემოთ ჭრიდა (74.50 × 0.85 =
  // 63.324999… → "63.32"), შეკვეთაში კი 63.33 ფიქსირდებოდა.
  const discounted = Math.round(basePrice * (1 - percent / 100) * 100) / 100;
  return { price: discounted, originalPrice: basePrice, discountPercent: percent };
};

export default getDiscountedPrice;
