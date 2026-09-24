import { getDiscountedPrice } from "./getDiscountedPrice";

describe("getDiscountedPrice", () => {
  it("ფასდაკლების გარეშე ორიგინალ ფასს აბრუნებს", () => {
    expect(getDiscountedPrice({ price: "59.90", discountPercent: null })).toEqual({
      price: 59.9,
      originalPrice: null,
      discountPercent: null,
    });
  });

  it("ფასდაკლებულ ფასს 2 ათწილადამდე ამრგვალებს ბექენდის მსგავსად", () => {
    // 74.50 × 0.85 = 63.324999… float-ში — ბექენდი (Math.round) 63.33-ს ინახავს
    expect(getDiscountedPrice({ price: "74.50", discountPercent: 15 }).price).toBe(63.33);
    expect(getDiscountedPrice({ price: 59.9, discountPercent: 10 }).price).toBe(53.91);
  });

  it("originalPrice-სა და პროცენტს აბრუნებს მოქმედი ფასდაკლებისას", () => {
    const result = getDiscountedPrice({ price: 100, discountPercent: 25 });
    expect(result).toEqual({ price: 75, originalPrice: 100, discountPercent: 25 });
  });
});
