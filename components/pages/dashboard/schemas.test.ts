import { branchFormSchema, categoryFormSchema } from "./schemas";

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
