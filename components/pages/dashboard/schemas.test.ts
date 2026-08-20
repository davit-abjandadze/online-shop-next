import { categoryFormSchema } from "./schemas";

describe("categoryFormSchema", () => {
  it("accepts a category with only a name", () => {
    expect(categoryFormSchema.safeParse({ name: "პოლიტიკა" }).success).toBe(true);
  });

  it("rejects a blank name", () => {
    expect(categoryFormSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});
