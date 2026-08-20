import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductsAPI, CategoriesAPI } from "@/API_Client";
import { Category, Product } from "@/API_Client/client/models";
import { PaginatedResponseDto } from "@/API_Client/types";
import { BoxIcon, CloseIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { ProductFormValues, productFormSchema } from "./schemas";
import * as S from "./style";

const PAGE_SIZE = 10;

const emptyProductForm: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  images: "",
  isActive: true,
};

const toFormValues = (p: Product): ProductFormValues => ({
  name: p.name,
  description: p.description || "",
  price: String(p.price),
  stock: String(p.stock),
  categoryId: p.category?.id != null ? String(p.category.id) : "",
  images: (p.images || []).join(", "),
  isActive: p.isActive,
});

// ფორმის მნიშვნელობებს ბექენდის Create/UpdateProductDto-ს ფორმაში გარდაქმნის —
// images კომა-გამოყოფილი სტრინგიდან მასივში, ცარიელი categoryId/images კი undefined-ში.
const toDto = (data: ProductFormValues) => ({
  name: data.name.trim(),
  description: data.description?.trim() || undefined,
  price: Number(data.price),
  stock: Number(data.stock),
  categoryId: data.categoryId ? Number(data.categoryId) : undefined,
  images: data.images
    ? data.images.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined,
  isActive: data.isActive,
});

export const ProductsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProductForm,
  });

  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProductForm,
  });

  const fetchProducts = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerFindAll(
        page,
        PAGE_SIZE
      );
      const data = res.data as unknown as PaginatedResponseDto<Product>;
      setProducts(Array.isArray(data?.data) ? data.data : []);
      setTotalPages(data?.meta?.totalPages || 1);
    } catch {
      toast.error("პროდუქტების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll();
      const data = res.data as unknown as Category[];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // კატეგორიები არასავალდებულოა ფორმისთვის (categoryId ველი optional-ია)
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, page]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptyProductForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    if (!session?.accessToken) return;
    setCreateSubmitting(true);
    try {
      await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerCreate(toDto(data));
      toast.success("პროდუქტი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyProductForm);
      setPage(1);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    editForm.reset(toFormValues(product));
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingProduct || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerUpdate(
        String(editingProduct.id),
        toDto(data)
      );
      toast.success("პროდუქტი წარმატებით განახლდა!");
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerRemove(String(deleteTarget.id));
      toast.success("პროდუქტი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderForm = (form: typeof createForm, onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>, submitting: boolean, submitLabel: string) => (
    <form onSubmit={onSubmit} noValidate>
      <S.FormGroup>
        <S.Label>დასახელება</S.Label>
        <S.Input type="text" placeholder="მაგ: უსადენო ყურსასმენი" {...form.register("name")} />
        {form.formState.errors.name && <S.FieldError>{form.formState.errors.name.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>აღწერა (არასავალდებულო)</S.Label>
        <S.Textarea rows={3} {...form.register("description")} />
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>ფასი</S.Label>
        <S.Input type="text" inputMode="decimal" placeholder="მაგ: 149.90" {...form.register("price")} />
        {form.formState.errors.price && <S.FieldError>{form.formState.errors.price.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>მარაგი</S.Label>
        <S.Input type="text" inputMode="numeric" placeholder="მაგ: 25" {...form.register("stock")} />
        {form.formState.errors.stock && <S.FieldError>{form.formState.errors.stock.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>კატეგორია</S.Label>
        <S.Select {...form.register("categoryId")}>
          <option value="">— კატეგორიის გარეშე —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </S.Select>
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>სურათების URL-ები (მძიმით გამოყოფილი, არასავალდებულო)</S.Label>
        <S.Input type="text" placeholder="https://.../1.jpg, https://.../2.jpg" {...form.register("images")} />
      </S.FormGroup>
      <S.CategoryCheckboxItem checked={form.watch("isActive")}>
        <input type="checkbox" {...form.register("isActive")} /> აქტიურია (გამოჩნდება კატალოგში)
      </S.CategoryCheckboxItem>
      <S.ModalFooter>
        <S.ActionButton type="button" variant="secondary" onClick={() => { setIsCreateOpen(false); setEditingProduct(null); }}>
          გაუქმება
        </S.ActionButton>
        <S.ActionButton type="submit" variant="primary" disabled={submitting}>
          {submitting ? "ინახება..." : submitLabel}
        </S.ActionButton>
      </S.ModalFooter>
    </form>
  );

  return (
    <DashboardLayout
      title="პროდუქტები"
      subtitle="მართეთ მაღაზიის პროდუქტების კატალოგი"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი პროდუქტი
        </S.ActionButton>
      }
    >
      {loading ? (
        <ListSkeleton count={PAGE_SIZE} />
      ) : products.length === 0 ? (
        <S.EmptyState>
          <BoxIcon size={48} />
          <S.EmptyTitle>პროდუქტები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი პროდუქტი კატალოგისთვის.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> პროდუქტის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <>
          <S.QuestionsList>
            {products.map((product) => (
              <S.QuestionCard key={product.id}>
                <S.CardHeader>
                  <div>
                    <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BoxIcon size={18} /> {product.name}
                    </S.QuestionText>
                    <S.BadgeGroup>
                      <S.Badge variant={product.isActive ? "active" : "inactive"}>
                        {product.isActive ? "აქტიური" : "არააქტიური"}
                      </S.Badge>
                      <S.Badge variant="date">{Number(product.price).toFixed(2)} ₾</S.Badge>
                      <S.Badge variant="date">მარაგი: {product.stock}</S.Badge>
                      {product.category && <S.Badge variant="date">{product.category.name}</S.Badge>}
                    </S.BadgeGroup>
                  </div>
                  <S.CardActions>
                    <S.ActionButton variant="outline" onClick={() => handleOpenEdit(product)}>
                      <EditIcon size={16} /> რედაქტირება
                    </S.ActionButton>
                    <S.ActionButton variant="danger" onClick={() => setDeleteTarget(product)}>
                      <TrashIcon size={16} /> წაშლა
                    </S.ActionButton>
                  </S.CardActions>
                </S.CardHeader>
              </S.QuestionCard>
            ))}
          </S.QuestionsList>

          {totalPages > 1 && (
            <S.PaginationBar>
              <S.PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                ←
              </S.PageButton>
              <S.PageNumbers>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <S.PageNumberButton key={n} active={n === page} onClick={() => setPage(n)}>
                    {n}
                  </S.PageNumberButton>
                ))}
              </S.PageNumbers>
              <S.PageButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                →
              </S.PageButton>
            </S.PaginationBar>
          )}
        </>
      )}

      {isCreateOpen && (
        <S.ModalOverlay onClick={() => setIsCreateOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BoxIcon size={18} /> ახალი პროდუქტის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            {renderForm(createForm, handleCreateSubmit, createSubmitting, "შენახვა")}
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {editingProduct && (
        <S.ModalOverlay onClick={() => setEditingProduct(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> პროდუქტის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingProduct(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            {renderForm(editForm, handleEditSubmit, editSubmitting, "ცვლილებების შენახვა")}
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="პროდუქტის წაშლა"
        description="ნამდვილად გსურთ ამ პროდუქტის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default ProductsPage;
