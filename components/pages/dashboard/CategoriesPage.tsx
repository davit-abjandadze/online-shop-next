import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/client/models";
import { CloseIcon, EditIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { CategoryFormValues, categoryFormSchema } from "./schemas";
import * as S from "./style";

const emptyCategoryForm: CategoryFormValues = { name: "", description: "" };

export const CategoriesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingC, setLoadingC] = useState<boolean>(true);

  const [isCatCreateOpen, setIsCatCreateOpen] = useState<boolean>(false);
  const [catCreateSubmitting, setCatCreateSubmitting] = useState<boolean>(false);

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catEditSubmitting, setCatEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryForm,
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryForm,
  });

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
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptyCategoryForm);
    setIsCatCreateOpen(true);
  };

  const handleCatCreateSubmit = createForm.handleSubmit(async (data) => {
    setCatCreateSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session!.accessToken!).categoryControllerCreate({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      });
      toast.success("კატეგორია წარმატებით დაემატა!");
      setIsCatCreateOpen(false);
      createForm.reset(emptyCategoryForm);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის დამატება ვერ მოხერხდა");
    } finally {
      setCatCreateSubmitting(false);
    }
  });

  const handleOpenEditCat = (cat: Category) => {
    setEditingCat(cat);
    editForm.reset({ name: cat.name, description: cat.description || "" });
  };

  const handleCatEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingCat || !session?.accessToken) return;
    setCatEditSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerUpdate(
        String(editingCat.id),
        { name: data.name.trim(), description: data.description?.trim() || undefined }
      );
      toast.success("კატეგორია წარმატებით განახლდა!");
      setEditingCat(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის განახლება ვერ მოხერხდა");
    } finally {
      setCatEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session?.accessToken || "").categoryControllerRemove(String(deleteTarget.id));
      toast.success("კატეგორია წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი კატეგორია
        </S.ActionButton>
      }
    >
      {loadingC ? (
        <ListSkeleton count={3} />
      ) : categories.length === 0 ? (
        <S.EmptyState>
          <TagIcon size={48} />
          <S.EmptyTitle>კატეგორიები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი კატეგორია კითხვების გასაჯგუფებლად.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
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
                    {cat.products?.length || 0} პროდუქტი
                  </S.Badge>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEditCat(cat)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(cat)}>
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
            <form onSubmit={handleCatCreateSubmit} noValidate>
              <S.FormGroup>
                <S.Label>კატეგორიის სახელი</S.Label>
                <S.Input type="text" placeholder="მაგ: პოლიტიკა" {...createForm.register("name")} />
                {createForm.formState.errors.name && <S.FieldError>{createForm.formState.errors.name.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>მოკლე აღწერა (არასავალდებულო)</S.Label>
                <S.Input type="text" placeholder="მაგ: პოლიტიკური თემატიკის კითხვები" {...createForm.register("description")} />
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
            <form onSubmit={handleCatEditSubmit} noValidate>
              <S.FormGroup>
                <S.Label>კატეგორიის სახელი</S.Label>
                <S.Input type="text" {...editForm.register("name")} />
                {editForm.formState.errors.name && <S.FieldError>{editForm.formState.errors.name.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>მოკლე აღწერა (არასავალდებულო)</S.Label>
                <S.Input type="text" {...editForm.register("description")} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingCat(null)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catEditSubmitting}>{catEditSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="კატეგორიის წაშლა"
        description="ნამდვილად გსურთ ამ კატეგორიის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default CategoriesPage;
