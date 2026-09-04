import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSlidersAPI, ProductsAPI } from "@/API_Client";
import { CreateProductSliderDto, UpdateProductSliderDto } from "@/API_Client/client/models";
import { PaginatedResponseDto, Product, ProductSlider } from "@/API_Client/types";
import { CloseIcon, EditIcon, GridThreeIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getLocalizedTitle } from "@/utils/getCategoryName";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import ProductSliderItemsForm from "./ProductSliderItemsForm";
import {
  ProductSliderFormValues,
  buildProductSliderTranslationsDto,
  productSliderFormSchema,
  readProductSliderTranslations,
} from "./schemas";
import * as S from "./style";

const emptyProductSliderForm: ProductSliderFormValues = {
  key: "",
  translations: {
    ka: { title: "", viewAllText: "" },
    en: { title: "", viewAllText: "" },
    ru: { title: "", viewAllText: "" },
  },
  viewAllLink: "",
  isActive: true,
  sortOrder: "0",
};

/**
 * პროდუქტების სლაიდერების (product-sliders) ბლოკების admin CRUD —
 * ნებისმიერ გვერდზე `key`-ით ჩასაშენებელი "სათაური + პროდუქტების სლაიდერი"
 * ბლოკების მართვის ცენტრალური გვერდი. HeroSlidesPage.tsx-ის იგივე
 * create/edit/delete + modal პატერნით, დამატებული "ბლოკის პროდუქტების"
 * სექციით (ProductSliderItemsForm — მხოლოდ არსებულ ბლოკზე, PUT .../items).
 */
export const ProductSlidersPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [sliders, setSliders] = useState<ProductSlider[]>([]);
  const [loadingSliders, setLoadingSliders] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingSlider, setEditingSlider] = useState<ProductSlider | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<ProductSlider | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<ProductSliderFormValues>({
    resolver: zodResolver(productSliderFormSchema),
    defaultValues: emptyProductSliderForm,
  });

  const editForm = useForm<ProductSliderFormValues>({
    resolver: zodResolver(productSliderFormSchema),
    defaultValues: emptyProductSliderForm,
  });

  const fetchSliders = async () => {
    if (!session?.accessToken) return;
    setLoadingSliders(true);
    try {
      const res = await ProductSlidersAPI(
        router.locale || "ka",
        session.accessToken
      ).productSlidersControllerFindAllPaginated(1, 100, "sortOrder", "ASC" as any);
      const data = res.data as unknown as PaginatedResponseDto<ProductSlider>;
      setSliders(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("ბლოკების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingSliders(false);
    }
  };

  const fetchProducts = async () => {
    if (!session?.accessToken) return;
    try {
      // limit მაქსიმუმ 100-ია ბექენდზე (PaginationDto @Max(100)) — 200-ით
      // მოთხოვნა 400-ს აბრუნებდა და პროდუქტების სია ცარიელი რჩებოდა (ამიტომ
      // ერთი დიდი გვერდის მაგივრად ყველა გვერდი ვიტვირთავთ თანმიმდევრულად).
      const api = ProductsAPI(router.locale || "ka", session.accessToken);
      const all: Product[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await api.productsControllerFindAll(page, 100);
        const data = res.data as unknown as PaginatedResponseDto<Product>;
        all.push(...(Array.isArray(data?.data) ? data.data : []));
        totalPages = data?.meta?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);
      setProducts(all);
    } catch {
      toast.error("პროდუქტების სიის ჩატვირთვა ვერ მოხერხდა");
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchSliders();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const toDto = (data: ProductSliderFormValues) => ({
    key: data.key.trim(),
    translations: buildProductSliderTranslationsDto(data.translations),
    viewAllLink: data.viewAllLink?.trim() || undefined,
    isActive: data.isActive,
    sortOrder: data.sortOrder?.trim() ? Number(data.sortOrder) : undefined,
  });

  const handleOpenCreate = () => {
    createForm.reset(emptyProductSliderForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await ProductSlidersAPI(router.locale || "ka", session!.accessToken!).productSlidersControllerCreate(
        toDto(data) as CreateProductSliderDto
      );
      toast.success("ბლოკი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyProductSliderForm);
      fetchSliders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ბლოკის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (slider: ProductSlider) => {
    setEditingSlider(slider);
    editForm.reset({
      key: slider.key,
      translations: readProductSliderTranslations(slider.translations),
      viewAllLink: slider.viewAllLink || "",
      isActive: slider.isActive,
      sortOrder: String(slider.sortOrder ?? 0),
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingSlider || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await ProductSlidersAPI(router.locale || "ka", session.accessToken).productSlidersControllerUpdate(
        editingSlider.id,
        toDto(data) as UpdateProductSliderDto
      );
      toast.success("ბლოკი წარმატებით განახლდა!");
      setEditingSlider(null);
      fetchSliders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ბლოკის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await ProductSlidersAPI(router.locale || "ka", session.accessToken).productSlidersControllerRemove(
        deleteTarget.id
      );
      toast.success("ბლოკი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchSliders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ბლოკის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderSliderFields = (form: typeof createForm, disableKey?: boolean) => (
    <>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>key (ლათინურად, უნიკალური)</S.Label>
          <S.Input type="text" placeholder="მაგ: home-featured" disabled={disableKey} {...form.register("key")} />
          {form.formState.errors.key && <S.FieldError>{form.formState.errors.key.message}</S.FieldError>}
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--ref-text-secondary)" }}>
            ამ key-ით frontend-ი ბლოკს ნებისმიერ გვერდზე ჩაშენებს — შექმნის შემდეგ შეცვლა არ არის რეკომენდებული.
          </p>
        </S.FormGroup>
      </S.FormRow>

      <S.FormRow>
        <S.FormGroup>
          <S.Label>სათაური (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: რჩეული პროდუქტები" {...form.register("translations.ka.title")} />
          {form.formState.errors.translations?.ka?.title && (
            <S.FieldError>{form.formState.errors.translations.ka.title.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>სათაური (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. Featured products" {...form.register("translations.en.title")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>სათაური (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Избранные товары" {...form.register("translations.ru.title")} />
        </S.FormGroup>
      </S.FormRow>

      <S.FormRow>
        <S.FormGroup>
          <S.Label>„ყველას ნახვა“ ტექსტი (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: ყველას ნახვა" {...form.register("translations.ka.viewAllText")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>„ყველას ნახვა“ ტექსტი (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. View all" {...form.register("translations.en.viewAllText")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>„ყველას ნახვა“ ტექსტი (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Смотреть все" {...form.register("translations.ru.viewAllText")} />
        </S.FormGroup>
      </S.FormRow>

      <S.FormRow>
        <S.FormGroup>
          <S.Label>„ყველას ნახვა“ ღილაკის ლინკი (არასავალდებულო)</S.Label>
          <S.Input type="text" placeholder="/categories/some-slug" {...form.register("viewAllLink")} />
          {form.formState.errors.viewAllLink && <S.FieldError>{form.formState.errors.viewAllLink.message}</S.FieldError>}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>დალაგების რიგი (sortOrder)</S.Label>
          <S.Input type="text" placeholder="0" {...form.register("sortOrder")} />
          {form.formState.errors.sortOrder && <S.FieldError>{form.formState.errors.sortOrder.message}</S.FieldError>}
        </S.FormGroup>
      </S.FormRow>
      <S.CategoryCheckboxItem checked={form.watch("isActive")}>
        <input type="checkbox" {...form.register("isActive")} /> აქტიურია
      </S.CategoryCheckboxItem>
    </>
  );

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ პროდუქტების სლაიდერების ბლოკები — ჩასაშენებელი ნებისმიერ გვერდზე, key-ით"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი ბლოკი
        </S.ActionButton>
      }
    >
      {loadingSliders ? (
        <ListSkeleton count={3} />
      ) : sliders.length === 0 ? (
        <S.EmptyState>
          <GridThreeIcon size={48} />
          <S.EmptyTitle>ბლოკები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი პროდუქტების სლაიდერის ბლოკი.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> ბლოკის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {sliders.map((slider) => (
            <S.QuestionCard key={slider.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText>{getLocalizedTitle(slider, "ka")}</S.QuestionText>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                    key: {slider.key} · პროდუქტები: {slider.items?.length ?? 0} · დალაგება: {slider.sortOrder}
                  </p>
                  <S.BadgeGroup style={{ marginTop: "8px" }}>
                    <S.Badge variant={slider.isActive ? "active" : "inactive"}>
                      {slider.isActive ? "აქტიური" : "არააქტიური"}
                    </S.Badge>
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(slider)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(slider)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE BLOCK MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GridThreeIcon size={18} /> ახალი ბლოკის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              {renderSliderFields(createForm)}
              <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                ბლოკის პროდუქტების დამატება შენახვის შემდეგ, რედაქტირების ფანჯარაში იქნება შესაძლებელი.
              </p>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={createSubmitting}>
                  {createSubmitting ? "ემატება..." : "შენახვა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT BLOCK MODAL ═════════════════════════════════════════════════ */}
      {editingSlider && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingSlider(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> ბლოკის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingSlider(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              {renderSliderFields(editForm, true)}
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingSlider(null)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>

            <S.Label style={{ display: "block", marginTop: 20 }}>ბლოკის პროდუქტები</S.Label>
            {session?.accessToken && (
              <ProductSliderItemsForm
                sliderId={editingSlider.id}
                accessToken={session.accessToken}
                locale={router.locale || "ka"}
                initialItems={editingSlider.items || []}
                allProducts={products}
              />
            )}
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="ბლოკის წაშლა"
        description="ნამდვილად გსურთ ამ ბლოკის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default ProductSlidersPage;
