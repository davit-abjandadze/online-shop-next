import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import * as S from "./style";
import { AuthAPI } from "@/API_Client";
import { RegisterDtoGenderEnum } from "@/API_Client/client";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from 'next/navigation';

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
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regGender, setRegGender] = useState<RegisterDtoGenderEnum | "">(RegisterDtoGenderEnum.Male);

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState("");

  // States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { lang } = useTranslation("common");
  const session = useSession();

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccess(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleTabSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginEmail || !loginPassword) {
      setError("გთხოვთ შეავსოთ ელფოსტა და პაროლი");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
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
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      setError("გთხოვთ შეავსოთ ყველა სავალდებულო ველი");
      return;
    }

    if (regPassword.length < 6) {
      setError("პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("პაროლები არ ემთხვევა ერთმანეთს");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        gender: regGender || undefined,
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("რეგისტრაცია წარმატებით დასრულდა! მიმდინარეობს შესვლა...");
        
        // Auto-login after registration
        const loginRes = await signIn("credentials", {
          email: regEmail,
          password: regPassword,
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
          setLoginEmail(regEmail);
        }
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err?.response?.data?.message || "რეგისტრაციისას დაფიქსირდა შეცდომა";
      setError(msg);
    }
  };

  // 3. FORGOT PASSWORD HANDLER
  // const handleForgotSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);
  //   setSuccess(null);

  //   if (!forgotEmail || !forgotEmail.includes("@")) {
  //     setError("გთხოვთ მიუთითოთ ვალიდური ელფოსტა");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await axios.post("/api/auth/forgot-password", {
  //       email: forgotEmail,
  //     });

  //     setLoading(false);
  //     setSuccess(
  //       response.data.message ||
  //         "პაროლის აღდგენის ინსტრუქცია გაიგზავნა თქვენს ელფოსტაზე"
  //     );
  //   } catch (err: any) {
  //     setLoading(false);
  //     const msg =
  //       err?.response?.data?.message || "შეცდომა პაროლის აღდგენისას";
  //     setError(msg);
  //   }
  // };

   const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setError("გთხოვთ მიუთითოთ ვალიდური ელფოსტა");
      return;
    }

    setLoading(true);

      const resp = await (
        await AuthAPI(
          lang,
          session.data?.accessToken ?? ""
        ).authControllerForgotPassword({
        email: forgotEmail,
        })
      ).data;

      
    try {
    

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
  
      // return resp;
    };

  return (
    <S.Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <S.ModalHeader>
          <S.Title>
            {mode === "login" && "ავტორიზაცია"}
            {mode === "register" && "რეგისტრაცია"}
            {mode === "forgot" && "პაროლის აღდგენა"}
          </S.Title>
          <S.CloseButton onClick={onClose} aria-label="Close">
            ✕
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
        <div style={{ padding: "0 28px", marginTop: "16px" }}>
          {error && <S.ErrorAlert>⚠️ {error}</S.ErrorAlert>}
          {success && <S.SuccessAlert>✓ {success}</S.SuccessAlert>}
        </div>

        {/* 1. LOGIN FORM */}
        {mode === "login" && (
          <S.FormContainer onSubmit={handleLoginSubmit}>

            <button
  type="button"
  onClick={() => signIn("google", { callbackUrl: "/" })}
  style={{
    width: "100%",
    padding: "10px",
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  }}
>
  {/* აქ შეგიძლია Google-ის SVG იკონკა ჩასვა */}
  <span>🔵</span> Google-ით შესვლა
</button>
<button
  type="button"
  onClick={() => signIn("facebook", { callbackUrl: "/" })}
  style={{
    width: "100%",
    padding: "10px",
    backgroundColor: "#1877F2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  }}
>
  <span>🔵</span> Facebook-ით შესვლა
</button>

            <S.FormGroup>
              <S.Label>ელფოსტა</S.Label>
              <S.InputWrapper>
                <S.Input
                  type="email"
                  placeholder="example@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </S.InputWrapper>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>პაროლი</S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <S.TogglePasswordBtn
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? "დამალვა" : "ჩვენება"}
                </S.TogglePasswordBtn>
              </S.InputWrapper>
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
          <S.FormContainer onSubmit={handleRegisterSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input
                  type="text"
                  placeholder="გიორგი"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                />
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input
                  type="text"
                  placeholder="ბერიძე"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                />
              </S.FormGroup>
            </div>

            <S.FormGroup>
              <S.Label>ელფოსტა</S.Label>
              <S.Input
                type="email"
                placeholder="example@domain.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>სქესი</S.Label>
              <S.GenderSwitch>
                <S.GenderOption
                  type="button"
                  active={regGender === RegisterDtoGenderEnum.Male}
                  onClick={() => setRegGender(RegisterDtoGenderEnum.Male)}
                >
                  კაცი
                </S.GenderOption>
                <S.GenderOption
                  type="button"
                  active={regGender === RegisterDtoGenderEnum.Female}
                  onClick={() => setRegGender(RegisterDtoGenderEnum.Female)}
                >
                  ქალი
                </S.GenderOption>
              </S.GenderSwitch>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>პაროლი</S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="მინიმუმ 6 სიმბოლო"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <S.TogglePasswordBtn
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? "დამალვა" : "ჩვენება"}
                </S.TogglePasswordBtn>
              </S.InputWrapper>
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>გაიმეორეთ პაროლი</S.Label>
              <S.Input
                type={showRegPassword ? "text" : "password"}
                placeholder="გაიმეორეთ პაროლი"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
              />
            </S.FormGroup>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? "მიმდინარეობს რეგისტრაცია..." : "რეგისტრაცია"}
            </S.SubmitButton>
          </S.FormContainer>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <S.FormContainer onSubmit={handleForgotSubmit}>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              შეიყვანეთ ელფოსტა, რომლითაც დარეგისტრირებული ხართ და გამოგიგზავნით პაროლის აღდგენის ინსტრუქციას.
            </p>

            <S.FormGroup>
              <S.Label>ელფოსტა</S.Label>
              <S.Input
                type="email"
                placeholder="example@domain.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </S.FormGroup>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? "გაგზავნა..." : "აღდგენის ინსტრუქციის გაგზავნა"}
            </S.SubmitButton>

            <S.FooterLinks style={{ justifyContent: "center", marginTop: "12px" }}>
              <S.LinkBtn
                type="button"
                onClick={() => handleTabSwitch("login")}
              >
                ← ავტორიზაციაზე დაბრუნება
              </S.LinkBtn>
            </S.FooterLinks>
          </S.FormContainer>
        )}
      </S.ModalContainer>
    </S.Overlay>
  );
};

export default AuthModal;
