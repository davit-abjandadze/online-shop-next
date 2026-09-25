import { fetchAllPages, MAX_PAGE_LIMIT } from "./fetchAllPages";

const pageResponse = (items: number[], totalPages: number) =>
  Promise.resolve({ data: { data: items, meta: { totalPages } } } as any);

describe("fetchAllPages", () => {
  it("ყველა გვერდს თანმიმდევრულად წამოიღებს max limit-ით", async () => {
    const fetchPage = jest.fn((page: number) => pageResponse([page * 10, page * 10 + 1], 3));

    const result = await fetchAllPages<number>(fetchPage);

    expect(result).toEqual([10, 11, 20, 21, 30, 31]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1, MAX_PAGE_LIMIT);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 3, MAX_PAGE_LIMIT);
  });

  it("meta-ს გარეშე ერთ გვერდზე ჩერდება", async () => {
    const fetchPage = jest.fn(() => Promise.resolve({ data: { data: [1] } } as any));

    expect(await fetchAllPages<number>(fetchPage)).toEqual([1]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("არავალიდურ პასუხზე ცარიელ მასივს აბრუნებს", async () => {
    const fetchPage = jest.fn(() => Promise.resolve({ data: null } as any));

    expect(await fetchAllPages<number>(fetchPage)).toEqual([]);
  });
});
