import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ProductsAPI } from "@/API_Client";
import { ProductAdditionalInfo } from "@/API_Client/types";
import { CloseIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { RichTextEditor } from "./RichTextEditor";
import * as S from "./style";

interface AdditionalInfoFormProps {
  productId: number | string;
  accessToken: string;
  locale: string;
}

type BlockFormValues = {
  title: string;
  description: string;
  sortOrder: string;
};

const emptyBlockForm: BlockFormValues = { title: "", description: "", sortOrder: "" };

// description HTML-ია (RichTextEditor-იდან) — ცარიელობის შესამოწმებლად
// ტეგებს ვაცილებთ და დარჩენილ ტექსტს ვამოწმებთ.
const isDescriptionEmpty = (html: string) => !html || !html.replace(/<[^>]*>/g, "").trim();

const toFormValues = (info: ProductAdditionalInfo): BlockFormValues => ({
  title: info.title,
  description: info.description,
  sortOrder: String(info.sortOrder ?? 0),
});

/**
 * პროდუქტს "დამატებითი ინფორმაციის" ულიმიტო რაოდენობის ბლოკს ამატებს
 * (თითო — სათაური + აღწერილობა + sortOrder). CRUD მთლიანად ამ კომპონენტშია
 * — DynamicAttributeForm-ისგან განსხვავებით, productId-ის გარდა კატეგორიის
 * კონტექსტს არ საჭიროებს, ამიტომ თავადვე იტვირთება/ინახება.
 */
export const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({ productId, accessToken, locale }) => {
  const [items, setItems] = useState<ProductAdditionalInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<BlockFormValues>(emptyBlockForm);
  const [addSubmitting, setAddSubmitting] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BlockFormValues>(emptyBlockForm);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteSubmittingId, setDeleteSubmittingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await ProductsAPI(locale, accessToken).productsControllerGetAdditionalInfo(String(productId));
      const data = (res.data as unknown as ProductAdditionalInfo[]) || [];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("დამატებითი ინფორმაციის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleOpenAdd = () => {
    setAddForm({ ...emptyBlockForm, sortOrder: String(items.length) });
    setIsAdding(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim() || isDescriptionEmpty(addForm.description)) {
      toast.error("სათაური და აღწერილობა სავალდებულოა");
      return;
    }
    setAddSubmitting(true);
    try {
      await ProductsAPI(locale, accessToken).productsControllerAddAdditionalInfo(String(productId), {
        title: addForm.title.trim(),
        description: sanitizeHtml(addForm.description),
        sortOrder: addForm.sortOrder.trim() ? Number(addForm.sortOrder) : undefined,
      });
      toast.success("ბლოკი წარმატებით დაემატა!");
      setIsAdding(false);
      setAddForm(emptyBlockForm);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ბლოკის დამატება ვერ მოხერხდა");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleOpenEdit = (info: ProductAdditionalInfo) => {
    setEditingId(info.id);
    setEditForm(toFormValues(info));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editForm.title.trim() || isDescriptionEmpty(editForm.description)) {
      toast.error("სათაური და აღწერილობა სავალდებულოა");
      return;
    }
    setEditSubmitting(true);
    try {
      await ProductsAPI(locale, accessToken).productsControllerUpdateAdditionalInfo(String(productId), editingId, {
        title: editForm.title.trim(),
        description: sanitizeHtml(editForm.description),
        sortOrder: editForm.sortOrder.trim() ? Number(editForm.sortOrder) : undefined,
      });
      toast.success("ბლოკი წარმატებით განახლდა!");
      setEditingId(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ბლოკის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (infoId: string) => {
    setDeleteSubmittingId(infoId);
    try {
      await ProductsAPI(locale, accessToken).productsControllerRemoveAdditionalInfo(String(productId), infoId);
      toast.success("ბლოკი წარმატებით წაიშალა!");
      if (editingId === infoId) setEditingId(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ბლოკის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmittingId(null);
    }
  };

  return (
    <div>
      {loading ? (
        <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
      ) : (
        <S.AdditionalInfoList>
          {items.length === 0 && !isAdding && (
            <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)" }}>
              დამატებითი ინფორმაციის ბლოკები ჯერ არ არის დამატებული.
            </p>
          )}

          {items.map((info) =>
            editingId === info.id ? (
              <S.AdditionalInfoItem key={info.id}>
                <form onSubmit={handleEditSubmit} noValidate>
                  <S.FormGroup>
                    <S.Label>სათაური</S.Label>
                    <S.Input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </S.FormGroup>
                  <S.FormGroup>
                    <S.Label>აღწერილობა</S.Label>
                    <RichTextEditor
                      value={editForm.description}
                      onChange={(html) => setEditForm((prev) => ({ ...prev, description: html }))}
                    />
                  </S.FormGroup>
                  <S.FormGroup>
                    <S.Label>თანმიმდევრობა</S.Label>
                    <S.Input
                      type="text"
                      inputMode="numeric"
                      value={editForm.sortOrder}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                    />
                  </S.FormGroup>
                  <S.ModalFooter style={{ marginTop: 8, paddingTop: 0, borderTop: "none" }}>
                    <S.ActionButton type="button" variant="secondary" onClick={() => setEditingId(null)}>
                      გაუქმება
                    </S.ActionButton>
                    <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>
                      {editSubmitting ? "ინახება..." : "შენახვა"}
                    </S.ActionButton>
                  </S.ModalFooter>
                </form>
              </S.AdditionalInfoItem>
            ) : (
              <S.AdditionalInfoItem key={info.id}>
                <S.AdditionalInfoItemHeader>
                  <div>
                    <S.AdditionalInfoItemTitle>{info.title}</S.AdditionalInfoItemTitle>
                    <S.AdditionalInfoItemDescription
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(info.description) }}
                    />
                  </div>
                  <S.AdditionalInfoItemActions>
                    <S.CloseButton aria-label="რედაქტირება" onClick={() => handleOpenEdit(info)}>
                      <EditIcon size={15} />
                    </S.CloseButton>
                    <S.CloseButton
                      aria-label="წაშლა"
                      onClick={() => handleDelete(info.id)}
                      disabled={deleteSubmittingId === info.id}
                    >
                      <TrashIcon size={15} />
                    </S.CloseButton>
                  </S.AdditionalInfoItemActions>
                </S.AdditionalInfoItemHeader>
              </S.AdditionalInfoItem>
            )
          )}

          {isAdding && (
            <S.AdditionalInfoItem>
              <form onSubmit={handleAddSubmit} noValidate>
                <S.FormGroup>
                  <S.Label>სათაური</S.Label>
                  <S.Input
                    type="text"
                    placeholder="მაგ: მიწოდება"
                    value={addForm.title}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>აღწერილობა</S.Label>
                  <RichTextEditor
                    value={addForm.description}
                    onChange={(html) => setAddForm((prev) => ({ ...prev, description: html }))}
                    placeholder="მაგ: მიწოდება ხდება 1-3 სამუშაო დღეში"
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>თანმიმდევრობა (არასავალდებულო)</S.Label>
                  <S.Input
                    type="text"
                    inputMode="numeric"
                    value={addForm.sortOrder}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                  />
                </S.FormGroup>
                <S.ModalFooter style={{ marginTop: 8, paddingTop: 0, borderTop: "none" }}>
                  <S.ActionButton type="button" variant="secondary" onClick={() => setIsAdding(false)}>
                    <CloseIcon size={14} /> გაუქმება
                  </S.ActionButton>
                  <S.ActionButton type="submit" variant="primary" disabled={addSubmitting}>
                    {addSubmitting ? "ინახება..." : "დამატება"}
                  </S.ActionButton>
                </S.ModalFooter>
              </form>
            </S.AdditionalInfoItem>
          )}
        </S.AdditionalInfoList>
      )}

      {!isAdding && (
        <S.AddImageButton type="button" onClick={handleOpenAdd} style={{ marginTop: 10 }}>
          <PlusIcon size={14} /> ბლოკის დამატება
        </S.AddImageButton>
      )}
    </div>
  );
};

export default AdditionalInfoForm;
