import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BranchesAPI, ProductsAPI } from "@/API_Client";
import { ProductBranchItemDto } from "@/API_Client/client/models";
import { Branch, PaginatedResponseDto, ProductBranch, ProductColor, ProductVariant } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

interface ProductBranchesFormProps {
  productId: number | string;
  accessToken: string;
  locale: string;
}

type BranchRowState = { checked: boolean; stock: string };

// dimKey: variant/color dam-პროდუქტების შემთხვევაში variant.id/color.id,
// ბრტყელი (ვარიანტების/ფერების გარეშე) პროდუქტისთვის — "base".
const BASE_DIM_KEY = "base";

type Dim = {
  key: string;
  label: string;
  capStock: number | null; // ვარიანტის/ფერის საერთო stock — ფილიალებზე ჯამი მასზე მეტი არ უნდა იყოს
  variantId?: string;
  colorId?: string;
};

/**
 * პროდუქტზე ფილიალების მიბმა + თითო ფილიალზე ცალკე stock — ProductColorsForm.tsx-ის
 * იგივე bulk-set პატერნი, მაგრამ ვარიანტ/ფერ-ცნობადი: თუ პროდუქტს აქვს
 * ვარიანტები (ფერი+ზომა) ან ფლეთ ფერები, თითო ვარიანტ/ფერზე ცალკე
 * გაიშლება ფილიალების checkbox-სია (ProductBranch.variantId/colorId-ით), რომ
 * checkout-ის pickup-ნაკადმა იცოდეს კონკრეტულად რომელ ფილიალშია კონკრეტული
 * ვარიანტი. ვარიანტების/ფერების არარსებობისას ძველი ბრტყელი რეჟიმი
 * მუშაობს უცვლელად (variantId/colorId არ იგზავნება). ბექენდზე ყველა
 * ფილიალი (admin/all, არააქტიურის ჩათვლით) ჩამოთვლილია — მონიშნულებზე
 * stock input ჩნდება; შენახვისას მთელი პროდუქტის ყველა განზომილების
 * მონაცემი ერთად იგზავნება `PUT /products/:id/branches`-ზე (მთლიანად
 * ანაცვლებს). ეს stock, ProductColor-ისგან განსხვავებით, product.stock-ში
 * არ სინქრონდება — checkout-ის pickup-ნაკადი ცალკე ამოწმებს არჩეულ ფილიალზე.
 */
export const ProductBranchesForm: React.FC<ProductBranchesFormProps> = ({ productId, accessToken, locale }) => {
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [dims, setDims] = useState<Dim[]>([{ key: BASE_DIM_KEY, label: "", capStock: null }]);
  const [rows, setRows] = useState<Record<string, Record<number, BranchRowState>>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, productBranchesRes, variantsResult, colorsResult] = await Promise.all([
        BranchesAPI(locale, accessToken).branchesControllerFindAllAdmin(),
        ProductsAPI(locale, accessToken).productsControllerGetBranches(Number(productId)),
        ProductsAPI(locale, accessToken)
          .productsControllerGetVariants(Number(productId))
          .catch(() => ({ data: [] })),
        ProductsAPI(locale, accessToken)
          .productsControllerGetColors(Number(productId))
          .catch(() => ({ data: [] })),
      ]);
      const branchesData = branchesRes.data as unknown as PaginatedResponseDto<Branch>;
      const branches = Array.isArray(branchesData?.data) ? branchesData.data : [];
      const productBranches = (productBranchesRes.data as unknown as ProductBranch[]) || [];
      const variants = (variantsResult.data as unknown as ProductVariant[]) || [];
      const colors = (colorsResult.data as unknown as ProductColor[]) || [];
      setAllBranches(branches);

      let nextDims: Dim[];
      if (variants.length > 0) {
        nextDims = variants.map((v) => ({
          key: v.id,
          label: [v.color ? getCategoryName(v.color, locale) : null, v.size ? getCategoryName(v.size, locale) : null]
            .filter(Boolean)
            .join(" / "),
          capStock: v.stock,
          variantId: v.id,
        }));
      } else if (colors.length > 0) {
        nextDims = colors.map((c) => ({
          key: c.colorId,
          label: c.color ? getCategoryName(c.color, locale) : c.colorId,
          capStock: c.stock,
          colorId: c.colorId,
        }));
      } else {
        nextDims = [{ key: BASE_DIM_KEY, label: "", capStock: null }];
      }
      setDims(nextDims);
      setExpanded(nextDims.length === 1 ? { [nextDims[0].key]: true } : {});

      const nextRows: Record<string, Record<number, BranchRowState>> = {};
      nextDims.forEach((dim) => {
        const dimRow: Record<number, BranchRowState> = {};
        branches.forEach((branch) => {
          const existing = productBranches.find(
            (pb) =>
              pb.branchId === branch.id &&
              (dim.variantId ? pb.variantId === dim.variantId : dim.colorId ? pb.colorId === dim.colorId : !pb.variantId && !pb.colorId)
          );
          dimRow[branch.id] = existing
            ? { checked: true, stock: String(existing.stock) }
            : { checked: false, stock: "0" };
        });
        nextRows[dim.key] = dimRow;
      });
      setRows(nextRows);
    } catch {
      toast.error("პროდუქტის ფილიალების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const toggleExpanded = (dimKey: string) => setExpanded((prev) => ({ ...prev, [dimKey]: !prev[dimKey] }));

  const toggleBranch = (dimKey: string, branchId: number) =>
    setRows((prev) => ({
      ...prev,
      [dimKey]: {
        ...prev[dimKey],
        [branchId]: { ...prev[dimKey]?.[branchId], checked: !prev[dimKey]?.[branchId]?.checked },
      },
    }));

  const updateStock = (dimKey: string, branchId: number, stock: string) =>
    setRows((prev) => ({
      ...prev,
      [dimKey]: { ...prev[dimKey], [branchId]: { ...prev[dimKey]?.[branchId], stock } },
    }));

  const dimTotal = (dimKey: string) =>
    Object.values(rows[dimKey] || {})
      .filter((s) => s.checked)
      .reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

  const handleSave = async () => {
    const items: ProductBranchItemDto[] = [];

    for (const dim of dims) {
      const dimRows = rows[dim.key] || {};
      const checkedEntries = Object.entries(dimRows).filter(([, state]) => state.checked);

      for (const [, state] of checkedEntries) {
        if (state.stock.trim() === "" || isNaN(Number(state.stock)) || !Number.isInteger(Number(state.stock)) || Number(state.stock) < 0) {
          toast.error("მარაგი უნდა იყოს დადებითი მთელი რიცხვი ყველა მონიშნულ ფილიალზე");
          return;
        }
      }

      const total = checkedEntries.reduce((sum, [, state]) => sum + Number(state.stock), 0);
      if (dim.capStock != null && total > dim.capStock) {
        toast.error(
          `„${dim.label}“-ის ფილიალებზე გადანაწილებული ჯამი (${total}) აღემატება ვარიანტის საერთო მარაგს (${dim.capStock})`
        );
        return;
      }

      checkedEntries.forEach(([branchId, state]) => {
        items.push({
          branchId: Number(branchId),
          stock: Number(state.stock),
          ...(dim.variantId ? { variantId: dim.variantId } : {}),
          ...(dim.colorId ? { colorId: dim.colorId } : {}),
        });
      });
    }

    setSaving(true);
    try {
      await ProductsAPI(locale, accessToken).productsControllerSetBranches(Number(productId), { branches: items });
      toast.success("პროდუქტის ფილიალები წარმატებით შეინახა!");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის ფილიალების შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const isFlat = dims.length === 1 && dims[0].key === BASE_DIM_KEY;

  if (loading) {
    return <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>;
  }

  if (allBranches.length === 0) {
    return (
      <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>
        ფილიალი არ არის — ჯერ დაამატეთ ფილიალი „ფილიალები“ ჩანართიდან.
      </p>
    );
  }

  const renderBranchGrid = (dimKey: string) => (
    <S.CategoryCheckboxGrid>
      {allBranches.map((branch) => {
        const state = rows[dimKey]?.[branch.id] || { checked: false, stock: "0" };
        return (
          <S.CategoryCheckboxItem key={branch.id} checked={state.checked} style={{ alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={state.checked} onChange={() => toggleBranch(dimKey, branch.id)} />
            <span style={{ flex: 1 }}>
              {branch.title}
              {branch.company?.name && (
                <span style={{ color: "var(--ref-text-secondary)" }}> · {branch.company.name}</span>
              )}
            </span>
            {state.checked && (
              <S.Input
                type="text"
                inputMode="numeric"
                placeholder="მარაგი"
                value={state.stock}
                onChange={(e) => updateStock(dimKey, branch.id, e.target.value)}
                style={{ width: 80 }}
              />
            )}
          </S.CategoryCheckboxItem>
        );
      })}
    </S.CategoryCheckboxGrid>
  );

  return (
    <div>
      {isFlat ? (
        renderBranchGrid(BASE_DIM_KEY)
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {dims.map((dim) => {
            const isOpen = !!expanded[dim.key];
            const total = dimTotal(dim.key);
            const overCap = dim.capStock != null && total > dim.capStock;
            return (
              <div key={dim.key} style={{ border: "1px solid var(--ref-border)", borderRadius: 8, padding: 8 }}>
                <div
                  role="button"
                  onClick={() => toggleExpanded(dim.key)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                >
                  <span style={{ fontWeight: 600 }}>{dim.label || "—"}</span>
                  <span style={{ fontSize: 13, color: overCap ? "var(--ref-danger, #d64545)" : "var(--ref-text-secondary)" }}>
                    {total}
                    {dim.capStock != null ? ` / ${dim.capStock}` : ""} {isOpen ? "▲" : "▼"}
                  </span>
                </div>
                {isOpen && <div style={{ marginTop: 8 }}>{renderBranchGrid(dim.key)}</div>}
              </div>
            );
          })}
        </div>
      )}
      <S.ModalFooter>
        <S.ActionButton type="button" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "ინახება..." : "ფილიალების შენახვა"}
        </S.ActionButton>
      </S.ModalFooter>
    </div>
  );
};

export default ProductBranchesForm;
