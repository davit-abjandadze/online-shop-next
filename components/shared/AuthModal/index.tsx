import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as S from "./style";
import { AuthAPI, OtpAPI } from "@/API_Client";
import useTranslation from "next-translate/useTranslation";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

// NextAuth-ის authorize-ის 429-ის error კოდი (იხ. pages/api/auth/[...nextauth].ts)
const TOO_MANY_ATTEMPTS_ERROR = "TOO_MANY_ATTEMPTS";

// callbackUrl მხოლოდ იმავე საიტის ფარდობითი მისამართი შეიძლება იყოს — "//evil.com"
// ან "https://..." open redirect იქნებოდა.
const getSafeCallbackUrl = (value: string | null | undefined) =>
  value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : null;

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
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // რეგისტრაციის SMS-ვერიფიკაცია (ბექენდის PHONE_VERIFICATION_ENABLED) — ფრონტმა
  // წინასწარ არ იცის ჩართულია თუ არა, ამიტომ ჯერ ვცდით OTP-ის გარეშე; თუ
  // ბექენდი OTP-ს მოითხოვს, კოდს ვაგზავნით და კოდის ველი ჩნდება. კოდს ბექენდი
  // რეგისტრაციისას თავად ამოწმებს (consumeVerifiedOtp) — ცალკე /otp/verify არ
  // ვიძახებთ, რადგან verify.ge-ს კოდი ერთჯერადია.
  const [regOtpRequestId, setRegOtpRequestId] = useState<string | null>(null);
  const [regOtpPhone, setRegOtpPhone] = useState<string | null>(null);
  const [regOtpCode, setRegOtpCode] = useState("");

  const { lang, t } = useTranslation("common");
  const session = useSession();
  const isMobile = useIsMobileDevice();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccess(null);
    loginForm.reset();
    registerForm.reset();
    forgotForm.reset();
    setRegOtpRequestId(null);
    setRegOtpPhone(null);
    setRegOtpCode("");
  }, [initialMode, isOpen]);

  // Google/Facebook-ით შესვლისას ბრაუზერი მთლიანად NextAuth-ზე გადადის
  // (redirect: false აქ არ გამოიყენება, რადგან OAuth ასე მუშაობს) და
  // ჩავარდნისას (signIn callback აბრუნებს false-ს, მაგ. ბექენდმა ვერ
  // გადაამოწმა ტოკენი) NextAuth ავტომატურად pages.signIn-ზე ("/login")
  // გვაბრუნებს ?error=... პარამეტრით — აქამდე ეს არსად არ იკითხებოდა და
  // მომხმარებელი უბრალოდ ისევ login მოდალთან რჩებოდა ისე, რომ არაფერი
  // ეცნობებოდა ჩავარდნის შესახებ.
  useEffect(() => {
    const oauthError = searchParams?.get("error");
    if (isOpen && oauthError) {
      setMode("login");
      setError(t("auth-modal-error-oauth"));
      router.replace("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  // OAuth-ის შემდეგ იმავე (ენის პრეფიქსიან) გვერდზე დაბრუნება — "/" ყოველთვის
  // default ლოკალზე (ka) გადაიყვანდა en/ru მომხმარებელს.
  const getOAuthCallbackUrl = () => {
    const explicit = getSafeCallbackUrl(searchParams?.get("callbackUrl"));
    if (explicit) return explicit;
    if (typeof window === "undefined") return `/${lang}`;
    const current = window.location.pathname;
    return current.endsWith("/login") ? `/${lang}` : `${current}${window.location.search}`;
  };

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
        // დაბლოკილ მომხმარებელს "არასწორი პაროლი" ხელახლა ცდისკენ უბიძგებდა
        // (რაც ბლოკს ახანგრძლივებს) — ცალკე შეტყობინება.
        setError(
          res?.error === TOO_MANY_ATTEMPTS_ERROR
            ? t("login-error-too-many-attempts")
            : t("auth-modal-error-login-invalid")
        );
      } else {
        onClose();
        // /login გვერდიდან — callbackUrl-ზე (ან მთავარზე); სხვა გვერდზე გახსნილი
        // მოდალიდან კი იმავე გვერდზე ვრჩებით, ადრე ყოველთვის "/"-ზე გადადიოდა.
        const callbackUrl = getSafeCallbackUrl(searchParams?.get("callbackUrl"));
        if (callbackUrl) router.push(callbackUrl);
        else if (pathname?.endsWith("/login")) router.push("/");
      }
    } catch (err: any) {
      setLoading(false);
      setError(t("auth-modal-error-login-generic"));
    }
  };

  const sendRegisterOtp = async (phoneE164: string): Promise<boolean> => {
    try {
      const resp = await OtpAPI(lang || "ka", "").otpControllerSendOtp({ phoneNumber: phoneE164 });
      if (!resp.data.requestId) {
        setError(t("auth-modal-otp-send-failed"));
        return false;
      }
      setRegOtpRequestId(resp.data.requestId);
      setRegOtpPhone(phoneE164);
      setRegOtpCode("");
      setSuccess(t("auth-modal-otp-sent"));
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || t("auth-modal-otp-send-failed"));
      return false;
    }
  };

  // 2. REGISTER HANDLER
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setSuccess(null);

    const phoneE164 = toE164(data.phoneNumber);
    // ნომერი შეიცვალა კოდის გაგზავნის შემდეგ — ძველი requestId სხვა ნომერზეა გაცემული
    if (regOtpRequestId && regOtpPhone !== phoneE164) {
      setLoading(true);
      await sendRegisterOtp(phoneE164);
      setLoading(false);
      return;
    }
    if (regOtpRequestId && !regOtpCode.trim()) {
      setError(t("auth-modal-otp-required"));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: phoneE164,
        ...(regOtpRequestId ? { otpRequestId: regOtpRequestId, otpCode: regOtpCode.trim() } : {}),
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess(t("auth-modal-success-register"));

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
      const msg = err?.response?.data?.message || t("auth-modal-error-register-generic");
      const errorCode = err?.response?.data?.errorCode;

      // ბექენდი OTP-ს მოითხოვს (SMS-ვერიფიკაცია ჩართულია) — კოდს ვაგზავნით
      if (!regOtpRequestId && err?.response?.status === 400 && typeof msg === "string" && msg.includes("OTP")) {
        await sendRegisterOtp(phoneE164);
        setLoading(false);
        return;
      }
      setLoading(false);

      // ბექენდი დუბლირებულ ელფოსტას/ნომერზე errorCode-ს აბრუნებს (EMAIL_DUPLICATE /
      // PHONE_DUPLICATE) — ამის მიხედვით ვცნობთ შესაბამის ველს და ვწითლებთ, რომ
      // მომხმარებელმა ზუსტად დაინახოს პრობლემური ველი.
      if (errorCode === "EMAIL_DUPLICATE") {
        registerForm.setError("email", { type: "manual", message: msg });
      } else if (errorCode === "PHONE_DUPLICATE") {
        registerForm.setError("phoneNumber", { type: "manual", message: msg });
      } else {
        setError(msg);
      }
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
        (resp as any)?.message || t("auth-modal-success-forgot")
      );
    } catch (err: any) {
      setLoading(false);
      const msg =
        err?.response?.data?.message || t("auth-modal-error-forgot-generic");
      setError(msg);
    }
  };

  const content = (
    <>
      {/* Header */}
        <S.ModalHeader>
          <S.Title>
            {mode === "login" && t("auth-modal-title-login")}
            {mode === "register" && t("auth-modal-title-register")}
            {mode === "forgot" && t("auth-modal-title-forgot")}
          </S.Title>
          <S.CloseButton onClick={onClose} aria-label={t("auth-modal-close")}>
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
              {t("auth-modal-tab-login")}
            </S.TabButton>
            <S.TabButton
              active={mode === "register"}
              onClick={() => handleTabSwitch("register")}
              type="button"
            >
              {t("auth-modal-tab-register")}
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
              onClick={() => signIn("google", { callbackUrl: getOAuthCallbackUrl() })}
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
              <GoogleIcon size={16} /> {t("auth-modal-google")}
            </button>
            {/* ⚠️ დროებით გამორთულია Facebook-ით შესვლა (Facebook App ჯერ Development/Unpublished რეჟიმშია)
            <button
              type="button"
              onClick={() => signIn("facebook", { callbackUrl: getOAuthCallbackUrl() })}
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
              <S.Label>{t("auth-modal-label-email")}</S.Label>
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
              <S.Label>{t("auth-modal-label-password")}</S.Label>
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
                  {showLoginPassword ? t("auth-modal-hide-password") : t("auth-modal-show-password")}
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
                {t("auth-modal-forgot-link")}
              </S.LinkBtn>
            </S.FooterLinks>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? t("auth-modal-login-submitting") : t("auth-modal-login-submit")}
            </S.SubmitButton>
          </S.FormContainer>
        )}

        {/* 2. REGISTER FORM */}
        {mode === "register" && (
          <S.FormContainer onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <S.FormGroup>
                <S.Label>{t("auth-modal-label-first-name")}</S.Label>
                <S.Input
                  type="text"
                  placeholder={t("auth-modal-placeholder-first-name")}
                  $invalid={!!registerForm.formState.errors.firstName}
                  {...registerForm.register("firstName")}
                />
                {registerForm.formState.errors.firstName && (
                  <S.FieldError>{registerForm.formState.errors.firstName.message}</S.FieldError>
                )}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>{t("auth-modal-label-last-name")}</S.Label>
                <S.Input
                  type="text"
                  placeholder={t("auth-modal-placeholder-last-name")}
                  $invalid={!!registerForm.formState.errors.lastName}
                  {...registerForm.register("lastName")}
                />
                {registerForm.formState.errors.lastName && (
                  <S.FieldError>{registerForm.formState.errors.lastName.message}</S.FieldError>
                )}
              </S.FormGroup>
            </div>

            <S.FormGroup>
              <S.Label>{t("auth-modal-label-email")}</S.Label>
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
              <S.Label>{t("auth-modal-label-phone")}</S.Label>
              <S.InputWrapper>
                <S.Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="5XX XX XX XX"
                  maxLength={9}
                  $invalid={!!registerForm.formState.errors.phoneNumber}
                  {...registerForm.register("phoneNumber")}
                />
              </S.InputWrapper>
              {registerForm.formState.errors.phoneNumber && (
                <S.FieldError>{registerForm.formState.errors.phoneNumber.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>{t("auth-modal-label-password")}</S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showRegPassword ? "text" : "password"}
                  placeholder={t("auth-modal-placeholder-password-register")}
                  $invalid={!!registerForm.formState.errors.password}
                  {...registerForm.register("password")}
                />
                <S.TogglePasswordBtn
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? t("auth-modal-hide-password") : t("auth-modal-show-password")}
                </S.TogglePasswordBtn>
              </S.InputWrapper>
              {registerForm.formState.errors.password && (
                <S.FieldError>{registerForm.formState.errors.password.message}</S.FieldError>
              )}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>{t("auth-modal-label-confirm-password")}</S.Label>
              <S.Input
                type={showRegPassword ? "text" : "password"}
                placeholder={t("auth-modal-placeholder-confirm-password")}
                $invalid={!!registerForm.formState.errors.confirmPassword}
                {...registerForm.register("confirmPassword")}
              />
              {registerForm.formState.errors.confirmPassword && (
                <S.FieldError>{registerForm.formState.errors.confirmPassword.message}</S.FieldError>
              )}
            </S.FormGroup>

            {regOtpRequestId && (
              <S.FormGroup>
                <S.Label>{t("auth-modal-label-otp")}</S.Label>
                <S.InputWrapper>
                  <S.Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t("auth-modal-otp-placeholder")}
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value)}
                  />
                  <S.TogglePasswordBtn
                    type="button"
                    disabled={loading}
                    onClick={() => regOtpPhone && sendRegisterOtp(regOtpPhone)}
                  >
                    {t("auth-modal-otp-resend")}
                  </S.TogglePasswordBtn>
                </S.InputWrapper>
              </S.FormGroup>
            )}

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? t("auth-modal-register-submitting") : t("auth-modal-register-submit")}
            </S.SubmitButton>
          </S.FormContainer>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <S.FormContainer onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
            <p style={{ fontSize: "13px", color: "var(--ref-text-secondary)", margin: 0 }}>
              {t("auth-modal-forgot-description")}
            </p>

            <S.FormGroup>
              <S.Label>{t("auth-modal-label-email")}</S.Label>
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
              {loading ? t("auth-modal-forgot-submitting") : t("auth-modal-forgot-submit")}
            </S.SubmitButton>

            <S.FooterLinks style={{ justifyContent: "center", marginTop: "8px" }}>
              <S.LinkBtn
                type="button"
                onClick={() => handleTabSwitch("login")}
              >
                {t("auth-modal-back-to-login")}
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
