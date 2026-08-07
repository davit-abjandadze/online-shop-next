import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/client/models";
import { CloseIcon, EditIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/ui/RefIcons";
import DashboardLayout from "./DashboardLayout";
import * as S from "./style";

export const CategoriesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingC, setLoadingC] = useState<boolean>(true);

  const [isCatCreateOpen, setIsCatCreateOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatDesc, setNewCatDesc] = useState<string>("");
  const [catCreateSubmitting, setCatCreateSubmitting] = useState<boolean>(false);

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState<string>("");
  const [editCatDesc, setEditCatDesc] = useState<string>("");
  const [catEditSubmitting, setCatEditSubmitting] = useState<boolean>(false);

  const fetchCategories = async () => {
    if (!session?.accessToken) return;
    setLoadingC(true);
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll();
      const data = res.data as any;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("კატეგორიების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingC(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role?.toLowerCase() === "admin") {
      fetchCategories();
    }
  }, [status, session]);

  const handleCatCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) { toast.warning("გთხოვთ შეავსოთ კატეგორიის სახელი"); return; }
    setCatCreateSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session!.accessToken!).categoryControllerCreate({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });
      toast.success("კატეგორია წარმატებით დაემატა!");
      setIsCatCreateOpen(false); setNewCatName(""); setNewCatDesc("");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის დამატება ვერ მოხერხდა");
    } finally {
      setCatCreateSubmitting(false);
    }
  };

  const handleOpenEditCat = (cat: Category) => {
    setEditingCat(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
  };

  const handleCatEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !session?.accessToken) return;
    if (!editCatName.trim()) { toast.warning("გთხოვთ შეავსოთ კატეგორიის სახელი"); return; }
    setCatEditSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerUpdate(
        { name: editCatName.trim(), description: editCatDesc.trim() || undefined },
        String(editingCat.id)
      );
      toast.success("კატეგორია წარმატებით განახლდა!");
      setEditingCat(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის განახლება ვერ მოხერხდა");
    } finally {
      setCatEditSubmitting(false);
    }
  };

  const handleDeleteCat = async (catId: number) => {
    if (!window.confirm("ნამდვილად გსურთ კატეგორიის წაშლა?")) return;
    try {
      await CategoriesAPI(router.locale || "ka", session?.accessToken || "").categoryControllerRemove(String(catId));
      toast.success("კატეგორია წარმატებით წაიშალა!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის წაშლა ვერ მოხერხდა");
    }
  };

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები"
      headerAction={
        <S.ActionButton variant="primary" onClick={() => setIsCatCreateOpen(true)}>
          <PlusIcon size={16} /> ახალი კატეგორია
        </S.ActionButton>
      }
    >
      {loadingC ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--ref-text-secondary)" }}>კატეგორიები იტვირთება...</p>
        </div>
      ) : categories.length === 0 ? (
        <S.EmptyState>
          <TagIcon size={48} />
          <S.EmptyTitle>კატეგორიები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი კატეგორია კითხვების გასაჯგუფებლად.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={() => setIsCatCreateOpen(true)}>
            <PlusIcon size={16} /> კატეგორიის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {categories.map((cat) => (
            <S.QuestionCard key={cat.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TagIcon size={18} /> {cat.name}
                  </S.QuestionText>
                  {cat.description && (
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--ref-text-secondary)" }}>{cat.description}</p>
                  )}
                  <S.Badge variant="date" style={{ marginTop: "8px", display: "inline-block" }}>
                    {cat.questions?.length || 0} კითხვა
                  </S.Badge>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEditCat(cat)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => handleDeleteCat(cat.id)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE CATEGORY MODAL ═══════════════════════════════════════════════ */}
      {isCatCreateOpen && (
        <S.ModalOverlay onClick={() => setIsCatCreateOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TagIcon size={18} /> ახალი კატეგორიის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCatCreateOpen(false)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatCreateSubmit}>
              <S.FormGroup>
                <S.Label>კატეგორიის სახელი</S.Label>
                <S.Input type="text" placeholder="მაგ: პოლიტიკა" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>მოკლე აღწერა (არასავალდებულო)</S.Label>
                <S.Input type="text" placeholder="მაგ: პოლიტიკური თემატიკის კითხვები" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCatCreateOpen(false)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catCreateSubmitting}>{catCreateSubmitting ? "ემატება..." : "შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT CATEGORY MODAL ═════════════════════════════════════════════════ */}
      {editingCat && (
        <S.ModalOverlay onClick={() => setEditingCat(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> კატეგორიის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingCat(null)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatEditSubmit}>
              <S.FormGroup>
                <S.Label>კატეგორიის სახელი</S.Label>
                <S.Input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} required />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>მოკლე აღწერა (არასავალდებულო)</S.Label>
                <S.Input type="text" value={editCatDesc} onChange={(e) => setEditCatDesc(e.target.value)} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingCat(null)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catEditSubmitting}>{catEditSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </DashboardLayout>
  );
};

export default CategoriesPage;
