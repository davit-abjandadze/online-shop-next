import { categoryFormSchema, questionFormSchema } from "./schemas";

describe("questionFormSchema", () => {
  const baseValues = {
    text: "რომელ ქალაქს ანიჭებთ უპირატესობას?",
    type: "single" as const,
    categoryIds: [] as number[],
    endDate: "",
    answers: [{ text: "თბილისი" }, { text: "ბათუმი" }],
  };

  it("accepts a valid question with at least 2 non-empty answers", () => {
    const result = questionFormSchema.safeParse(baseValues);
    expect(result.success).toBe(true);
  });

  it("rejects an empty question text", () => {
    const result = questionFormSchema.safeParse({ ...baseValues, text: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 2 non-empty answers", () => {
    const result = questionFormSchema.safeParse({
      ...baseValues,
      answers: [{ text: "თბილისი" }, { text: "   " }],
    });
    expect(result.success).toBe(false);
  });

  it("ignores blank answer rows when counting valid answers", () => {
    const result = questionFormSchema.safeParse({
      ...baseValues,
      answers: [{ text: "თბილისი" }, { text: "ბათუმი" }, { text: "" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("categoryFormSchema", () => {
  it("accepts a category with only a name", () => {
    expect(categoryFormSchema.safeParse({ name: "პოლიტიკა" }).success).toBe(true);
  });

  it("rejects a blank name", () => {
    expect(categoryFormSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});
