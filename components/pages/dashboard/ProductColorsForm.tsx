import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ColorsAPI, ProductsAPI } from "@/API_Client";
import { ProductColorItemDto } from "@/API_Client/client/models";
import { Color, ProductColor } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

interface ProductColorsFormProps {
  productId: number | string;
  accessToken: string;
  locale: string;
}

type ColorRowState = { checked: boolean; stock: string };

/**
 * პროდუქტზე ფერების მიბმა + თითო ფერზე ცალკე stock — bulk-set პატერნი
 * (AdditionalInfoForm.tsx-ის მსგავსად თავადვე იტვირთება/ინახება, productId-ის
 * გარდა კონტექსტი არ სჭირდება). ბიბლიოთეკის ყველა ფერი ჩამოთვლილია
 * checkbox-ით — მონიშნულებზე stock input ჩნდება; შენახვისას მხოლოდ
 * მონიშნული ფერები იგზავნება `PUT /products/:id/colors`-ზე (ცარიელი
 * მასივი — ყველა ფერის მოხსნა).
 */
export const ProductColorsForm: React.FC<ProductColorsFormProps> = ({ productId, accessToken, locale }) => {
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [rows, setRows] = useState<Record<string, ColorRowState>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colorsRes, productColorsRes] = await Promise.all([
        ColorsAPI(locale, accessToken).colorsControllerFindAll(),
        ProductsAPI(locale, accessToken).productsControllerGetColors(String(productId)),
      ]);
      const colors = (colorsRes.data as unknown as Color[]) || [];
      const productColors = (productColorsRes.data as unknown as ProductColor[]) || [];
      setAllColors(colors);

      const next: Record<string, ColorRowState> = {};
      colors.forEach((color) => {
        const existing = productColors.find((pc) => pc.colorId === color.id);
        next[color.id] = existing
          ? { checked: true, stock: String(existing.stock) }
          : { checked: false, stock: "0" };
      });
      setRows(next);
    } catch {
      toast.error("პროდუქტის ფერების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const toggleColor = (colorId: string) =>
    setRows((prev) => ({ ...prev, [colorId]: { ...prev[colorId], checked: !prev[colorId]?.checked } }));

  const updateStock = (colorId: string, stock: string) =>
    setRows((prev) => ({ ...prev, [colorId]: { ...prev[colorId], stock } }));

  const handleSave = async () => {
    const checkedEntries = Object.entries(rows).filter(([, state]) => state.checked);

    for (const [, state] of checkedEntries) {
      if (state.stock.trim() === "" || isNaN(Number(state.stock)) || !Number.isInteger(Number(state.stock)) || Number(state.stock) < 0) {
        toast.error("მარაგი უნდა იყოს დადებითი მთელი რიცხვი ყველა მონიშნულ ფერზე");
        return;
      }
    }

    const items: ProductColorItemDto[] = checkedEntries.map(([colorId, state]) => ({
      colorId,
      stock: Number(state.stock),
    }));

    setSaving(true);
    try {
      await ProductsAPI(locale, accessToken).productsControllerSetColors(String(productId), { colors: items });
      toast.success("პროდუქტის ფერები წარმატებით შეინახა!");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის ფერების შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>;
  }

  if (allColors.length === 0) {
    return (
      <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>
        ფერების ბიბლიოთეკა ცარიელია — ჯერ დაამატეთ ფერები „ფერები“ ჩანართიდან.
      </p>
    );
  }

  return (
    <div>
      <S.CategoryCheckboxGrid>
        {allColors.map((color) => {
          const state = rows[color.id] || { checked: false, stock: "0" };
          return (
            <S.CategoryCheckboxItem key={color.id} checked={state.checked} style={{ alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={state.checked} onChange={() => toggleColor(color.id)} />
              {color.hexCode && <S.ColorSwatch type="button" style={{ backgroundColor: color.hexCode, cursor: "default", flexShrink: 0 }} />}
              <span style={{ flex: 1 }}>{getCategoryName(color, locale)}</span>
              {state.checked && (
                <S.Input
                  type="text"
                  inputMode="numeric"
                  placeholder="მარაგი"
                  value={state.stock}
                  onChange={(e) => updateStock(color.id, e.target.value)}
                  style={{ width: 80 }}
                />
              )}
            </S.CategoryCheckboxItem>
          );
        })}
      </S.CategoryCheckboxGrid>
      <S.ModalFooter>
        <S.ActionButton type="button" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "ინახება..." : "ფერების შენახვა"}
        </S.ActionButton>
      </S.ModalFooter>
    </div>
  );
};

export default ProductColorsForm;
