import { getPaginationRange } from "./getPaginationRange";

describe("getPaginationRange", () => {
  it("returns an empty array when there are no pages", () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
  });

  it("returns every page when total pages fit without ellipsis", () => {
    expect(getPaginationRange(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("collapses the middle of a large range into a single ellipsis", () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, "...", 9, 10]);
  });

  it("keeps neighbours of the current page and adds ellipses on both sides", () => {
    expect(getPaginationRange(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 9, 10]);
  });

  it("never produces a page number outside [1, total]", () => {
    const result = getPaginationRange(1, 3);
    expect(result.every((item) => item === "..." || (item >= 1 && item <= 3))).toBe(true);
  });
});
