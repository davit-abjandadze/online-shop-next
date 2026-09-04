import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select, { StylesConfig } from "react-select";
import { HeroSlidesAPI, ProductsAPI } from "@/API_Client";
import { CreateHeroSlideDto, UpdateHeroSlideDto } from "@/API_Client/client/models";
import { HeroSlide, PaginatedResponseDto, Product } from "@/API_Client/types";
import { CloseIcon, EditIcon, PlusIcon, SliderIcon, TrashIcon, UploadIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getCategoryName, getLocalizedTitle } from "@/utils/getCategoryName";
import { uploadImageToImgbb } from "@/utils/uploadImageToImgbb";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import {
  HeroSlideFormValues,
  buildHeroSlideTranslationsDto,
  heroSlideFormSchema,
  readHeroSlideTranslations,
} from "./schemas";
import * as S from "./style";

const emptyHeroSlideForm: HeroSlideFormValues = {
  translations: {
    ka: { eyebrow: "", title: "", description: "", buttonText: "" },
    en: { eyebrow: "", title: "", description: "", buttonText: "" },
    ru: { eyebrow: "", title: "", description: "", buttonText: "" },
  },
  image: "",
  buttonLink: "",
  productId: "",
  isActive: true,
  sortOrder: "0",
};

// სურათის URL-ს CDN-ის საბაზო მისამართთან აერთებს (თუ უკვე absolute არაა) —
// იგივე ლოგიკა, რაც ProductsPage.tsx-შია.
const resolveImage = (url: string) => (url.startsWith("http") ? url : `${CDN_URL}${url}`);

interface ProductOption {
  value: number;
  label: string;
}

/**
 * "მიბმული პროდუქტი"-ის ძებნადი select — ProductSliderItemsForm.tsx-ის
 * იგივე react-select თემასთან შესაბამისობაში მოყვანილი სტილებით, ოღონდ
 * ერთჯერადი (isMulti={false}) არჩევანისთვის.
 */
const productSelectStyles: StylesConfig<ProductOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    borderRadius: 7,
    borderColor: state.isFocused ? "var(--ref-primary)" : "var(--ref-border)",
    background: "var(--ref-bg-elevated)",
    boxShadow: "none",
    fontSize: "12.5px",
    "&:hover": { borderColor: "var(--ref-primary)" },
  }),
  menu: (base) => ({
    ...base,
    background: "var(--ref-bg-elevated)",
    border: "1px solid var(--ref-border)",
    zIndex: 5,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "12.5px",
    background: state.isFocused ? "var(--ref-bg-hover, var(--ref-border))" : "transparent",
    color: "var(--ref-text-primary)",
    cursor: "pointer",
  }),
  input: (base) => ({ ...base, color: "var(--ref-text-primary)" }),
  singleValue: (base) => ({ ...base, color: "var(--ref-text-primary)" }),
  placeholder: (base) => ({ ...base, color: "var(--ref-text-secondary)" }),
};

/**
 * მთავარი გვერდის hero სლაიდერის admin CRUD — სამომავლოდ დინამიური
 * სლაიდერების მართვის ცენტრალური გვერდი. ColorsPage.tsx-ის იგივე
 * create/edit/delete + modal პატერნით, ProductsPage.tsx-ის სურათის
 * ატვირთვის ლოგიკით (uploadImageToImgbb) ერთ სურათზე.
 */
export const HeroSlidesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const [uploadingCreate, setUploadingCreate] = useState<boolean>(false);
  const [uploadingEdit, setUploadingEdit] = useState<boolean>(false);

  const createForm = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideFormSchema),
    defaultValues: emptyHeroSlideForm,
  });

  const editForm = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideFormSchema),
    defaultValues: emptyHeroSlideForm,
  });

  const fetchSlides = async () => {
    if (!session?.accessToken) return;
    setLoadingSlides(true);
    try {
      const res = await HeroSlidesAPI(router.locale || "ka", session.accessToken).heroSlidesControllerFindAllPaginated(
        1,
        100,
        "sortOrder",
        "ASC" as any
      );
      const data = res.data as unknown as PaginatedResponseDto<HeroSlide>;
      setSlides(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("სლაიდების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingSlides(false);
    }
  };

  const fetchProducts = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerFindAll(1, 100);
      const data = res.data as unknown as PaginatedResponseDto<Product>;
      setProducts(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("პროდუქტების სიის ჩატვირთვა ვერ მოხერხდა");
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchSlides();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const toDto = (data: HeroSlideFormValues) => ({
    translations: buildHeroSlideTranslationsDto(data.translations),
    image: data.image.trim(),
    buttonLink: data.buttonLink?.trim() || undefined,
    productId: data.productId ? Number(data.productId) : undefined,
    isActive: data.isActive,
    sortOrder: data.sortOrder?.trim() ? Number(data.sortOrder) : undefined,
  });

  const handleOpenCreate = () => {
    createForm.reset(emptyHeroSlideForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await HeroSlidesAPI(router.locale || "ka", session!.accessToken!).heroSlidesControllerCreate(
        toDto(data) as CreateHeroSlideDto
      );
      toast.success("სლაიდი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyHeroSlideForm);
      fetchSlides();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სლაიდის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    editForm.reset({
      translations: readHeroSlideTranslations(slide.translations),
      image: slide.image || "",
      buttonLink: slide.buttonLink || "",
      productId: slide.product?.id ? String(slide.product.id) : "",
      isActive: slide.isActive,
      sortOrder: String(slide.sortOrder ?? 0),
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingSlide || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await HeroSlidesAPI(router.locale || "ka", session.accessToken).heroSlidesControllerUpdate(
        String(editingSlide.id),
        toDto(data) as UpdateHeroSlideDto
      );
      toast.success("სლაიდი წარმატებით განახლდა!");
      setEditingSlide(null);
      fetchSlides();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სლაიდის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await HeroSlidesAPI(router.locale || "ka", session.accessToken).heroSlidesControllerRemove(String(deleteTarget.id));
      toast.success("სლაიდი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchSlides();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სლაიდის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleFileChange = async (
    form: typeof createForm,
    setUploading: (v: boolean) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToImgbb(file);
      form.setValue("image", url);
    } catch (err: any) {
      toast.error(err?.message || "სურათის ატვირთვა ვერ მოხერხდა");
    } finally {
      setUploading(false);
    }
  };

  const renderSlideFields = (form: typeof createForm, uploading: boolean, setUploading: (v: boolean) => void) => (
    <>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>ზედწარწერა — eyebrow (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: ახალი კოლექცია" {...form.register("translations.ka.eyebrow")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>ზედწარწერა — eyebrow (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. New collection" {...form.register("translations.en.eyebrow")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>ზედწარწერა — eyebrow (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Новая коллекция" {...form.register("translations.ru.eyebrow")} />
        </S.FormGroup>
      </S.FormRow>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>სათაური (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: ზაფხულის ფასდაკლებები" {...form.register("translations.ka.title")} />
          {form.formState.errors.translations?.ka?.title && (
            <S.FieldError>{form.formState.errors.translations.ka.title.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>სათაური (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. Summer sale" {...form.register("translations.en.title")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>სათაური (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Летняя распродажа" {...form.register("translations.ru.title")} />
        </S.FormGroup>
      </S.FormRow>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>აღწერილობა (ქართულად)</S.Label>
          <S.Textarea rows={2} {...form.register("translations.ka.description")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>აღწერილობა (ინგლისურად)</S.Label>
          <S.Textarea rows={2} {...form.register("translations.en.description")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>აღწერილობა (რუსულად)</S.Label>
          <S.Textarea rows={2} {...form.register("translations.ru.description")} />
        </S.FormGroup>
      </S.FormRow>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>ღილაკის ტექსტი (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: ნახეთ მეტი" {...form.register("translations.ka.buttonText")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>ღილაკის ტექსტი (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. See more" {...form.register("translations.en.buttonText")} />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>ღილაკის ტექსტი (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Подробнее" {...form.register("translations.ru.buttonText")} />
        </S.FormGroup>
      </S.FormRow>

      <S.FormGroup>
        <S.Label>სურათი</S.Label>
        <S.ImageRow>
          <S.ImageThumb>
            {form.watch("image") ? <img src={resolveImage(form.watch("image"))} alt="" /> : <SliderIcon size={16} />}
          </S.ImageThumb>
          <S.Input type="text" placeholder="https://.../slide.jpg" {...form.register("image")} />
          <S.UploadImageLabel disabled={uploading} title="ატვირთვა კომპიუტერიდან">
            {uploading ? "…" : <UploadIcon size={16} />}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(e) => handleFileChange(form, setUploading, e)}
            />
          </S.UploadImageLabel>
        </S.ImageRow>
        {form.formState.errors.image && <S.FieldError>{form.formState.errors.image.message}</S.FieldError>}
      </S.FormGroup>

      <S.FormRow>
        <S.FormGroup>
          <S.Label>მიბმული პროდუქტი (არასავალდებულო)</S.Label>
          <Controller
            control={form.control}
            name="productId"
            render={({ field }) => {
              const options: ProductOption[] = products.map((p) => ({
                value: p.id,
                label: getCategoryName(p, "ka"),
              }));
              const selected = options.find((o) => String(o.value) === field.value) || null;
              return (
                <Select<ProductOption, false>
                  isClearable
                  isSearchable
                  options={options}
                  value={selected}
                  onChange={(option) => field.onChange(option ? String(option.value) : "")}
                  placeholder="— პროდუქტის ძიება —"
                  noOptionsMessage={() => "პროდუქტი ვერ მოიძებნა"}
                  styles={productSelectStyles}
                />
              );
            }}
          />
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>ღილაკის ლინკი (არასავალდებულო)</S.Label>
          <S.Input type="text" placeholder="/products/12 ან https://..." {...form.register("buttonLink")} />
          {form.formState.errors.buttonLink && <S.FieldError>{form.formState.errors.buttonLink.message}</S.FieldError>}
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--ref-text-secondary)" }}>
            თუ პროდუქტი მითითებულია და ლინკი ცარიელია, ღილაკი ავტომატურად პროდუქტის გვერდზე გადადის.
          </p>
        </S.FormGroup>
      </S.FormRow>

      <S.FormRow>
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
      subtitle="მართეთ მთავარი გვერდის hero სლაიდერის სლაიდები"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი სლაიდი
        </S.ActionButton>
      }
    >
      {loadingSlides ? (
        <ListSkeleton count={3} />
      ) : slides.length === 0 ? (
        <S.EmptyState>
          <SliderIcon size={48} />
          <S.EmptyTitle>სლაიდები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი სლაიდი მთავარი გვერდის hero სლაიდერისთვის.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> სლაიდის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {slides.map((slide) => (
            <S.QuestionCard key={slide.id}>
              <S.CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <S.ImageThumb>
                    {slide.image ? <img src={resolveImage(slide.image)} alt="" /> : <SliderIcon size={16} />}
                  </S.ImageThumb>
                  <div>
                    <S.QuestionText>{getLocalizedTitle(slide, "ka")}</S.QuestionText>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                      {slide.product && `მიბმული: ${getCategoryName(slide.product, "ka")} · `}
                      დალაგება: {slide.sortOrder}
                    </p>
                    <S.BadgeGroup style={{ marginTop: "8px" }}>
                      <S.Badge variant={slide.isActive ? "active" : "inactive"}>
                        {slide.isActive ? "აქტიური" : "არააქტიური"}
                      </S.Badge>
                    </S.BadgeGroup>
                  </div>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(slide)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(slide)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE SLIDE MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SliderIcon size={18} /> ახალი სლაიდის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              {renderSlideFields(createForm, uploadingCreate, setUploadingCreate)}
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

      {/* ═══ EDIT SLIDE MODAL ═════════════════════════════════════════════════ */}
      {editingSlide && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingSlide(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> სლაიდის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingSlide(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              {renderSlideFields(editForm, uploadingEdit, setUploadingEdit)}
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingSlide(null)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="სლაიდის წაშლა"
        description="ნამდვილად გსურთ ამ სლაიდის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default HeroSlidesPage;
