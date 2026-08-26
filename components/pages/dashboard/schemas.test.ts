import { categoryFormSchema } from "./schemas";

const validCategory = {
  nameKa: "ელექტრონიკა",
  nameEn: "Electronics",
  slug: "electronics",
  isActive: true,
};

describe("categoryFormSchema", () => {
  it("accepts a fully valid category", () => {
    expect(categoryFormSchema.safeParse(validCategory).success).toBe(true);
  });

  it("rejects a blank Georgian name", () => {
    expect(categoryFormSchema.safeParse({ ...validCategory, nameKa: "   " }).success).toBe(false);
  });

  it("rejects a blank English name", () => {
    expect(categoryFormSchema.safeParse({ ...validCategory, nameEn: "   " }).success).toBe(false);
  });

  it("rejects a slug with invalid characters", () => {
    expect(categoryFormSchema.safeParse({ ...validCategory, slug: "ელექტრონიკა" }).success).toBe(false);
  });

  it("accepts an optional parentId", () => {
    expect(categoryFormSchema.safeParse({ ...validCategory, parentId: "some-uuid" }).success).toBe(true);
  });
});
