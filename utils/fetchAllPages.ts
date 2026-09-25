import { AxiosResponse } from "axios";
import { PaginatedResponseDto } from "@/API_Client/types";

// ბექენდის PaginationDto-ში limit ნაგულისხმევად 10-ია და მაქსიმუმ 100 —
// არგუმენტის გარეშე გამოძახებული `...FindAllAdmin()` ჩუმად მხოლოდ პირველ 10
// ჩანაწერს აბრუნებდა. ეს ჰელპერი 100-იანი გვერდებით თანმიმდევრულად წამოიღებს
// ყველა ჩანაწერს (ადმინის ფორმები/სიები, რომლებსაც pagination UI არ აქვთ).
export const MAX_PAGE_LIMIT = 100;

export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<AxiosResponse<unknown>>
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetchPage(page, MAX_PAGE_LIMIT);
    const data = res.data as PaginatedResponseDto<T>;
    all.push(...(Array.isArray(data?.data) ? data.data : []));
    totalPages = data?.meta?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return all;
}
