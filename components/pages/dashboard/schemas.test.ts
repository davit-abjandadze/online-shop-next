import {
  branchFormSchema,
  buildHeroSlideTranslationsDto,
  buildNameTranslationsDto,
  buildProductTranslationsDto,
  categoryFormSchema,
  productFormSchema,
  userEditFormSchema,
} from "./schemas";

const validCategory = {
  translations: {
    ka: { name: "ელექტრონიკა" },
    en: { name: "Electronics" },
    ru: { name: "Электроника" },
  },
  slug: "electronics",
  isActive: true,
};

describe("categoryFormSchema", () => {
  it("accepts a fully valid category", () => {
    expect(categoryFormSchema.safeParse(validCategory).success).toBe(true);
  });

  it("rejects a blank Georgian name", () => {
    expect(
      categoryFormSchema.safeParse({
        ...validCategory,
        translations: { ...validCategory.translations, ka: { name: "   " } },
      }).success
    ).toBe(false);
  });

  it("accepts a blank English name (optional)", () => {
    expect(
      categoryFormSchema.safeParse({
        ...validCategory,
        translations: { ...validCategory.translations, en: { name: "   " } },
      }).success
    ).toBe(true);
  });

  it("rejects a slug with invalid characters", () => {
    expect(categoryFormSchema.safeParse({ ...validCategory, slug: "ელექტრონიკა" }).success).toBe(false);
  });

  it("accepts an optional parentId", () => {
    expect(categoryFormSchema.safeParse({ ...validCategory, parentId: "some-uuid" }).success).toBe(true);
  });
});

const openDay = { closed: false, open: "09:30", close: "19:00" };
const closedDay = { closed: true, open: "", close: "" };

const validBranch = {
  companyId: "11111111-1111-4111-8111-111111111111",
  title: "ჯ. თბილისი, ვაკე",
  address: "0177, უნივერსიტეტის ქ. N6",
  phoneNumber: "(032) 215 40 40",
  email: "info@amboli.ge",
  latitude: "41.7225",
  longitude: "44.7635",
  workingHours: {
    mon: openDay,
    tue: openDay,
    wed: openDay,
    thu: openDay,
    fri: openDay,
    sat: openDay,
    sun: closedDay,
  },
  isActive: true,
};

describe("branchFormSchema", () => {
  it("accepts a fully valid branch", () => {
    expect(branchFormSchema.safeParse(validBranch).success).toBe(true);
  });

  it("accepts a blank optional email", () => {
    expect(branchFormSchema.safeParse({ ...validBranch, email: "" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(branchFormSchema.safeParse({ ...validBranch, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a non-numeric latitude", () => {
    expect(branchFormSchema.safeParse({ ...validBranch, latitude: "abc" }).success).toBe(false);
  });

  it("rejects a malformed open time on a non-closed day", () => {
    expect(
      branchFormSchema.safeParse({
        ...validBranch,
        workingHours: { ...validBranch.workingHours, mon: { closed: false, open: "9:30", close: "19:00" } },
      }).success
    ).toBe(false);
  });

  it("ignores time format on a closed day", () => {
    expect(
      branchFormSchema.safeParse({
        ...validBranch,
        workingHours: { ...validBranch.workingHours, mon: { closed: true, open: "", close: "" } },
      }).success
    ).toBe(true);
  });
});

describe("productFormSchema.discountPercent", () => {
  const discount = productFormSchema.shape.discountPercent;

  it("0-100 მთელ რიცხვს და ცარიელს იღებს", () => {
    expect(discount.safeParse("15").success).toBe(true);
    expect(discount.safeParse("0").success).toBe(true);
    expect(discount.safeParse("100").success).toBe(true);
    expect(discount.safeParse("").success).toBe(true);
  });

  it("ათწილადს და დიაპაზონის გარეთ მნიშვნელობას უარყოფს (ბექენდი @IsInt)", () => {
    expect(discount.safeParse("12.5").success).toBe(false);
    expect(discount.safeParse("101").success).toBe(false);
    expect(discount.safeParse("-1").success).toBe(false);
    expect(discount.safeParse("abc").success).toBe(false);
  });
});

describe("userEditFormSchema.age", () => {
  const age = userEditFormSchema.shape.age;

  it("ცარიელს და არაუარყოფით მთელ რიცხვს იღებს", () => {
    expect(age.safeParse("").success).toBe(true);
    expect(age.safeParse(undefined).success).toBe(true);
    expect(age.safeParse("30").success).toBe(true);
  });

  it("არარიცხვით, უარყოფით და ათწილად მნიშვნელობას უარყოფს", () => {
    expect(age.safeParse("abc").success).toBe(false);
    expect(age.safeParse("-5").success).toBe(false);
    expect(age.safeParse("2.5").success).toBe(false);
  });
});

describe("buildProductTranslationsDto", () => {
  const input = { ka: { name: " სახელი ", description: " " }, en: { name: "Name", description: "" }, ru: {} };

  it("შექმნისას ცარიელ description-ს გამოტოვებს", () => {
    expect(buildProductTranslationsDto(input)).toEqual({ ka: { name: "სახელი" }, en: { name: "Name" } });
  });

  it("რედაქტირებისას ცარიელ description-ს \"\"-ით, ცარიელ en/ru-ს კი null-ით აგზავნის, რომ ბექენდმა წაშალოს", () => {
    expect(buildProductTranslationsDto(input, { keepEmptyDescriptions: true })).toEqual({
      ka: { name: "სახელი", description: "" },
      en: { name: "Name", description: "" },
      ru: null,
    });
  });
});

describe("buildNameTranslationsDto", () => {
  const input = { ka: { name: " კატეგორია " }, en: { name: "" }, ru: { name: "Категория" } };

  it("შექმნისას ცარიელ ენას გამოტოვებს", () => {
    expect(buildNameTranslationsDto(input)).toEqual({ ka: { name: "კატეგორია" }, ru: { name: "Категория" } });
  });

  it("რედაქტირებისას ცარიელ ენას null-ით აგზავნის", () => {
    expect(buildNameTranslationsDto(input, { isUpdate: true })).toEqual({
      ka: { name: "კატეგორია" },
      en: null,
      ru: { name: "Категория" },
    });
  });
});

describe("buildHeroSlideTranslationsDto", () => {
  const input = {
    ka: { title: "სათაური", eyebrow: "", description: "აღწერა", buttonText: "" },
    en: { title: "" },
    ru: { title: "" },
  };

  it("რედაქტირებისას ცარიელ ქვე-ველებს \"\"-ით, ცარიელ ენებს null-ით აგზავნის", () => {
    expect(buildHeroSlideTranslationsDto(input, { isUpdate: true })).toEqual({
      ka: { title: "სათაური", eyebrow: "", description: "აღწერა", buttonText: "" },
      en: null,
      ru: null,
    });
  });

  it("შექმნისას ცარიელ ქვე-ველებს გამოტოვებს", () => {
    expect(buildHeroSlideTranslationsDto(input)).toEqual({ ka: { title: "სათაური", description: "აღწერა" } });
  });
});
