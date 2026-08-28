import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/shared/Header";
import { OtpAPI, UserAPI } from "@/API_Client";
import { User, UserGenderEnum } from "@/API_Client/types";
import { ProfileLayout } from "./ProfileLayout";
import { CalendarIcon, CheckCircleIcon, LockIcon, ShieldIcon, UserIcon, WarningIcon } from "@/components/ui/RefIcons";
import * as S from "./style";
import {
  ProfileEditFormValues,
  profileEditSchema,
  AGE_MIN,
  AGE_MAX,
} from "@/components/shared/validation/schemas";

// ველში მომხმარებელი 9-ციფრიან ქართულ მობილურის ნომერს (ქვეყნის კოდის გარეშე) შეიყვანს,
// ბექენდისთვის/verify.ge-სთვის კი E.164 ფორმატია საჭირო (მაგ. +995555123456)
const toE164 = (localNumber: string) => `+995${localNumber.replace(/\D/g, "")}`;
// ბაზაში შენახული ნომერი E.164 ფორმატშია — ფორმაში რედაქტირებისთვის ქვეყნის კოდს ვაცილებთ
const fromE164 = (phone: string) => phone.replace(/^\+995/, "");

export const ProfileComponent: React.FC = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  // მიმდინარე, ბაზაში შენახული ელფოსტა/მობილური — ამის შედარებით ვხვდებით, შეიცვალა
  // თუ არა ფორმის ველი და სჭირდება თუ არა ახალი მნიშვნელობის დადასტურება.
  const [savedEmail, setSavedEmail] = useState<string>("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting: savingUser },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      gender: "" as ProfileEditFormValues["gender"],
      phoneNumber: "",
      personalNumber: "",
    },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const gender = watch("gender");
  const email = watch("email");
  const phoneNumber = watch("phoneNumber") || "";

  // ელფოსტის ცვლილების OTP-ვერიფიკაციის სტეიტი — ახალი ელფოსტის შენახვა
  // დაბლოკილია, სანამ დადასტურების კოდი არაა შემოწმებული.
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

  // ელფოსტის ველის ხელახლა შეცვლისას ძველი ვერიფიკაცია აღარაა ვალიდური
  useEffect(() => {
    if (otpSent || otpVerified) {
      resetEmailOtpState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // მობილურის ნომრის ცვლილების OTP-ვერიფიკაციის სტეიტი — ისევე, როგორც ელფოსტისთვის,
  // ახალი ნომრის შენახვა დაბლოკილია, სანამ SMS-ით მიღებული კოდი არაა შემოწმებული.
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

  // მობილურის ნომრის ველის ხელახლა შეცვლისას ძველი ვერიფიკაცია აღარაა ვალიდური
  useEffect(() => {
    if (phoneOtpSent || phoneOtpVerified) {
      resetPhoneOtpState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  const handleSendPhoneOtp = async () => {
    setPhoneOtpError(null);

    const isPhoneValid = await trigger("phoneNumber");
    if (!isPhoneValid) return;

    setPhoneOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendOtp({
        phoneNumber: toE164(phoneNumber),
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

  const handleSendEmailOtp = async () => {
    setOtpError(null);

    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    setOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendEmailOtp({
        email: email.trim(),
      });
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

  const fetchUser = async () => {
    if (!session?.accessToken || !session?.user?.id) return;
    setLoadingUser(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerFindOne(session.user.id);
      const u = res.data as User;
      const localPhoneNumber = u.phoneNumber ? fromE164(u.phoneNumber) : "";
      setUser(u);
      setSavedEmail(u.email || "");
      setSavedPhoneNumber(localPhoneNumber);
      reset({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        age: u.age != null ? String(u.age) : "",
        gender: (u.gender || "") as ProfileEditFormValues["gender"],
        phoneNumber: localPhoneNumber,
        personalNumber: u.personalNumber || "",
      });
    } catch {
      toast.error("მომხმარებლის ინფორმაციის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, session]);

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
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
            <S.AccessDeniedTitle>წვდომა უარყოფილია</S.AccessDeniedTitle>
            <S.AccessDeniedText>ამ გვერდზე გადასასვლელად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  // ყიდვისთვის სავალდებულო მონაცემები — მხოლოდ შენახულ (ბაზაში დაფიქსირებულ)
  // მდგომარეობას ვამოწმებთ, არა ფორმაში მიმდინარე, შეუნახავ რედაქტირებას.
  const emailNotVerified = !user?.isEmailVerified;
  const phoneNotVerified = !user?.isPhoneVerified;
  const personalNumberMissing = !user?.personalNumber?.trim();
  const purchaseBlocked = emailNotVerified || phoneNotVerified || personalNumberMissing;

  // OTP დადასტურების UI (ღილაკი/კოდის ველი) უნდა გამოჩნდეს არა მხოლოდ მაშინ, როცა
  // მომხმარებელი ცვლის ელფოსტას/ნომერს, არამედ იმ შემთხვევაშიც, როცა ამჟამინდელი
  // (შენახული) ღირებულება უბრალოდ დაუდასტურებელია — თორემ არსებული, დაუდასტურებელი
  // ელფოსტის/ნომრის დადასტურება საერთოდ შეუძლებელი იქნებოდა.
  const emailNeedsVerificationUi = !!email?.trim() && (email.trim() !== savedEmail || emailNotVerified);
  const phoneNeedsVerificationUi =
    !!phoneNumber?.trim() && (phoneNumber.trim() !== savedPhoneNumber || phoneNotVerified);

  const getUserInitials = () => {
    const fn = firstName || user?.firstName || "";
    const ln = lastName || user?.lastName || "";
    if (fn || ln) return `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "U";
    const name = session?.user?.name || session?.user?.email || "";
    return name.slice(0, 2).toUpperCase() || "U";
  };

  const onSaveUser = async (data: ProfileEditFormValues) => {
    if (!session?.accessToken || !session?.user?.id) return;

    const newEmail = data.email.trim();
    const emailChanged = newEmail !== savedEmail;
    const newPhoneNumber = data.phoneNumber?.trim() || "";
    const phoneChanged = newPhoneNumber !== savedPhoneNumber;

    // ელფოსტის/მობილურის ღირებულების შეცვლისას სავალდებულოა წინასწარ დადასტურებული
    // OTP კოდი — Save ღილაკიც დაბლოკილია ამ პირობით (იხ. disabled ქვემოთ), მაგრამ
    // submit-ზეც ვამოწმებთ. მნიშვნელოვანია: თუ ღირებულება არ შეცვლილა (უბრალოდ
    // ჯერ დაუდასტურებელია), ეს Save-ს არ უნდა ბლოკავდეს — მომხმარებელს უნდა
    // შეეძლოს დანარჩენი ველების შენახვა მანამ, სანამ ცალკე გადაწყვეტს
    // ელფოსტის/მობილურის დამოწმებას.
    if (emailChanged && !otpVerified) {
      toast.error("ელფოსტის შესაცვლელად საჭიროა ახალი ელფოსტის დადასტურება");
      return;
    }
    if (phoneChanged && !phoneOtpVerified) {
      toast.error("მობილურის ნომრის შესაცვლელად საჭიროა ახალი ნომრის დადასტურება");
      return;
    }

    // OTP proof-ს ვურთავთ, თუ ან ღირებულება შეიცვალა (ზემოთ უკვე დავრწმუნდით, რომ
    // დადასტურებულია), ან მომხმარებელმა ახლახან წარმატებით გაიარა OTP-ვერიფიკაცია
    // ამჟამინდელ (შენახულ, მაგრამ დაუდასტურებელ) ღირებულებაზეც — ორივე შემთხვევაში
    // ბექენდმა უნდა დააფიქსიროს isEmailVerified/isPhoneVerified.
    const includeEmailOtpProof = emailChanged || otpVerified;
    const includePhoneOtpProof = phoneChanged || phoneOtpVerified;

    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        session.user.id,
        {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: newEmail,
          gender: data.gender ? (data.gender as any) : undefined,
          age: data.age?.trim() ? Number(data.age) : undefined,
          phoneNumber: newPhoneNumber ? toE164(newPhoneNumber) : undefined,
          personalNumber: data.personalNumber?.trim() ? data.personalNumber.trim() : undefined,
          ...(includeEmailOtpProof ? { otpRequestId, otpCode: otpCodeInput.trim() } : {}),
          ...(includePhoneOtpProof
            ? { phoneOtpRequestId, phoneOtpCode: phoneOtpCodeInput.trim() }
            : {}),
        }
      );
      setUser(res.data as User);
      setSavedEmail(newEmail);
      setSavedPhoneNumber(newPhoneNumber);
      resetEmailOtpState();
      resetPhoneOtpState();
      await updateSession({ name: `${data.firstName.trim()} ${data.lastName.trim()}` });
      toast.success("პროფილი წარმატებით განახლდა!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროფილის განახლება ვერ მოხერხდა");
    }
  };

  return (
    <ProfileLayout
      activeTab="info"
      title="პროფილი"
      subtitle="მართეთ თქვენი პირადი ინფორმაცია და ფავორიტი კითხვები"
    >
      <S.Card>
        {!loadingUser && purchaseBlocked && (
          <S.Alert>
            <WarningIcon size={16} />
            <span>
              ყიდვისთვის საჭიროა{" "}
              {[
                emailNotVerified && "ელფოსტის დადასტურება",
                phoneNotVerified && "მობილურის ნომრის დადასტურება",
                personalNumberMissing && "პირადი ნომრის შევსება",
              ]
                .filter(Boolean)
                .join(", ")}
              . ქვემოთ გაწითლებული ველები საჭიროებს თქვენს ყურადღებას.
            </span>
          </S.Alert>
        )}

        <S.ProfileSummary>
          <S.AvatarCircle>{getUserInitials()}</S.AvatarCircle>
          <S.ProfileInfo>
            <S.ProfileName>
              {(user?.firstName || firstName) ? `${firstName || user?.firstName} ${lastName || user?.lastName}` : session?.user?.name || session?.user?.email}
            </S.ProfileName>
            <S.ProfileEmail>{email || session?.user?.email}</S.ProfileEmail>
            <S.BadgeRow>
              {user?.role && (
                <S.Badge variant="role">
                  {user.role === "admin" ? <ShieldIcon size={14} /> : <UserIcon size={14} />}
                  {user.role === "admin" ? "ადმინისტრატორი" : "მომხმარებელი"}
                </S.Badge>
              )}
              {user?.createdAt && (
                <S.Badge variant="date">
                  <CalendarIcon size={13} /> რეგისტრირებულია {new Date(user.createdAt).toLocaleDateString("ka-GE")}
                </S.Badge>
              )}
            </S.BadgeRow>
          </S.ProfileInfo>
        </S.ProfileSummary>

        {loadingUser ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSaveUser)}>
            <S.FormGrid>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input
                  type="text"
                  $invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName && <S.FieldError>{errors.firstName.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input
                  type="text"
                  $invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName && <S.FieldError>{errors.lastName.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ასაკი</S.Label>
                <S.Input
                  type="number"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  $invalid={!!errors.age}
                  {...register("age")}
                />
                {errors.age && <S.FieldError>{errors.age.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სქესი</S.Label>
                <S.Select value={gender} onChange={(e) => setValue("gender", e.target.value as any)}>
                  <option value="" disabled hidden>
                    აირჩიეთ სქესი
                  </option>
                  <option value="male">კაცი</option>
                  <option value="female">ქალი</option>
                </S.Select>
                {errors.gender && <S.FieldError>{errors.gender.message as string}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ელფოსტა{emailNotVerified && !errors.email && <S.RequiredHint> — არადამოწმებული</S.RequiredHint>}</S.Label>
                <S.FieldRow>
                  <S.InputWrapper>
                    <S.Input
                      type="email"
                      $invalid={!!errors.email || emailNotVerified}
                      {...register("email")}
                    />
                  </S.InputWrapper>
                  {emailNeedsVerificationUi && (
                    otpVerified ? (
                      <S.VerifiedBadge>
                        <CheckCircleIcon size={15} /> დადასტურებულია
                      </S.VerifiedBadge>
                    ) : (
                      <S.OtpActionBtn
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={otpSending || !!errors.email}
                      >
                        {otpSending ? "იგზავნება..." : otpSent ? "ხელახლა გაგზავნა" : "დამოწმება"}
                      </S.OtpActionBtn>
                    )
                  )}
                </S.FieldRow>
                {errors.email && <S.FieldError>{errors.email.message}</S.FieldError>}

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
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>მობილურის ნომერი{phoneNotVerified && !errors.phoneNumber && <S.RequiredHint> — არადამოწმებული</S.RequiredHint>}</S.Label>
                <S.FieldRow>
                  <S.InputWrapper>
                    <S.Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="5XX XX XX XX"
                      maxLength={9}
                      $invalid={!!errors.phoneNumber || phoneNotVerified}
                      {...register("phoneNumber")}
                    />
                  </S.InputWrapper>
                  {phoneNeedsVerificationUi && (
                    phoneOtpVerified ? (
                      <S.VerifiedBadge>
                        <CheckCircleIcon size={15} /> დადასტურებულია
                      </S.VerifiedBadge>
                    ) : (
                      <S.OtpActionBtn
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={phoneOtpSending || !!errors.phoneNumber}
                      >
                        {phoneOtpSending ? "იგზავნება..." : phoneOtpSent ? "ხელახლა გაგზავნა" : "დამოწმება"}
                      </S.OtpActionBtn>
                    )
                  )}
                </S.FieldRow>
                {errors.phoneNumber && <S.FieldError>{errors.phoneNumber.message}</S.FieldError>}

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
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>პირადი ნომერი{personalNumberMissing && !errors.personalNumber && <S.RequiredHint> — შეავსეთ</S.RequiredHint>}</S.Label>
                <S.Input
                  type="text"
                  $invalid={!!errors.personalNumber || personalNumberMissing}
                  {...register("personalNumber")}
                />
                {errors.personalNumber && <S.FieldError>{errors.personalNumber.message}</S.FieldError>}
              </S.FormGroup>
            </S.FormGrid>

            <S.FormFooter>
              <S.ActionButton
                type="submit"
                variant="primary"
                disabled={
                  savingUser ||
                  (email?.trim() !== savedEmail && !otpVerified) ||
                  (phoneNumber?.trim() !== savedPhoneNumber && !phoneOtpVerified)
                }
              >
                {savingUser ? "ინახება..." : "ცვლილებების შენახვა"}
              </S.ActionButton>
            </S.FormFooter>
          </form>
        )}
      </S.Card>
    </ProfileLayout>
  );
};

export default ProfileComponent;
