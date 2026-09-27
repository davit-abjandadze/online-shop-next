import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import { Order } from "@/API_Client/types";
import { CloseIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

type RecipientType = "individual" | "legal";

interface IndividualFields {
  fullName: string;
  personalNumber: string;
  address: string;
}

interface LegalFields {
  companyName: string;
  taxId: string;
  legalAddress: string;
  contactPerson: string;
}

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

// ინვოისი მთლიანად frontend-ზე დგება — მიმღების (ფიზ./იურ. პირის) მონაცემები
// არსად არ ინახება, მხოლოდ ამ მოდალის სესიაშია. ღილაკზე დაჭერისას ბრაუზერის
// print-დიალოგის ნაცვლად პირდაპირ @react-pdf/renderer-ით გენერირდება PDF
// (ClientOnly, dynamic import — მძიმეა, მხოლოდ საჭიროებისას იტვირთება) და
// ჩამოიტვირთება, გვერდის დატოვების გარეშე.
export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { t } = useTranslation("orders");
  const router = useRouter();
  const { data: session } = useSession();

  // order.user (GET /orders/:id) მხოლოდ id-ს ატვირთავს (owner-შემოწმებისთვის
  // საკმარისია) — firstName/lastName იქ არ მოდის, ამიტომ სახელის
  // საწყისად საკუთარი სესიის name-ს ვიყენებთ (ადმინის მიერ სხვისი
  // შეკვეთის ნახვისას სახელი ცარიელი დარჩება, ხელით შესავსებია).
  const sessionFullName =
    order.user.id === Number(session?.user?.id) ? session?.user?.name || "" : "";

  const [step, setStep] = useState<"form" | "preview">("form");
  const [recipientType, setRecipientType] = useState<RecipientType>("individual");

  const [individual, setIndividual] = useState<IndividualFields>({
    fullName: sessionFullName,
    personalNumber: "",
    address: order.shippingAddress || "",
  });
  const [legal, setLegal] = useState<LegalFields>({
    companyName: "",
    taxId: "",
    legalAddress: order.shippingAddress || "",
    contactPerson: sessionFullName,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const requiredIndividualFields: (keyof IndividualFields)[] = ["fullName", "personalNumber", "address"];
  const requiredLegalFields: (keyof LegalFields)[] = ["companyName", "taxId", "legalAddress"];

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const fields = recipientType === "individual" ? requiredIndividualFields : requiredLegalFields;
    const values = recipientType === "individual" ? individual : legal;
    fields.forEach((field) => {
      const value = (values as unknown as Record<string, string>)[field];
      if (!String(value).trim()) {
        nextErrors[field] = t("invoice-field-required") as string;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep("preview");
  };

  const dateLocale = router.locale === "ka" ? "ka-GE" : router.locale;
  const invoiceDate = new Date().toLocaleDateString(dateLocale);
  const items = order.items || [];
  const sellerName = typeof window !== "undefined" ? window.location.hostname : "";

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./InvoicePdfDocument"),
      ]);
      const blob = await pdf(
        <InvoicePdfDocument
          order={order}
          recipientType={recipientType}
          individual={individual}
          legal={legal}
          invoiceDate={invoiceDate}
          sellerName={sellerName}
          labels={{
            documentTitle: t("invoice-document-title") as string,
            docNumber: t("invoice-doc-number", { id: order.id }) as string,
            docDate: t("invoice-doc-date") as string,
            sellerTitle: t("invoice-seller-title") as string,
            buyerTitle: t("invoice-buyer-title") as string,
            tableProduct: t("invoice-table-product") as string,
            tableQuantity: t("invoice-table-quantity") as string,
            tableUnitPrice: t("invoice-table-unit-price") as string,
            tableSubtotal: t("invoice-table-subtotal") as string,
            totalLabel: t("invoice-total-label") as string,
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Invoice PDF generation failed:", err);
      toast.error(t("invoice-generate-failed") as string);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <S.Overlay onClick={step === "form" ? onClose : undefined}>
        <S.ModalContainer onClick={(e) => e.stopPropagation()}>
          {step === "form" ? (
            <>
              <S.ModalHeader>
                <S.Title>{t("invoice-modal-title")}</S.Title>
                <S.CloseButton type="button" onClick={onClose}>
                  <CloseIcon size={14} />
                </S.CloseButton>
              </S.ModalHeader>

              <S.Form onSubmit={handleSubmit}>
                <S.RecipientTypeRow>
                  <S.RecipientTypeButton
                    type="button"
                    active={recipientType === "individual"}
                    onClick={() => setRecipientType("individual")}
                  >
                    {t("invoice-recipient-individual")}
                  </S.RecipientTypeButton>
                  <S.RecipientTypeButton
                    type="button"
                    active={recipientType === "legal"}
                    onClick={() => setRecipientType("legal")}
                  >
                    {t("invoice-recipient-legal")}
                  </S.RecipientTypeButton>
                </S.RecipientTypeRow>

                {recipientType === "individual" ? (
                  <>
                    <S.FormGroup>
                      <S.Label>{t("invoice-field-full-name")}</S.Label>
                      <S.Input
                        $invalid={!!errors.fullName}
                        value={individual.fullName}
                        onChange={(e) => setIndividual({ ...individual, fullName: e.target.value })}
                      />
                      {errors.fullName && <S.FieldError>{errors.fullName}</S.FieldError>}
                    </S.FormGroup>
                    <S.FormGroup>
                      <S.Label>{t("invoice-field-personal-number")}</S.Label>
                      <S.Input
                        $invalid={!!errors.personalNumber}
                        value={individual.personalNumber}
                        onChange={(e) => setIndividual({ ...individual, personalNumber: e.target.value })}
                      />
                      {errors.personalNumber && <S.FieldError>{errors.personalNumber}</S.FieldError>}
                    </S.FormGroup>
                    <S.FormGroup>
                      <S.Label>{t("invoice-field-address")}</S.Label>
                      <S.Input
                        $invalid={!!errors.address}
                        value={individual.address}
                        onChange={(e) => setIndividual({ ...individual, address: e.target.value })}
                      />
                      {errors.address && <S.FieldError>{errors.address}</S.FieldError>}
                    </S.FormGroup>
                  </>
                ) : (
                  <>
                    <S.FormGroup>
                      <S.Label>{t("invoice-field-company-name")}</S.Label>
                      <S.Input
                        $invalid={!!errors.companyName}
                        value={legal.companyName}
                        onChange={(e) => setLegal({ ...legal, companyName: e.target.value })}
                      />
                      {errors.companyName && <S.FieldError>{errors.companyName}</S.FieldError>}
                    </S.FormGroup>
                    <S.FormGroup>
                      <S.Label>{t("invoice-field-tax-id")}</S.Label>
                      <S.Input
                        $invalid={!!errors.taxId}
                        value={legal.taxId}
                        onChange={(e) => setLegal({ ...legal, taxId: e.target.value })}
                      />
                      {errors.taxId && <S.FieldError>{errors.taxId}</S.FieldError>}
                    </S.FormGroup>
                    <S.FormGroup>
                      <S.Label>{t("invoice-field-legal-address")}</S.Label>
                      <S.Input
                        $invalid={!!errors.legalAddress}
                        value={legal.legalAddress}
                        onChange={(e) => setLegal({ ...legal, legalAddress: e.target.value })}
                      />
                      {errors.legalAddress && <S.FieldError>{errors.legalAddress}</S.FieldError>}
                    </S.FormGroup>
                    <S.FormGroup>
                      <S.Label>
                        {t("invoice-field-contact-person")} <span>({t("invoice-field-optional")})</span>
                      </S.Label>
                      <S.Input
                        value={legal.contactPerson}
                        onChange={(e) => setLegal({ ...legal, contactPerson: e.target.value })}
                      />
                    </S.FormGroup>
                  </>
                )}

                <S.SubmitButton type="submit">{t("invoice-generate-button")}</S.SubmitButton>
              </S.Form>
            </>
          ) : (
            <>
              <div>
                <S.InvoiceDocument>
                  <S.InvoiceHeading>{t("invoice-document-title")}</S.InvoiceHeading>
                  <S.InvoiceMetaRow>
                    <span>{t("invoice-doc-number", { id: order.id })}</span>
                    <span>
                      {t("invoice-doc-date")}: {invoiceDate}
                    </span>
                  </S.InvoiceMetaRow>

                  <S.InvoicePartiesGrid>
                    <S.PartyBlock>
                      <S.PartyTitle>{t("invoice-seller-title")}</S.PartyTitle>
                      <S.PartyLine>{typeof window !== "undefined" ? window.location.hostname : ""}</S.PartyLine>
                    </S.PartyBlock>
                    <S.PartyBlock>
                      <S.PartyTitle>{t("invoice-buyer-title")}</S.PartyTitle>
                      {recipientType === "individual" ? (
                        <>
                          <S.PartyLine>{individual.fullName}</S.PartyLine>
                          <S.PartyLine>{individual.personalNumber}</S.PartyLine>
                          <S.PartyLine>{individual.address}</S.PartyLine>
                        </>
                      ) : (
                        <>
                          <S.PartyLine>{legal.companyName}</S.PartyLine>
                          <S.PartyLine>{legal.taxId}</S.PartyLine>
                          <S.PartyLine>{legal.legalAddress}</S.PartyLine>
                          {legal.contactPerson && <S.PartyLine>{legal.contactPerson}</S.PartyLine>}
                        </>
                      )}
                    </S.PartyBlock>
                  </S.InvoicePartiesGrid>

                  <S.InvoiceTable>
                    <thead>
                      <tr>
                        <th>{t("invoice-table-product")}</th>
                        <th className="numeric">{t("invoice-table-quantity")}</th>
                        <th className="numeric">{t("invoice-table-unit-price")}</th>
                        <th className="numeric">{t("invoice-table-subtotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.productName}
                            {(item.colorName || item.sizeName) && (
                              <div style={{ color: "#777", fontSize: "11px" }}>
                                {[item.colorName, item.sizeName].filter(Boolean).join(" / ")}
                              </div>
                            )}
                          </td>
                          <td className="numeric">{item.quantity}</td>
                          <td className="numeric">{Number(item.unitPrice).toFixed(2)} ₾</td>
                          <td className="numeric">{(Number(item.unitPrice) * item.quantity).toFixed(2)} ₾</td>
                        </tr>
                      ))}
                    </tbody>
                  </S.InvoiceTable>

                  <S.InvoiceTotalRow>
                    <span>{t("invoice-total-label")}</span>
                    <span>{Number(order.totalAmount).toFixed(2)} ₾</span>
                  </S.InvoiceTotalRow>
                </S.InvoiceDocument>
              </div>

              <S.PreviewActions>
                <S.GhostButton type="button" onClick={() => setStep("form")}>
                  {t("invoice-back-to-form")}
                </S.GhostButton>
                <div style={{ display: "flex", gap: "10px" }}>
                  <S.GhostButton type="button" onClick={onClose}>
                    {t("invoice-close-button")}
                  </S.GhostButton>
                  <S.PrintButton type="button" disabled={generating} onClick={handleDownload}>
                    {generating ? t("submitting") : t("invoice-download-button")}
                  </S.PrintButton>
                </div>
              </S.PreviewActions>
            </>
          )}
        </S.ModalContainer>
      </S.Overlay>
    </>
  );
};

export default InvoiceModal;
