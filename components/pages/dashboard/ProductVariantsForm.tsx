import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";
import { ColorsAPI, ProductsAPI, SizesAPI } from "@/API_Client";
import { ProductVariantItemDto } from "@/API_Client/client/models";
import { Color, ProductVariant, Size } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import { TrashIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

interface ProductVariantsFormProps {
  productId: number | string;
  accessToken: string;
  locale: string;
}

// "ყველას შენახვა" ღილაკისთვის — orchestrator (ProductsPage) ამ handle-ით
// იძახებს handleSave-ს ისე, თუ საკუთარი footer ღილაკი დაწკაპუნებულა.
// handle-ის save() "ჩუმია" (success toast-ის გარეშე) — საერთო შედეგს ერთი
// toast-ით ორქესტრატორი აცნობებს, რომ ერთ დაწკაპუნებაზე 4 toast არ ამოვარდეს.
export type ProductVariantsFormHandle = { save: () => Promise<boolean> };

type VariantRowState = {
  key: string;
  colorId: string;
  sizeId: string;
  stock: string;
  price: string;
};

let rowKeySeq = 0;
const nextRowKey = () => `row-${++rowKeySeq}`;

const emptyRow = (): VariantRowState => ({ key: nextRowKey(), colorId: "", sizeId: "", stock: "0", price: "" });

/**
 * პროდუქტის ვარიანტების (ფერი+ზომის კომბინაცია) მართვა — ProductColorsForm.tsx-ის
 * bulk-set პატერნის ანალოგი, მაგრამ ორგანზომილებიანი კომბინაციისთვის "დაამატე
 * row" მიდგომით (ბექენდის მოთხოვნით თითო row-ს მინიმუმ colorId ან sizeId
 * უნდა ჰქონდეს — ორივე ველი ცალ-ცალკე optional-ია). შენახვისას მთლიანად
 * ანაცვლებს არსებულ ვარიანტებს (`PUT /products/:id/variants`).
 */
export const ProductVariantsForm = forwardRef<ProductVariantsFormHandle, ProductVariantsFormProps>(({ productId, accessToken, locale }, ref) => {
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [allSizes, setAllSizes] = useState<Size[]>([]);
  const [rows, setRows] = useState<VariantRowState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    // ცალ-ცალკე settle-დება, რომ ვარიანტების წამოღების შეცდომამ (მაგ. ჯერ არცერთი
    // ვარიანტი არ არსებობს ამ პროდუქტზე) არ დაბლოკოს ფერების/ზომების სიის ჩვენება
    const [colorsResult, sizesResult, variantsResult] = await Promise.allSettled([
      ColorsAPI(locale, accessToken).colorsControllerFindAll(),
      SizesAPI(locale, accessToken).sizesControllerFindAll(),
      ProductsAPI(locale, accessToken).productsControllerGetVariants(Number(productId)),
    ]);

    if (colorsResult.status === "fulfilled") {
      setAllColors((colorsResult.value.data as unknown as Color[]) || []);
    } else {
      toast.error("ფერების ჩატვირთვა ვერ მოხერხდა");
    }

    if (sizesResult.status === "fulfilled") {
      setAllSizes((sizesResult.value.data as unknown as Size[]) || []);
    } else {
      toast.error("ზომების ჩატვირთვა ვერ მოხერხდა");
    }

    if (variantsResult.status === "fulfilled") {
      const variants = (variantsResult.value.data as unknown as ProductVariant[]) || [];
      setRows(
        variants.map((v) => ({
          key: nextRowKey(),
          colorId: v.colorId || "",
          sizeId: v.sizeId || "",
          stock: String(v.stock),
          price: v.price != null ? String(v.price) : "",
        }))
      );
    } else {
      setRows([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const updateRow = (key: string, patch: Partial<VariantRowState>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const removeRow = (key: string) => setRows((prev) => prev.filter((row) => row.key !== key));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const handleSave = async (silent = false): Promise<boolean> => {
    for (const row of rows) {
      if (!row.colorId && !row.sizeId) {
        toast.error("თითოეულ ვარიანტს უნდა ჰქონდეს მინიმუმ ფერი ან ზომა არჩეული");
        return false;
      }
      if (row.stock.trim() === "" || isNaN(Number(row.stock)) || !Number.isInteger(Number(row.stock)) || Number(row.stock) < 0) {
        toast.error("მარაგი უნდა იყოს დადებითი მთელი რიცხვი ყველა ვარიანტზე");
        return false;
      }
      if (row.price.trim() !== "" && (isNaN(Number(row.price)) || Number(row.price) < 0)) {
        toast.error("ფასი უნდა იყოს ვალიდური დადებითი რიცხვი, თუ მითითებულია");
        return false;
      }
    }

    const items: ProductVariantItemDto[] = rows.map((row) => ({
      ...(row.colorId ? { colorId: row.colorId } : {}),
      ...(row.sizeId ? { sizeId: row.sizeId } : {}),
      stock: Number(row.stock),
      ...(row.price.trim() !== "" ? { price: row.price.trim() } : {}),
    }));

    setSaving(true);
    try {
      await ProductsAPI(locale, accessToken).productsControllerSetVariants(Number(productId), { variants: items });
      if (!silent) toast.success("პროდუქტის ვარიანტები წარმატებით შეინახა!");
      await fetchData();
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის ვარიანტების შენახვა ვერ მოხერხდა");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({ save: () => handleSave(true) }));

  if (loading) {
    return <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>;
  }

  if (allColors.length === 0 && allSizes.length === 0) {
    return (
      <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>
        ფერების და ზომების ბიბლიოთეკა ცარიელია — ჯერ დაამატეთ ფერები/ზომები შესაბამისი ჩანართებიდან.
      </p>
    );
  }

  return (
    <div>
      {rows.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)", marginBottom: 10 }}>
          ვარიანტები არ არის დამატებული — პროდუქტი ჩვეულებრივ, ვარიანტების გარეშე იმუშავებს.
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row) => {
          const color = allColors.find((c) => c.id === row.colorId);
          return (
            <div key={row.key} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {color?.hexCode && (
                  <S.ColorSwatch type="button" style={{ backgroundColor: color.hexCode, cursor: "default", flexShrink: 0 }} />
                )}
                <S.Input
                  as="select"
                  value={row.colorId}
                  onChange={(e) => updateRow(row.key, { colorId: e.target.value })}
                  style={{ width: 160 }}
                >
                  <option value="">— ფერი —</option>
                  {allColors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryName(c, locale)}
                    </option>
                  ))}
                </S.Input>
              </div>
              <S.Input
                as="select"
                value={row.sizeId}
                onChange={(e) => updateRow(row.key, { sizeId: e.target.value })}
                style={{ width: 220 }}
              >
                <option value="">— ზომა —</option>
                {allSizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getCategoryName(s, locale)}
                  </option>
                ))}
              </S.Input>
              <S.Input
                type="text"
                inputMode="numeric"
                placeholder="მარაგი"
                value={row.stock}
                onChange={(e) => updateRow(row.key, { stock: e.target.value })}
                style={{ width: 90 }}
              />
              <S.Input
                type="text"
                inputMode="decimal"
                placeholder="ფასი (არასავალდებულო)"
                value={row.price}
                onChange={(e) => updateRow(row.key, { price: e.target.value })}
                style={{ width: 150 }}
              />
              <S.ActionButton type="button" variant="danger" onClick={() => removeRow(row.key)}>
                <TrashIcon size={16} />
              </S.ActionButton>
            </div>
          );
        })}
      </div>

      <S.ModalFooter>
        <S.ActionButton type="button" variant="outline" onClick={addRow}>
          + ვარიანტის დამატება
        </S.ActionButton>
        <S.ActionButton type="button" variant="secondary" onClick={() => handleSave()} disabled={saving}>
          {saving ? "ინახება..." : "ვარიანტების შენახვა"}
        </S.ActionButton>
      </S.ModalFooter>
    </div>
  );
});

ProductVariantsForm.displayName = "ProductVariantsForm";

export default ProductVariantsForm;
