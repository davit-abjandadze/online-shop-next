import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import { useCart } from "@/context/Cart";
import { OrdersAPI, OtpAPI, PaymentsAPI, UserAPI } from "@/API_Client";
import { Order, PaymentInitiateResponse, User } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import {
  CartIcon,
  LockIcon,
  TruckIcon,
  BoxIcon,
  PinIcon,
  WarningIcon,
  CheckCircleIcon,
} from "@/components/ui/RefIcons";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import { emailField, personalNumberField, phoneNumberField } from "@/components/shared/validation/schemas";
import { CheckoutFormValues, checkoutFormSchema } from "./schemas";
import * as S from "./style";

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// ველში მომხმარებელი 9-ციფრიან ქართულ მობილურის ნომერს (ქვეყნის კოდის გარეშე) შეიყვანს,
// ბექენდისთვის/verify.ge-სთვის კი E.164 ფორმატია საჭირო (მაგ. +995555123456) — profile-ის ანალოგიურად.
const toE164 = (localNumber: string) => `+995${localNumber.replace(/\D/g, "")}`;
const fromE164 = (phone: string) => phone.replace(/^\+995/, "");

// შეკვეთის გაფორმების გვერდი — "შეკვეთის დადასტურება" და "გადახდის დაწყება"
// ერთი მოქმედებაა (backend-ის createFromCart → იმწამსვე payable PENDING
// შეკვეთის დიზაინის მიხედვით), ამიტომ წარმატებული submit პირდაპირ
// PaymentsAPI-ის initiate-ს იძახებს და BOG-ის redirectUrl-ზე გადამისამართებს —
// შუალედური "შეკვეთა შეიქმნა, მაგრამ არაფერი არ გვთხოვს გადახდას" გვერდი არ რჩება.
export const CheckoutComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, loading, refresh } = useCart();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  // ელფოსტის/მობილურის/პირადი ნომრის ამ გვერდზევე რედაქტირება — profile-ის იგივე
  // OTP-ვერიფიკაციის ნიმუში, მხოლოდ ყიდვისთვის აუცილებელ ველებზე შემოზღუდული.
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [personalNumberInput, setPersonalNumberInput] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState("");
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const resetEmailOtpState = () => {
    setOtpSending(false);
    setOtpVerifying(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpRequestId("");
    setOtpCodeInput("");
    setOtpError(null);
  };

  useEffect(() => {
    if (otpSent || otpVerified) resetEmailOtpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInput]);

  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [phoneOtpRequestId, setPhoneOtpRequestId] = useState("");
  const [phoneOtpCodeInput, setPhoneOtpCodeInput] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);

  const resetPhoneOtpState = () => {
    setPhoneOtpSending(false);
    setPhoneOtpVerifying(false);
    setPhoneOtpSent(false);
    setPhoneOtpVerified(false);
    setPhoneOtpRequestId("");
    setPhoneOtpCodeInput("");
    setPhoneOtpError(null);
  };

  useEffect(() => {
    if (phoneOtpSent || phoneOtpVerified) resetPhoneOtpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneInput]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { shippingAddress: "" },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.accessToken || !session?.user?.id) return;
      setLoadingUser(true);
      try {
        const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerFindOne(
          session.user.id
        );
        const u = res.data as User;
        const localPhoneNumber = u.phoneNumber ? fromE164(u.phoneNumber) : "";
        setUser(u);
        setEmailInput(u.email || "");
        setSavedEmail(u.email || "");
        setPhoneInput(localPhoneNumber);
        setSavedPhoneNumber(localPhoneNumber);
        setPersonalNumberInput(u.personalNumber || "");
      } catch {
        // პერსონალური ინფორმაციის ჩატვირთვის ჩავარდნა ფორმის შევსებას არ უნდა
        // ბლოკავდეს — უბრალოდ ცარიელი დარჩება ბლოკი.
      } finally {
        setLoadingUser(false);
      }
    };
    if (status === "authenticated") fetchUser();
  }, [status, session, router.locale]);

  const handleSendEmailOtp = async () => {
    setOtpError(null);
    const parsed = emailField().safeParse(emailInput);
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message || "გთხოვთ მიუთითოთ ვალიდური ელფოსტა");
      return;
    }
    setOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendEmailOtp({ email: parsed.data });
      setOtpRequestId(resp.data.requestId);
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "დადასტურების კოდის გაგზავნა ვერ მოხერხდა");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setOtpError(null);
    if (!otpCodeInput.trim()) {
      setOtpError("გთხოვთ შეიყვანოთ დადასტურების კოდი");
      return;
    }
    setOtpVerifying(true);
    try {
      await OtpAPI(router.locale || "ka", "").otpControllerVerifyEmailOtp({
        requestId: otpRequestId,
        code: otpCodeInput.trim(),
      });
      setOtpVerified(true);
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "კოდი არასწორია ან ვადაგასულია");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setPhoneOtpError(null);
    const parsed = phoneNumberField().safeParse(phoneInput);
    if (!parsed.success) {
      setPhoneOtpError(parsed.error.issues[0]?.message || "გთხოვთ მიუთითოთ ვალიდური მობილურის ნომერი");
      return;
    }
    setPhoneOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendOtp({
        phoneNumber: toE164(parsed.data),
      });
      setPhoneOtpRequestId(resp.data.requestId);
      setPhoneOtpSent(true);
    } catch (err: any) {
      setPhoneOtpError(err?.response?.data?.message || "დადასტურების კოდის გაგზავნა ვერ მოხერხდა");
    } finally {
      setPhoneOtpSending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpError(null);
    if (!phoneOtpCodeInput.trim()) {
      setPhoneOtpError("გთხოვთ შეიყვანოთ დადასტურების კოდი");
      return;
    }
    setPhoneOtpVerifying(true);
    try {
      await OtpAPI(router.locale || "ka", "").otpControllerVerifyOtp({
        requestId: phoneOtpRequestId,
        code: phoneOtpCodeInput.trim(),
      });
      setPhoneOtpVerified(true);
    } catch (err: any) {
      setPhoneOtpError(err?.response?.data?.message || "კოდი არასწორია ან ვადაგასულია");
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!session?.accessToken || !session?.user?.id) return;

    const newEmail = emailInput.trim();
    const emailChanged = newEmail !== savedEmail;
    const newPhoneNumber = phoneInput.trim();
    const phoneChanged = newPhoneNumber !== savedPhoneNumber;

    const personalNumberParsed = personalNumberField().safeParse(personalNumberInput);
    if (!personalNumberParsed.success) {
      toast.error(personalNumberParsed.error.issues[0]?.message || "გთხოვთ მიუთითოთ ვალიდური პირადი ნომერი");
      return;
    }
    if (emailChanged && !otpVerified) {
      toast.error("ელფოსტის შესაცვლელად საჭიროა ახალი ელფოსტის დადასტურება");
      return;
    }
    if (phoneChanged && !phoneOtpVerified) {
      toast.error("მობილურის ნომრის შესაცვლელად საჭიროა ახალი ნომრის დადასტურება");
      return;
    }

    const includeEmailOtpProof = emailChanged || otpVerified;
    const includePhoneOtpProof = phoneChanged || phoneOtpVerified;

    setSavingInfo(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        session.user.id,
        {
          email: newEmail,
          phoneNumber: newPhoneNumber ? toE164(newPhoneNumber) : undefined,
          personalNumber: personalNumberParsed.data,
          ...(includeEmailOtpProof ? { otpRequestId, otpCode: otpCodeInput.trim() } : {}),
          ...(includePhoneOtpProof ? { phoneOtpRequestId, phoneOtpCode: phoneOtpCodeInput.trim() } : {}),
        }
      );
      const updated = res.data as User;
      setUser(updated);
      setSavedEmail(newEmail);
      setSavedPhoneNumber(newPhoneNumber);
      resetEmailOtpState();
      resetPhoneOtpState();
      toast.success("მონაცემები წარმატებით შენახულია!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მონაცემების შენახვა ვერ მოხერხდა");
    } finally {
      setSavingInfo(false);
    }
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageBackground>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </S.Container>
        </S.PageBackground>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <S.PageBackground>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>საჭიროა ავტორიზაცია</S.AccessDeniedTitle>
            <S.AccessDeniedText>შეკვეთის გასაფორმებლად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton type="button" onClick={() => setAuthModalOpen(true)}>
              შესვლა
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageBackground>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </>
    );
  }

  const items = cart?.items || [];
  const { subtotal, total, itemsCount } = items.reduce(
    (acc, item) => {
      const { price, originalPrice } = getDiscountedPrice(item.product);
      return {
        subtotal: acc.subtotal + (originalPrice ?? price) * item.quantity,
        total: acc.total + price * item.quantity,
        itemsCount: acc.itemsCount + item.quantity,
      };
    },
    { subtotal: 0, total: 0, itemsCount: 0 }
  );
  const discount = subtotal - total;
  const isEmpty = !loading && items.length === 0;

  // ყიდვისთვის სავალდებულო მონაცემები — profile-ის იგივე წესი: დაუდასტურებელი
  // ელფოსტა/მობილური ან ცარიელი პირადი ნომერი შეკვეთის გაფორმებას ბლოკავს.
  const emailNotVerified = !user?.isEmailVerified;
  const phoneNotVerified = !user?.isPhoneVerified;
  const personalNumberMissing = !personalNumberInput.trim();
  const purchaseBlocked = !loadingUser && (emailNotVerified || phoneNotVerified || personalNumberMissing);

  // OTP დადასტურების UI (ღილაკი/კოდის ველი) გამოჩნდეს არა მხოლოდ მაშინ, როცა
  // მომხმარებელი ცვლის ელფოსტას/ნომერს, არამედ მაშინაც, როცა ამჟამინდელი (შენახული)
  // ღირებულება უბრალოდ დაუდასტურებელია — profile-ის იგივე ლოგიკა.
  const emailNeedsVerificationUi =
    !!emailInput.trim() && (emailInput.trim() !== savedEmail || emailNotVerified);
  const phoneNeedsVerificationUi =
    !!phoneInput.trim() && (phoneInput.trim() !== savedPhoneNumber || phoneNotVerified);

  const onSubmit = handleSubmit(async (data) => {
    if (!session?.accessToken || isEmpty || purchaseBlocked) return;
    setSubmitting(true);
    try {
      const orderRes = await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerCreate({
        shippingAddress: data.shippingAddress.trim(),
      });
      const order = orderRes.data as unknown as Order;

      // createFromCart-მა კალათა უკვე დაცარიელა backend-ზე — Header-ის
      // ბეჯის განახლებისთვის client-side cache-საც ვასინქრონებთ.
      refresh();

      const paymentRes = await PaymentsAPI(router.locale || "ka", session.accessToken).paymentsControllerInitiate(
        String(order.id)
      );
      const { redirectUrl } = paymentRes.data as unknown as PaymentInitiateResponse;
      // BOG-ის hosted გვერდზე გადასვლა — გარე დომეინია, next/router-ის push
      // კი client-side ნავიგაციისთვისაა, ამიტომ რეალური ბრაუზერის ნავიგაცია გვჭირდება.
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "შეკვეთის გაფორმება ვერ მოხერხდა");
      setSubmitting(false);
    }
  });

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <S.Title>შეკვეთის გაფორმება</S.Title>

          {isEmpty ? (
            <S.EmptyState>
              <CartIcon size={48} />
              <S.EmptyStateTitle>კალათა ცარიელია</S.EmptyStateTitle>
              <S.ActionButton type="button" onClick={() => router.push("/")}>
                კატალოგში დაბრუნება
              </S.ActionButton>
            </S.EmptyState>
          ) : (
            <S.Layout onSubmit={onSubmit} noValidate>
              <S.FormColumn>
                <S.SectionCard>
                  <S.SectionTitle>პერსონალური ინფორმაცია</S.SectionTitle>
                  <S.PersonalGrid>
                    <S.ReadonlyField>
                      <S.ReadonlyLabel>სახელი</S.ReadonlyLabel>
                      <S.ReadonlyValue>{user?.firstName || "—"}</S.ReadonlyValue>
                    </S.ReadonlyField>
                    <S.ReadonlyField>
                      <S.ReadonlyLabel>გვარი</S.ReadonlyLabel>
                      <S.ReadonlyValue>{user?.lastName || "—"}</S.ReadonlyValue>
                    </S.ReadonlyField>
                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        პირადი ნომერი
                        {personalNumberMissing && <S.RequiredHint> — შეავსეთ</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.Input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="11-ციფრიანი პირადი ნომერი"
                        $invalid={personalNumberMissing}
                        value={personalNumberInput}
                        onChange={(e) => setPersonalNumberInput(e.target.value)}
                      />
                    </S.ReadonlyField>

                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        მობილურის ნომერი
                        {phoneNotVerified && <S.RequiredHint> — არადამოწმებული</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.FieldRow>
                        <S.InputWrapper>
                          <S.Input
                            type="tel"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="5XX XX XX XX"
                            $invalid={!phoneInput.trim() || phoneNotVerified}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                          />
                        </S.InputWrapper>
                        {phoneNeedsVerificationUi &&
                          (phoneOtpVerified ? (
                            <S.VerifiedBadge>
                              <CheckCircleIcon size={15} /> დადასტურებულია
                            </S.VerifiedBadge>
                          ) : (
                            <S.OtpActionBtn type="button" onClick={handleSendPhoneOtp} disabled={phoneOtpSending}>
                              {phoneOtpSending ? "იგზავნება..." : phoneOtpSent ? "ხელახლა გაგზავნა" : "დამოწმება"}
                            </S.OtpActionBtn>
                          ))}
                      </S.FieldRow>
                      {phoneOtpSent && !phoneOtpVerified && phoneNeedsVerificationUi && (
                        <S.FieldRow>
                          <S.InputWrapper>
                            <S.Input
                              type="text"
                              inputMode="numeric"
                              placeholder="SMS-ით მიღებული კოდი"
                              value={phoneOtpCodeInput}
                              onChange={(e) => setPhoneOtpCodeInput(e.target.value)}
                            />
                          </S.InputWrapper>
                          <S.OtpActionBtn
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            disabled={phoneOtpVerifying || !phoneOtpCodeInput.trim()}
                          >
                            {phoneOtpVerifying ? "მოწმდება..." : "დადასტურება"}
                          </S.OtpActionBtn>
                        </S.FieldRow>
                      )}
                      {phoneOtpError && <S.FieldError>{phoneOtpError}</S.FieldError>}
                    </S.ReadonlyField>

                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        ელ-ფოსტა
                        {emailNotVerified && <S.RequiredHint> — არადამოწმებული</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.FieldRow>
                        <S.InputWrapper>
                          <S.Input
                            type="email"
                            $invalid={!emailInput.trim() || emailNotVerified}
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                          />
                        </S.InputWrapper>
                        {emailNeedsVerificationUi &&
                          (otpVerified ? (
                            <S.VerifiedBadge>
                              <CheckCircleIcon size={15} /> დადასტურებულია
                            </S.VerifiedBadge>
                          ) : (
                            <S.OtpActionBtn type="button" onClick={handleSendEmailOtp} disabled={otpSending}>
                              {otpSending ? "იგზავნება..." : otpSent ? "ხელახლა გაგზავნა" : "დამოწმება"}
                            </S.OtpActionBtn>
                          ))}
                      </S.FieldRow>
                      {otpSent && !otpVerified && emailNeedsVerificationUi && (
                        <S.FieldRow>
                          <S.InputWrapper>
                            <S.Input
                              type="text"
                              inputMode="numeric"
                              placeholder="ელფოსტაზე მიღებული კოდი"
                              value={otpCodeInput}
                              onChange={(e) => setOtpCodeInput(e.target.value)}
                            />
                          </S.InputWrapper>
                          <S.OtpActionBtn
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={otpVerifying || !otpCodeInput.trim()}
                          >
                            {otpVerifying ? "მოწმდება..." : "დადასტურება"}
                          </S.OtpActionBtn>
                        </S.FieldRow>
                      )}
                      {otpError && <S.FieldError>{otpError}</S.FieldError>}
                    </S.ReadonlyField>
                     <S.SaveInfoRow>
                    <S.SaveInfoButton type="button" onClick={handleSavePersonalInfo} disabled={savingInfo}>
                      {savingInfo ? "ინახება..." : "მონაცემების შენახვა"}
                    </S.SaveInfoButton>
                  </S.SaveInfoRow>
                  </S.PersonalGrid>

                 

                  {purchaseBlocked && (
                    <S.InfoAlert>
                      <WarningIcon size={16} />
                      <span>
                        შეკვეთის გასაფორმებლად საჭიროა ელფოსტის და მობილურის დადასტურება და პირადი ნომრის
                        შევსება — შეავსეთ ველები ზემოთ და დააჭირეთ &bdquo;მონაცემების შენახვას&ldquo;.
                      </span>
                    </S.InfoAlert>
                  )}
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>
                    მიწოდების დეტალები <S.HintIcon title="შეკვეთა ამჟამად საკურიერო მომსახურებით იგზავნება">ⓘ</S.HintIcon>
                  </S.SectionTitle>
                  <S.MethodRow>
                    <S.MethodOption $active type="button">
                      <TruckIcon size={20} />
                      საკურიერო მომსახურება
                    </S.MethodOption>
                    <S.MethodOption $disabled type="button" disabled>
                      <BoxIcon size={20} />
                      ფილიალიდან გატანა
                      <S.SoonBadge>მალე</S.SoonBadge>
                    </S.MethodOption>
                  </S.MethodRow>

                  <S.AddressCard>
                    <PinIcon size={18} />
                    <S.AddressBody>
                      <S.Label>მისამართი</S.Label>
                      <S.Textarea
                        rows={2}
                        placeholder="ქალაქი, ქუჩა, სახლის ნომერი..."
                        $invalid={!!errors.shippingAddress}
                        {...register("shippingAddress")}
                      />
                      {errors.shippingAddress && <S.FieldError>{errors.shippingAddress.message}</S.FieldError>}
                    </S.AddressBody>
                  </S.AddressCard>
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>გადახდის მეთოდი</S.SectionTitle>
                  <S.MethodRow>
                    <S.MethodOption $active type="button">
                      საქართველოს ბანკი
                    </S.MethodOption>
                    <S.MethodOption $disabled type="button" disabled>
                      თიბისი ბანკი
                      <S.SoonBadge>მალე</S.SoonBadge>
                    </S.MethodOption>
                  </S.MethodRow>
                </S.SectionCard>
              </S.FormColumn>

              <S.SummaryColumn>
                <S.SummaryTitle>შეკვეთა</S.SummaryTitle>
                <S.SummaryRow>
                  <span>პროდუქტი ({itemsCount})</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                <S.SummaryRow>
                  <span>მიტანის დირებულება:</span>
                  <span>უფასო</span>
                </S.SummaryRow>
                <S.Divider />
                <S.SummaryRow>
                  <span>სულ თანხა:</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                {discount > 0 && (
                  <S.SummaryRow $discount>
                    <span>ფასდაკლება:</span>
                    <span>-{discount.toFixed(2)} ₾</span>
                  </S.SummaryRow>
                )}
                <S.TotalRow>
                  ჯამში გადასახდელი:
                  <S.TotalValue>{total.toFixed(2)} ₾</S.TotalValue>
                </S.TotalRow>

                <S.DeliveryNotice>
                  <TruckIcon size={18} />
                  <span>
                    მიტანის თარიღი: 7-8 სექტემბერი
                    <br />
                    თუ შეკვეთავთ დღეს, 13:00 საათის შემდეგ
                  </span>
                </S.DeliveryNotice>

                <S.SubmitButton type="submit" disabled={submitting || purchaseBlocked}>
                  <LockIcon size={16} />
                  {submitting ? "მუშავდება..." : "ბარათით გადახდა (BOG)"}
                </S.SubmitButton>
              </S.SummaryColumn>
            </S.Layout>
          )}
        </S.Container>
      </S.PageBackground>
      <Footer />
    </>
  );
};

export default CheckoutComponent;
