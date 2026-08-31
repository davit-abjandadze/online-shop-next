import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BranchesAPI, ProductsAPI } from "@/API_Client";
import { ProductBranchItemDto } from "@/API_Client/client/models";
import { Branch, ProductBranch } from "@/API_Client/types";
import * as S from "./style";

interface ProductBranchesFormProps {
  productId: number | string;
  accessToken: string;
  locale: string;
}

type BranchRowState = { checked: boolean; stock: string };

/**
 * პროდუქტზე ფილიალების მიბმა + თითო ფილიალზე ცალკე stock —
 * ProductColorsForm.tsx-ის იგივე bulk-set პატერნი (თავადვე იტვირთება/ინახება,
 * productId-ის გარდა კონტექსტი არ სჭირდება). ბექენდზე ყველა ფილიალი (admin/all,
 * არააქტიურის ჩათვლით) ჩამოთვლილია checkbox-ით — მონიშნულებზე stock input
 * ჩნდება; შენახვისას მხოლოდ მონიშნული ფილიალები იგზავნება
 * `PUT /products/:id/branches`-ზე (ცარიელი მასივი — ყველა ფილიალის მოხსნა).
 * ეს stock, ProductColor-ისგან განსხვავებით, product.stock-ში არ სინქრონდება —
 * checkout-ის pickup-ნაკადი ცალკე ამოწმებს არჩეულ ფილიალზე.
 */
export const ProductBranchesForm: React.FC<ProductBranchesFormProps> = ({ productId, accessToken, locale }) => {
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [rows, setRows] = useState<Record<number, BranchRowState>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, productBranchesRes] = await Promise.all([
        BranchesAPI(locale, accessToken).branchesControllerFindAllAdmin(),
        ProductsAPI(locale, accessToken).productsControllerGetBranches(String(productId)),
      ]);
      const branches = (branchesRes.data as unknown as Branch[]) || [];
      const productBranches = (productBranchesRes.data as unknown as ProductBranch[]) || [];
      setAllBranches(branches);

      const next: Record<number, BranchRowState> = {};
      branches.forEach((branch) => {
        const existing = productBranches.find((pb) => pb.branchId === branch.id);
        next[branch.id] = existing
          ? { checked: true, stock: String(existing.stock) }
          : { checked: false, stock: "0" };
      });
      setRows(next);
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

  const toggleBranch = (branchId: number) =>
    setRows((prev) => ({ ...prev, [branchId]: { ...prev[branchId], checked: !prev[branchId]?.checked } }));

  const updateStock = (branchId: number, stock: string) =>
    setRows((prev) => ({ ...prev, [branchId]: { ...prev[branchId], stock } }));

  const handleSave = async () => {
    const checkedEntries = Object.entries(rows).filter(([, state]) => state.checked);

    for (const [, state] of checkedEntries) {
      if (state.stock.trim() === "" || isNaN(Number(state.stock)) || !Number.isInteger(Number(state.stock)) || Number(state.stock) < 0) {
        toast.error("მარაგი უნდა იყოს დადებითი მთელი რიცხვი ყველა მონიშნულ ფილიალზე");
        return;
      }
    }

    const items: ProductBranchItemDto[] = checkedEntries.map(([branchId, state]) => ({
      branchId: Number(branchId),
      stock: Number(state.stock),
    }));

    setSaving(true);
    try {
      await ProductsAPI(locale, accessToken).productsControllerSetBranches(String(productId), { branches: items });
      toast.success("პროდუქტის ფილიალები წარმატებით შეინახა!");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის ფილიალების შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div>
      <S.CategoryCheckboxGrid>
        {allBranches.map((branch) => {
          const state = rows[branch.id] || { checked: false, stock: "0" };
          return (
            <S.CategoryCheckboxItem key={branch.id} checked={state.checked} style={{ alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={state.checked} onChange={() => toggleBranch(branch.id)} />
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
                  onChange={(e) => updateStock(branch.id, e.target.value)}
                  style={{ width: 80 }}
                />
              )}
            </S.CategoryCheckboxItem>
          );
        })}
      </S.CategoryCheckboxGrid>
      <S.ModalFooter>
        <S.ActionButton type="button" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "ინახება..." : "ფილიალების შენახვა"}
        </S.ActionButton>
      </S.ModalFooter>
    </div>
  );
};

export default ProductBranchesForm;
