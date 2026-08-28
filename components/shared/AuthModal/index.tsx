import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as S from "./style";
import { AuthAPI, OtpAPI } from "@/API_Client";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, CloseIcon, FacebookIcon, GoogleIcon, WarningIcon } from "@/components/ui/RefIcons";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import MobilePopup from "@/components/ui/MobilePopup";
import {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordFormValues,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/components/shared/validation/schemas";

// ველში მომხმარებელი 9-ციფრიან ქართულ მობილურის ნომერს (ქვეყნის კოდის გარეშე) შეიყვანს,
// ბექენდისთვის/verify.ge-სთვის კი E.164 ფორმატია საჭირო (მაგ. +995555123456)
const toE164 = (localNumber: string) => `+995${localNumber.replace(/\D/g, "")}`;

export type AuthMode = "login" | "register" | "forgot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const router = useRouter();

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { lang } = useTranslation("common");
  const session = useSession();
  const isMobile = useIsMobileDevice();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      personalNumber: "",
      gender: "male",
      password: "",
      confirmPassword: "",
      otpRequestId: "",
      otpCode: "",
    },
  });

  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const regGender = registerForm.watch("gender");
  const regPhoneNumber = registerForm.watch("phoneNumber");
  const regOtpRequestId = registerForm.watch("otpRequestId");

  // მობილურის ვერიფიკაციის სტეიტი — რეგისტრაცია დაბლოკილია, სანამ OTP-კოდი არაა დადასტურებული
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  // ნომრის შეცვლისას ძველი ვერიფიკაცია აღარაა ვალიდური
  useEffect(() => {
    if (otpSent || otpVerified) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCodeInput("");
      registerForm.setValue("otpRequestId", "");
      registerForm.setValue("otpCode", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regPhoneNumber]);

  const handleSendOtp = async () => {
    setOtpError(null);

    const isPhoneValid = await registerForm.trigger("phoneNumber");
    if (!isPhoneValid) return;

    setOtpSending(true);
    try {
      const resp = await OtpAPI(lang, "").otpControllerSendOtp({
        phoneNumber: toE164(regPhoneNumber),
      });
      registerForm.setValue("otpRequestId", resp.data.requestId);
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(
        err?.response?.data?.message || "OTP-კოდის გაგზავნა ვერ მოხერხდა"
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);

    if (!otpCodeInput.trim()) {
      setOtpError("გთხოვთ შეიყვანოთ დადასტურების კოდი");
      return;
    }

    setOtpVerifying(true);
    try {
      await OtpAPI(lang, "").otpControllerVerifyOtp({
        requestId: regOtpRequestId,
        code: otpCodeInput.trim(),
      });
      registerForm.setValue("otpCode", otpCodeInput.trim());
      setOtpVerified(true);
    } catch (err: any) {
      setOtpError(
        err?.response?.data?.message || "კოდი არასწორია ან ვადაგასულია"
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccess(null);
    loginForm.reset();
    registerForm.reset();
    forgotForm.reset();
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleTabSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  // 1. LOGIN HANDLER
  const onLoginSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      setLoading(false);

      if (!res?.ok || res?.error) {
        setError("არასწორი ელფოსტა ან პაროლი");
      } else {
        onClose();
        router.push('/');
      }
    } catch (err: any) {
      setLoading(false);
      setError("ავტორიზაციის დროს დაფიქსირდა შეცდომა");
    }
  };

  // 2. REGISTER HANDLER
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setSuccess(null);

    if (!otpVerified) {
      setError("რეგისტრაციისთვის საჭიროა მობილურის ნომრის დადასტურება");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        gender: data.gender || undefined,
        phoneNumber: toE164(data.phoneNumber),
        personalNumber: data.personalNumber,
        otpRequestId: data.otpRequestId,
        otpCode: data.otpCode,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("რეგისტრაცია წარმატებით დასრულდა! მიმდინარეობს შესვლა...");

        // Auto-login after registration
        const loginRes = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        setLoading(false);

        if (loginRes?.ok) {
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 1000);
        } else {
          setMode("login");
          loginForm.setValue("email", data.email);
        }
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err?.response?.data?.message || "რეგისტრაციისას დაფიქსირდა შეცდომა";
      setError(msg);
    }
  };

  // 3. FORGOT PASSWORD HANDLER
  const onForgotSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const resp = await (
        await AuthAPI(
          lang,
          session.data?.accessToken ?? ""
        ).authControllerForgotPassword({
          email: data.email,
        })
      ).data;

      setLoading(false);
      setSuccess(
        (resp as any)?.message ||
          "პაროლის აღდგენის ინსტრუქცია გაიგზავნა თქვენს ელფოსტაზე"
      );
    } catch (err: any) {
      setLoading(false);
      const msg =
        err?.response?.data?.message || "შეცდომა პაროლის აღდგენისას";
      setError(msg);
    }
  };

  const content = (
    <>
      {/* Header */}
        <S.ModalHeader>
          <S.Title>
            {mode === "login" && "ავტორიზაცია"}
            {mode === "register" && "რეგისტრაცია"}
            {mode === "forgot" && "პაროლის აღდგენა"}
          </S.Title>
          <S.CloseButton onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </S.CloseButton>
        </S.ModalHeader>

        {/* Tab switcher (Login / Register) */}
        {mode !== "forgot" && (
          <S.TabBar>
            <S.TabButton
              active={mode === "login"}
              onClick={() => handleTabSwitch("login")}
              type="button"
            >
              შესვლა
            </S.TabButton>
            <S.TabButton
              active={mode === "register"}
              onClick={() => handleTabSwitch("register")}
              type="button"
            >
              რეგისტრაცია
            </S.TabButton>
          </S.TabBar>
        )}

        {/* Alerts */}
        <div style={{ padding: "0 20px", marginTop: "12px" }}>
          {error && (
            <S.ErrorAlert>
              <WarningIcon size={16} /> {error}
            </S.ErrorAlert>
          )}
          {success && (
            <S.SuccessAlert>
              <CheckCircleIcon size={16} /> {success}
            </S.SuccessAlert>
          )}
        </div>

        {/* 1. LOGIN FORM */}
        {mode === "login" && (
          <S.FormContainer onSubmit={loginForm.handleSubmit(onLoginSubmit)}>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "var(--ref-bg-elevated)",
                color: "var(--ref-text-primary)",
                border: "1.5px solid var(--ref-border-soft)",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              <GoogleIcon size={16} /> Google-ით შესვლა
            </button>
            {/* ⚠️ დროებით გამორთულია Facebook-ით შესვლა (Facebook App ჯერ Development/Unpublished რეჟიმშია)
            <button
              type="button"
              onClick={() => signIn("facebook", { callbackUrl: "/" })}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "var(--ref-primary)",
                color: "var(--ref-text-on-primary)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <FacebookIcon size={18} /> Facebook-ით შესვლა
            </button>
            */}

            <S.FormGroup>
              <S.Label>ელფოსტა</S.Label>
              <S.InputWrapper>
                <S.Input
                  type="email"
                  placeholder="example@domain.com"
                  $invalid={!!loginForm.formState.errors.email}
                  {...loginForm.register("email")}
                />
              </S.InputWrapper>
              {loginForm.formState.errors.email && (
                <S.FieldError>{loginForm.formState.errors.email.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>პაროლი</S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  $invalid={!!loginForm.formState.errors.password}
                  {...loginForm.register("password")}
                />
                <S.TogglePasswordBtn
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? "დამალვა" : "ჩვენება"}
                </S.TogglePasswordBtn>
              </S.InputWrapper>
              {loginForm.formState.errors.password && (
                <S.FieldError>{loginForm.formState.errors.password.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FooterLinks style={{ justifyContent: "flex-end" }}>
              <S.LinkBtn
                type="button"
                onClick={() => handleTabSwitch("forgot")}
              >
                დაგავიწყდათ პაროლი?
              </S.LinkBtn>
            </S.FooterLinks>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? "მიმდინარეობს შესვლა..." : "შესვლა"}
            </S.SubmitButton>
          </S.FormContainer>
        )}

        {/* 2. REGISTER FORM */}
        {mode === "register" && (
          <S.FormContainer onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input
                  type="text"
                  placeholder="გიორგი"
                  $invalid={!!registerForm.formState.errors.firstName}
                  {...registerForm.register("firstName")}
                />
                {registerForm.formState.errors.firstName && (
                  <S.FieldError>{registerForm.formState.errors.firstName.message}</S.FieldError>
                )}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input
                  type="text"
                  placeholder="ბერიძე"
                  $invalid={!!registerForm.formState.errors.lastName}
                  {...registerForm.register("lastName")}
                />
                {registerForm.formState.errors.lastName && (
                  <S.FieldError>{registerForm.formState.errors.lastName.message}</S.FieldError>
                )}
              </S.FormGroup>
            </div>

            <S.FormGroup>
              <S.Label>ელფოსტა</S.Label>
              <S.Input
                type="email"
                placeholder="example@domain.com"
                $invalid={!!registerForm.formState.errors.email}
                {...registerForm.register("email")}
              />
              {registerForm.formState.errors.email && (
                <S.FieldError>{registerForm.formState.errors.email.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>პირადი ნომერი</S.Label>
              <S.Input
                type="text"
                inputMode="numeric"
                placeholder="11-ციფრიანი პირადი ნომერი"
                maxLength={11}
                $invalid={!!registerForm.formState.errors.personalNumber}
                {...registerForm.register("personalNumber")}
              />
              {registerForm.formState.errors.personalNumber && (
                <S.FieldError>{registerForm.formState.errors.personalNumber.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>მობილურის ნომერი</S.Label>
              <S.PhoneRow>
                <S.InputWrapper>
                  <S.Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="5XX XX XX XX"
                    maxLength={9}
                    disabled={otpVerified}
                    $invalid={!!registerForm.formState.errors.phoneNumber}
                    {...registerForm.register("phoneNumber")}
                  />
                </S.InputWrapper>
                {otpVerified ? (
                  <S.VerifiedBadge>
                    <CheckCircleIcon size={15} /> დადასტურებულია
                  </S.VerifiedBadge>
                ) : (
                  <S.OtpActionBtn
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || !regPhoneNumber}
                  >
                    {otpSending ? "იგზავნება..." : otpSent ? "ხელახლა გაგზავნა" : "კოდის გაგზავნა"}
                  </S.OtpActionBtn>
                )}
              </S.PhoneRow>
              {registerForm.formState.errors.phoneNumber && (
                <S.FieldError>{registerForm.formState.errors.phoneNumber.message}</S.FieldError>
              )}
            </S.FormGroup>

            {otpSent && !otpVerified && (
              <S.FormGroup>
                <S.Label>დადასტურების კოდი</S.Label>
                <S.PhoneRow>
                  <S.InputWrapper>
                    <S.Input
                      type="text"
                      inputMode="numeric"
                      placeholder="SMS-ით მიღებული კოდი"
                      value={otpCodeInput}
                      onChange={(e) => setOtpCodeInput(e.target.value)}
                    />
                  </S.InputWrapper>
                  <S.OtpActionBtn
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || !otpCodeInput.trim()}
                  >
                    {otpVerifying ? "მოწმდება..." : "დადასტურება"}
                  </S.OtpActionBtn>
                </S.PhoneRow>
              </S.FormGroup>
            )}

            {otpError && (
              <S.FieldError>{otpError}</S.FieldError>
            )}
            {registerForm.formState.errors.otpRequestId && !otpError && (
              <S.FieldError>{registerForm.formState.errors.otpRequestId.message}</S.FieldError>
            )}

            <S.FormGroup>
              <S.Label>სქესი</S.Label>
              <S.GenderSwitch>
                <S.GenderThumb
                  position={
                    regGender === "female" ? "right" : "left"
                  }
                />
                <S.GenderOption
                  type="button"
                  active={regGender === "male"}
                  onClick={() => registerForm.setValue("gender", "male")}
                >
                  კაცი
                </S.GenderOption>
                <S.GenderOption
                  type="button"
                  active={regGender === "female"}
                  onClick={() => registerForm.setValue("gender", "female")}
                >
                  ქალი
                </S.GenderOption>
              </S.GenderSwitch>
              {registerForm.formState.errors.gender && (
                <S.FieldError>{registerForm.formState.errors.gender.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>პაროლი</S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="მინიმუმ 6 სიმბოლო"
                  $invalid={!!registerForm.formState.errors.password}
                  {...registerForm.register("password")}
                />
                <S.TogglePasswordBtn
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? "დამალვა" : "ჩვენება"}
                </S.TogglePasswordBtn>
              </S.InputWrapper>
              {registerForm.formState.errors.password && (
                <S.FieldError>{registerForm.formState.errors.password.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>გაიმეორეთ პაროლი</S.Label>
              <S.Input
                type={showRegPassword ? "text" : "password"}
                placeholder="გაიმეორეთ პაროლი"
                $invalid={!!registerForm.formState.errors.confirmPassword}
                {...registerForm.register("confirmPassword")}
              />
              {registerForm.formState.errors.confirmPassword && (
                <S.FieldError>{registerForm.formState.errors.confirmPassword.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.SubmitButton type="submit" disabled={loading || !otpVerified}>
              {loading ? "მიმდინარეობს რეგისტრაცია..." : "რეგისტრაცია"}
            </S.SubmitButton>
          </S.FormContainer>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <S.FormContainer onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
            <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)", margin: 0 }}>
              შეიყვანეთ ელფოსტა, რომლითაც დარეგისტრირებული ხართ და გამოგიგზავნით პაროლის აღდგენის ინსტრუქციას.
            </p>

            <S.FormGroup>
              <S.Label>ელფოსტა</S.Label>
              <S.Input
                type="email"
                placeholder="example@domain.com"
                $invalid={!!forgotForm.formState.errors.email}
                {...forgotForm.register("email")}
              />
              {forgotForm.formState.errors.email && (
                <S.FieldError>{forgotForm.formState.errors.email.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? "გაგზავნა..." : "აღდგენის ინსტრუქციის გაგზავნა"}
            </S.SubmitButton>

            <S.FooterLinks style={{ justifyContent: "center", marginTop: "8px" }}>
              <S.LinkBtn
                type="button"
                onClick={() => handleTabSwitch("login")}
              >
                ← ავტორიზაციაზე დაბრუნება
              </S.LinkBtn>
            </S.FooterLinks>
          </S.FormContainer>
        )}
    </>
  );

  if (isMobile) {
    return (
      <MobilePopup onClose={onClose} overflowScroll>
        {content}
      </MobilePopup>
    );
  }

  return (
    <S.Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        {content}
      </S.ModalContainer>
    </S.Overlay>
  );
};

export default AuthModal;
