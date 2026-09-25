import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import Header from "@/components/shared/Header";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { AddressesAPI } from "@/API_Client";
import { Address } from "@/API_Client/types";
import { CloseIcon, EditIcon, LockIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { AddressFormValues, addressFormSchema } from "@/components/pages/checkout/schemas";
import { ProfileLayout } from "./ProfileLayout";
import * as S from "./style";

// მისამართის ფორმის "ქალაქი" სელექტისთვის — checkout-ის იგივე ჩამონათვალი
// (backend-ზე city უბრალო string ველია, აქ ჩამონათვალის გაფართოება
// ბექენდის ცვლილებას არ საჭიროებს). value ყოველთვის ქართულია.
const GEORGIAN_CITIES = [
  { value: "თბილისი", key: "city-tbilisi" },
  { value: "ბათუმი", key: "city-batumi" },
  { value: "ქუთაისი", key: "city-kutaisi" },
  { value: "რუსთავი", key: "city-rustavi" },
  { value: "გორი", key: "city-gori" },
  { value: "ზუგდიდი", key: "city-zugdidi" },
  { value: "ფოთი", key: "city-poti" },
  { value: "ხაშური", key: "city-khashuri" },
  { value: "სამტრედია", key: "city-samtredia" },
  { value: "სენაკი", key: "city-senaki" },
  { value: "ზესტაფონი", key: "city-zestafoni" },
  { value: "მარნეული", key: "city-marneuli" },
  { value: "თელავი", key: "city-telavi" },
  { value: "ახალციხე", key: "city-akhaltsikhe" },
  { value: "ოზურგეთი", key: "city-ozurgeti" },
  { value: "ქობულეთი", key: "city-kobuleti" },
  { value: "ბორჯომი", key: "city-borjomi" },
  { value: "გურჯაანი", key: "city-gurjaani" },
  { value: "ახალქალაქი", key: "city-akhalkalaki" },
  { value: "წყალტუბო", key: "city-tskaltubo" },
];

const emptyAddressForm: AddressFormValues = {
  title: "",
  phoneNumber: "",
  city: "",
  address: "",
  comment: "",
};

export const AddressesComponent: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation("profile");
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<AddressFormValues>(emptyAddressForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddressFormValues, string>>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAddresses = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await AddressesAPI(router.locale || "ka", session.accessToken).addressesControllerFindAll();
      setAddresses((res.data as unknown as Address[]) || []);
    } catch {
      // silent — ცარიელი სია ჩვენდება
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken]);

  const openAddModal = () => {
    setEditingId(null);
    setFormValues(emptyAddressForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setFormValues({
      title: addr.title,
      phoneNumber: addr.phoneNumber,
      city: addr.city,
      address: addr.address,
      comment: addr.comment || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleFieldChange = (field: keyof AddressFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!session?.accessToken) return;

    const parsed = addressFormSchema(t).safeParse(formValues);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof AddressFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof AddressFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setFormErrors(fieldErrors);
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      const api = AddressesAPI(router.locale || "ka", session.accessToken);
      const payload = {
        title: parsed.data.title,
        phoneNumber: parsed.data.phoneNumber,
        city: parsed.data.city,
        address: parsed.data.address,
        comment: parsed.data.comment || undefined,
      };
      if (editingId) {
        await api.addressesControllerUpdate(Number(editingId), payload);
      } else {
        await api.addressesControllerCreate(payload);
      }
      await fetchAddresses();
      setModalOpen(false);
      toast.success((editingId ? t("toast-address-updated") : t("toast-address-added")) as string);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("toast-address-save-failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!session?.accessToken) return;
    setDeletingId(id);
    try {
      const api = AddressesAPI(router.locale || "ka", session.accessToken);
      await api.addressesControllerRemove(Number(id));
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("toast-address-delete-failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const cityLabel = (value: string) => {
    const city = GEORGIAN_CITIES.find((c) => c.value === value);
    return city ? t(city.key) : value;
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)" }}>{t("loading")}</p>
          </S.Container>
        </S.PageWrapper>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>{t("access-denied-title")}</S.AccessDeniedTitle>
            <S.AccessDeniedText>{t("access-denied-text")}</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              {t("back-to-home")}
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  return (
    <ProfileLayout activeTab="addresses" title={t("addresses-page-title")} subtitle={t("addresses-page-subtitle")}>
      <S.Card>
        {loading ? (
          <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>{t("loading")}</p>
        ) : addresses.length === 0 ? (
          <S.EmptyState style={{ border: "none", padding: "24px 0" }}>
            <S.EmptyTitle>{t("addresses-empty-title")}</S.EmptyTitle>
            <S.EmptyText>{t("addresses-empty-text")}</S.EmptyText>
            <S.ActionButton variant="primary" onClick={openAddModal}>
              <PlusIcon size={16} /> {t("add-new-address")}
            </S.ActionButton>
          </S.EmptyState>
        ) : (
          <S.AddressListPanel>
            {addresses.map((addr) => (
              <S.AddressCard key={addr.id}>
                <S.AddressBody>
                  <S.AddressTitle>{addr.title}</S.AddressTitle>
                  <S.AddressValue>{addr.phoneNumber}</S.AddressValue>
                  <S.AddressValue>
                    {cityLabel(addr.city)}, {addr.address}
                  </S.AddressValue>
                  {addr.comment && <S.AddressValue>{addr.comment}</S.AddressValue>}
                </S.AddressBody>
                <S.AddressItemActions>
                  <S.IconButton type="button" onClick={() => openEditModal(addr)} title={t("edit")}>
                    <EditIcon size={16} />
                  </S.IconButton>
                  <S.IconButton
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    title={t("delete")}
                  >
                    <TrashIcon size={16} />
                  </S.IconButton>
                </S.AddressItemActions>
              </S.AddressCard>
            ))}
            <S.AddNewAddressBtn type="button" onClick={openAddModal}>
              + {t("add-new-address")}
            </S.AddNewAddressBtn>
          </S.AddressListPanel>
        )}
      </S.Card>

      {modalOpen && (
        <S.ModalOverlay {...getOverlayProps(closeModal)}>
          <S.ModalContent>
            <S.ModalHeader>
              <S.ModalTitle>{editingId ? t("modal-edit-address-title") : t("modal-add-address-title")}</S.ModalTitle>
              <S.CloseButton type="button" onClick={closeModal}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>

            <S.AddressFormFields>
              <S.AddressFormRow>
                <S.FormGroup>
                  <S.Input
                    placeholder={t("address-name-placeholder")}
                    value={formValues.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    $invalid={!!formErrors.title}
                  />
                  {formErrors.title && <S.FieldError>{formErrors.title}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Input
                    placeholder={t("phone-number-placeholder")}
                    value={formValues.phoneNumber}
                    onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                    $invalid={!!formErrors.phoneNumber}
                  />
                  {formErrors.phoneNumber && <S.FieldError>{formErrors.phoneNumber}</S.FieldError>}
                </S.FormGroup>
              </S.AddressFormRow>

              <S.AddressFormRow>
                <S.FormGroup>
                  <S.Select
                    value={formValues.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    $invalid={!!formErrors.city}
                  >
                    <option value="">{t("city-select-placeholder-choose")}</option>
                    {GEORGIAN_CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {t(city.key)}
                      </option>
                    ))}
                  </S.Select>
                  {formErrors.city && <S.FieldError>{formErrors.city}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Input
                    placeholder={t("address-placeholder")}
                    value={formValues.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    $invalid={!!formErrors.address}
                  />
                  {formErrors.address && <S.FieldError>{formErrors.address}</S.FieldError>}
                </S.FormGroup>
              </S.AddressFormRow>

              <S.FormGroup>
                <S.Textarea
                  placeholder={t("comment-placeholder")}
                  value={formValues.comment}
                  onChange={(e) => handleFieldChange("comment", e.target.value)}
                />
              </S.FormGroup>

              <S.ModalSubmitButton type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? t("saving") : t("save")}
              </S.ModalSubmitButton>
            </S.AddressFormFields>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </ProfileLayout>
  );
};

export default AddressesComponent;
