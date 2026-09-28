import { getCanonicalPath, parseProductParam, productPath, slugify, stripHtml } from "./seo";

describe("getCanonicalPath", () => {
  it("query string-ს და hash-ს შლის", () => {
    expect(getCanonicalPath("/products?sort=new&utm_source=fb#top")).toBe("/products");
  });

  it("?page=N-ს (N>1) ინარჩუნებს", () => {
    expect(getCanonicalPath("/categories/oils?brand=x&page=3")).toBe("/categories/oils?page=3");
    expect(getCanonicalPath("/products?page=1")).toBe("/products");
  });

  it("root-ს ცარიელ path-ად აბრუნებს", () => {
    expect(getCanonicalPath("/")).toBe("");
    expect(getCanonicalPath("/?search=a")).toBe("");
  });
});

describe("slugify", () => {
  it("ქართულს და რუსულს ლათინურად ტრანსლიტერირებს", () => {
    expect(slugify("ზეთის ფილტრი")).toBe("zetis-filtri");
    expect(slugify("Масляный фильтр")).toBe("maslyanyy-filtr");
  });

  it("სპეციალურ სიმბოლოებს ტირეებით ანაცვლებს", () => {
    expect(slugify("  Nike Air-Max 90 (2024)! ")).toBe("nike-air-max-90-2024");
  });
});

describe("productPath / parseProductParam", () => {
  it("en სახელს ანიჭებს უპირატესობას", () => {
    const product = { id: 12, translations: { ka: { name: "ფილტრი" }, en: { name: "Oil Filter" } } };
    expect(productPath(product)).toBe("/products/12-oil-filter");
  });

  it("სახელის გარეშე მხოლოდ id-ს იყენებს", () => {
    expect(productPath({ id: 7 })).toBe("/products/7");
  });

  it("id-ს slug-იანი და slug-ის გარეშე param-იდან იღებს", () => {
    expect(parseProductParam("12-oil-filter")).toBe(12);
    expect(parseProductParam("12")).toBe(12);
    expect(parseProductParam("abc")).toBeNull();
    expect(parseProductParam(undefined)).toBeNull();
  });
});

describe("stripHtml", () => {
  it("ტეგებს შლის და whitespace-ს აერთიანებს", () => {
    expect(stripHtml("<p>Hello&nbsp;<b>world</b></p>\n<p>!</p>")).toBe("Hello world !");
  });
});
