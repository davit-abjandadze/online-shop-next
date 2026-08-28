import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductsAPI, CategoriesAPI } from "@/API_Client";
import { Category, Product, ProductAttributeValueItemDto } from "@/API_Client/client/models";
import { ProductsControllerFindAllOrderEnum } from "@/API_Client/client/apis/products-api";
import { CategoryAttribute, PaginatedResponseDto, ProductAttributeValue } from "@/API_Client/types";
import { BoxIcon, CheckSquareIcon, ClipboardIcon, CloseIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getCategoryName } from "@/utils/getCategoryName";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import DynamicAttributeForm from "./DynamicAttributeForm";
import { ProductFormValues, productFormSchema } from "./schemas";
import * as S from "./style";

const PAGE_SIZE = 10;

const emptyProductForm: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock: "",
  discountPercent: "",
  categoryId: "",
  images: [],
  videoUrl: "",
  isActive: true,
};

const toFormValues = (p: Product): ProductFormValues => ({
  name: p.name,
  description: p.description || "",
  price: String(p.price),
  stock: String(p.stock),
  discountPercent: p.discountPercent != null ? String(p.discountPercent) : "",
  categoryId: p.category?.id || "",
  images: p.images || [],
  videoUrl: p.videoUrl || "",
  isActive: p.isActive,
});

// ფორმის მნიშვნელობებს ბექენდის Create/UpdateProductDto-ს ფორმაში გარდაქმნის —
// ცარიელი/გაწმენდილი images მწკრივები ცარიელდება, ცარიელი categoryId/images/videoUrl კი undefined-ში.
const toDto = (data: ProductFormValues) => {
  const images = (data.images || []).map((url) => url.trim()).filter(Boolean);
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    price: Number(data.price),
    stock: Number(data.stock),
    discountPercent: data.discountPercent?.trim() ? Number(data.discountPercent) : undefined,
    categoryId: data.categoryId || undefined,
    images: images.length ? images : undefined,
    videoUrl: data.videoUrl?.trim() || undefined,
    isActive: data.isActive,
  };
};

// სურათის URL-ს CDN-ის საბაზო მისამართთან აერთებს (თუ უკვე absolute არაა) —
// იგივე ლოგიკა, რაც productDetail-ის გალერეაშია.
const resolveImage = (url: string) => (url.startsWith("http") ? url : `${CDN_URL}${url}`);

// კატეგორიის სახელს იერარქიის სიღრმის მიხედვით შეწევს (ერთი დონე root-ის
// ქვეშ) — /categories?page=1&limit=100-ის ბრტყელ სიაშიც parent ველი
// მოდის, ამიტომ select-ში ქვეკატეგორია მშობლის ქვემოთ ცხადად ჩანს.
const categoryOptionLabel = (cat: Category, locale?: string) =>
  (cat.parent ? "— " : "") + getCategoryName(cat, locale);

export const ProductsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // ─── ძიება/ფილტრები ────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [filterIsActive, setFilterIsActive] = useState<string>("");
  const [minPriceText, setMinPriceText] = useState<string>("");
  const [maxPriceText, setMaxPriceText] = useState<string>("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<string>("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<string>("");
  const [filterHasDiscount, setFilterHasDiscount] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("createdAt");
  const [filterOrder, setFilterOrder] = useState<string>("DESC");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPriceText.trim());
      setDebouncedMaxPrice(maxPriceText.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [minPriceText, maxPriceText]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filterCategoryId,
    filterIsActive,
    debouncedMinPrice,
    debouncedMaxPrice,
    filterHasDiscount,
    filterSortBy,
    filterOrder,
  ]);

  const hasActiveFilters =
    debouncedSearch !== "" ||
    filterCategoryId !== "" ||
    filterIsActive !== "" ||
    debouncedMinPrice !== "" ||
    debouncedMaxPrice !== "" ||
    filterHasDiscount !== "" ||
    filterSortBy !== "createdAt" ||
    filterOrder !== "DESC";

  const handleResetFilters = () => {
    setSearchText("");
    setFilterCategoryId("");
    setFilterIsActive("");
    setMinPriceText("");
    setMaxPriceText("");
    setFilterHasDiscount("");
    setFilterSortBy("createdAt");
    setFilterOrder("DESC");
    setPage(1);
  };

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // ─── Product ↔ Attribute values (მხოლოდ edit-ისთვის, productId-ს მოითხოვს) ──
  const [editCategoryAttrs, setEditCategoryAttrs] = useState<CategoryAttribute[]>([]);
  const [editAttrValues, setEditAttrValues] = useState<ProductAttributeValue[]>([]);
  const [attrsLoading, setAttrsLoading] = useState<boolean>(false);
  const [attrsSaving, setAttrsSaving] = useState<boolean>(false);

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
        PAGE_SIZE,
        filterSortBy || undefined,
        (filterOrder || undefined) as ProductsControllerFindAllOrderEnum | undefined,
        debouncedSearch || undefined,
        filterCategoryId || undefined,
        debouncedMinPrice === "" ? undefined : Number(debouncedMinPrice),
        debouncedMaxPrice === "" ? undefined : Number(debouncedMaxPrice),
        filterIsActive === "" ? undefined : filterIsActive === "true",
        filterHasDiscount === "" ? undefined : filterHasDiscount === "true"
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
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll(1, 100);
      const data = res.data as unknown as PaginatedResponseDto<Category>;
      setCategories(Array.isArray(data?.data) ? data.data : []);
    } catch {
      // კატეგორიები არასავალდებულოა ფორმისთვის (categoryId ველი optional-ია)
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.accessToken,
    page,
    debouncedSearch,
    filterCategoryId,
    filterIsActive,
    debouncedMinPrice,
    debouncedMaxPrice,
    filterHasDiscount,
    filterSortBy,
    filterOrder,
  ]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // ─── Product ↔ Attribute values ────────────────────────────────────────────
  const editCategoryId = editForm.watch("categoryId");

  const fetchEditAttrValues = async (productId: number | string) => {
    if (!session?.accessToken) return;
    try {
      const res = await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerGetAttributeValues(
        String(productId)
      );
      setEditAttrValues((res.data as unknown as ProductAttributeValue[]) || []);
    } catch {
      toast.error("პროდუქტის მახასიათებლების ჩატვირთვა ვერ მოხერხდა");
    }
  };

  // editingProduct-ის კატეგორიის (ან ფორმაში ცოცხლად შერჩეული ახალი
  // კატეგორიის) ეფექტური attribute set — მემკვიდრეობის ჩათვლით.
  useEffect(() => {
    if (!editingProduct || !session?.accessToken || !editCategoryId) {
      setEditCategoryAttrs([]);
      return;
    }
    setAttrsLoading(true);
    CategoriesAPI(router.locale || "ka", session.accessToken)
      .categoryControllerFindAttributes(editCategoryId)
      .then((res) => setEditCategoryAttrs((res.data as unknown as CategoryAttribute[]) || []))
      .catch(() => toast.error("კატეგორიის მახასიათებლების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setAttrsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProduct?.id, editCategoryId, session?.accessToken]);

  const handleSaveAttrValues = async (items: ProductAttributeValueItemDto[]) => {
    if (!editingProduct || !session?.accessToken) return;
    setAttrsSaving(true);
    try {
      await ProductsAPI(router.locale || "ka", session.accessToken).productsControllerSetAttributeValues(
        String(editingProduct.id),
        { values: items }
      );
      toast.success("მახასიათებლები წარმატებით შეინახა!");
      fetchEditAttrValues(editingProduct.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მახასიათებლების შენახვა ვერ მოხერხდა");
    } finally {
      setAttrsSaving(false);
    }
  };

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
    setEditAttrValues([]);
    fetchEditAttrValues(product.id);
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

  // "რამდენიმე სურათის" დინამიური სია — useFieldArray-ს ნაცვლად
  // watch/setValue-ით ვმართავთ, რადგან images ველი უბრალო string[]-ია და
  // ერთი renderForm createForm-საც ემსახურება და editForm-საც.
  const renderImagesField = (form: typeof createForm) => {
    const images = form.watch("images") || [];

    const updateImage = (idx: number, value: string) => {
      const next = [...images];
      next[idx] = value;
      form.setValue("images", next, { shouldDirty: true });
    };

    const addImage = () => form.setValue("images", [...images, ""], { shouldDirty: true });

    const removeImage = (idx: number) =>
      form.setValue(
        "images",
        images.filter((_, i) => i !== idx),
        { shouldDirty: true }
      );

    return (
      <S.ImageList>
        {images.map((url, idx) => (
          <S.ImageRow key={idx}>
            <S.ImageThumb>{url ? <img src={resolveImage(url)} alt="" /> : <BoxIcon size={16} />}</S.ImageThumb>
            <S.Input
              type="text"
              placeholder="https://.../product.jpg"
              value={url}
              onChange={(e) => updateImage(idx, e.target.value)}
            />
            <S.CloseButton type="button" aria-label="სურათის წაშლა" onClick={() => removeImage(idx)}>
              <CloseIcon size={16} />
            </S.CloseButton>
          </S.ImageRow>
        ))}
        <S.AddImageButton type="button" onClick={addImage}>
          <PlusIcon size={14} /> სურათის დამატება
        </S.AddImageButton>
      </S.ImageList>
    );
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
      <S.FormRow>
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
      </S.FormRow>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>ფასდაკლება % (არასავალდებულო)</S.Label>
          <S.Input type="text" inputMode="decimal" placeholder="მაგ: 15" {...form.register("discountPercent")} />
          {form.formState.errors.discountPercent && (
            <S.FieldError>{form.formState.errors.discountPercent.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>კატეგორია</S.Label>
          <S.Select {...form.register("categoryId")}>
            <option value="">— კატეგორიის გარეშე —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {categoryOptionLabel(cat, router.locale)}
              </option>
            ))}
          </S.Select>
        </S.FormGroup>
      </S.FormRow>
      <S.FormGroup>
        <S.Label>სურათები (არასავალდებულო)</S.Label>
        {renderImagesField(form)}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>YouTube ვიდეოს ლინკი (არასავალდებულო)</S.Label>
        <S.Input type="text" placeholder="https://www.youtube.com/watch?v=..." {...form.register("videoUrl")} />
        {form.formState.errors.videoUrl && <S.FieldError>{form.formState.errors.videoUrl.message}</S.FieldError>}
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
      <S.FilterBar>
        <S.FilterBarHeader>
          <S.FilterBarTitle>
            <ClipboardIcon size={16} />
            გაფართოებული ძიება
            {hasActiveFilters && <S.FilterCountBadge>აქტიური</S.FilterCountBadge>}
          </S.FilterBarTitle>
          <S.FilterActions>
            <S.ActionButton type="button" variant="secondary" onClick={handleResetFilters} disabled={!hasActiveFilters}>
              <CloseIcon size={14} /> ფილტრის გასუფთავება
            </S.ActionButton>
          </S.FilterActions>
        </S.FilterBarHeader>

        <S.FilterGrid>
          <S.FilterGroup>
            <S.FilterLabel>ძიება</S.FilterLabel>
            <S.SearchInputWrapper>
              <SearchIcon size={16} />
              <S.Input
                type="text"
                placeholder="დასახელებით ან აღწერით..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </S.SearchInputWrapper>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>კატეგორია</S.FilterLabel>
            <S.Select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
              <option value="">ყველა</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {categoryOptionLabel(cat, router.locale)}
                </option>
              ))}
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>სტატუსი</S.FilterLabel>
            <S.Select value={filterIsActive} onChange={(e) => setFilterIsActive(e.target.value)}>
              <option value="">ყველა</option>
              <option value="true">აქტიური</option>
              <option value="false">არააქტიური</option>
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>ფასის დიაპაზონი</S.FilterLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <S.Input
                type="text"
                inputMode="decimal"
                placeholder="დან"
                value={minPriceText}
                onChange={(e) => setMinPriceText(e.target.value)}
              />
              <span style={{ color: "var(--ref-text-secondary)" }}>—</span>
              <S.Input
                type="text"
                inputMode="decimal"
                placeholder="მდე"
                value={maxPriceText}
                onChange={(e) => setMaxPriceText(e.target.value)}
              />
            </div>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>ფასდაკლება</S.FilterLabel>
            <S.Select value={filterHasDiscount} onChange={(e) => setFilterHasDiscount(e.target.value)}>
              <option value="">ყველა</option>
              <option value="true">ფასდაკლებით</option>
              <option value="false">ფასდაკლების გარეშე</option>
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>დალაგება</S.FilterLabel>
            <S.Select value={filterSortBy} onChange={(e) => setFilterSortBy(e.target.value)}>
              <option value="createdAt">დამატების თარიღი</option>
              <option value="name">დასახელება</option>
              <option value="price">ფასი</option>
              <option value="stock">მარაგი</option>
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>მიმართულება</S.FilterLabel>
            <S.Select value={filterOrder} onChange={(e) => setFilterOrder(e.target.value)}>
              <option value="DESC">კლებადობით</option>
              <option value="ASC">ზრდადობით</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterGrid>
      </S.FilterBar>

      {loading ? (
        <ListSkeleton count={PAGE_SIZE} />
      ) : products.length === 0 ? (
        <S.EmptyState>
          <BoxIcon size={48} />
          <S.EmptyTitle>{hasActiveFilters ? "შედეგები არ მოიძებნა" : "პროდუქტები არ არის"}</S.EmptyTitle>
          <S.EmptyText>
            {hasActiveFilters ? "სცადეთ სხვა საძიებო სიტყვა ან გაასუფთავეთ ფილტრი." : "დაამატეთ პირველი პროდუქტი კატალოგისთვის."}
          </S.EmptyText>
          {hasActiveFilters ? (
            <S.ActionButton variant="secondary" onClick={handleResetFilters}>
              <CloseIcon size={16} /> ფილტრის გასუფთავება
            </S.ActionButton>
          ) : (
            <S.ActionButton variant="primary" onClick={handleOpenCreate}>
              <PlusIcon size={16} /> პროდუქტის დამატება
            </S.ActionButton>
          )}
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
                      {!!product.discountPercent && (
                        <S.Badge variant="date">ფასდაკლება: {product.discountPercent}%</S.Badge>
                      )}
                      {product.category && (
                        <S.Badge variant="date">{getCategoryName(product.category, router.locale)}</S.Badge>
                      )}
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
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
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
        <S.ModalOverlay {...getOverlayProps(() => setEditingProduct(null))}>
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

            {editCategoryId && (
              <div style={{ marginTop: "20px", borderTop: "1px solid var(--ref-border)", paddingTop: "16px" }}>
                <S.Label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckSquareIcon size={16} /> მახასიათებლები
                </S.Label>
                {attrsLoading ? (
                  <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
                ) : (
                  <DynamicAttributeForm
                    categoryAttrs={editCategoryAttrs}
                    values={editAttrValues}
                    saving={attrsSaving}
                    onSave={handleSaveAttrValues}
                  />
                )}
              </div>
            )}
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
