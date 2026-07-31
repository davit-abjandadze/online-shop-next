import React, { useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import Header from "@/components/shared/Header";
import styled from "styled-components";
import { AuthAPI } from "@/API_Client";
import useTranslation from "next-translate/useTranslation";
import { CheckCircleIcon, KeyIcon, WarningIcon } from "@/components/ui/RefIcons";

const Container = styled.div`
  min-height: 100vh;
  background-color: var(--ref-bg);
`;

const Content = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 0 16px;
`;

const Card = styled.div`
  background: var(--ref-bg-elevated);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--ref-shadow-md);
  border: 1px solid var(--ref-border-soft);
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--ref-text-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--ref-text-secondary);
  margin: 0 0 24px 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--ref-text-primary);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--ref-border-soft);
  border-radius: 10px;
  font-size: 14px;
  color: var(--ref-text-primary);
  outline: none;
  transition: all 0.2s ease;
  background: var(--ref-bg-elevated);

  &:focus {
    border-color: var(--ref-primary);
    box-shadow: 0 0 0 4px var(--ref-primary-soft);
  }
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--ref-text-secondary);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    color: var(--ref-text-primary);
    background: var(--ref-bg-subtle);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--ref-primary) 0%, var(--ref-primary-hover) 100%);
  color: var(--ref-text-on-primary);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    filter: brightness(1.05);
    box-shadow: var(--ref-shadow-md);
  }

  &:disabled {
    background: var(--ref-text-secondary);
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ success?: boolean }>`
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ success }) => (success ? "var(--ref-success-soft)" : "var(--ref-danger-soft)")};
  border: 1px solid ${({ success }) => (success ? "var(--ref-success)" : "var(--ref-danger)")};
  color: ${({ success }) => (success ? "var(--ref-success)" : "var(--ref-danger)")};
`;

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { lang } = useTranslation("common");
  const session = useSession();

  const changePassowrd = async () => {
    const resp = await (
      await AuthAPI(
        lang,
        session.data?.accessToken ?? ""
      ).authControllerChangePassword({
        oldPassword,
        newPassword,
      })
    ).data;

    return resp;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("გთხოვთ შეავსოთ ყველა ველი");
      return;
    }

    if (newPassword.length < 6) {
      setError("ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("ახალი პაროლები არ ემთხვევა ერთმანეთს");
      return;
    }

    setLoading(true);

    try {
      // // API call to change password
      // await axios.post(
      //   "/api/auth/change-password",
      //   { oldPassword, newPassword },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${(session as any)?.accessToken}`,
      //     },
      //   }
      // );
      changePassowrd();

      setLoading(false);
      setSuccess("პაროლი წარმატებით შეიცვალა");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setLoading(false);
      const msg = err?.response?.data?.message || "პაროლის შეცვლა ვერ მოხერხდა";
      setError(msg);
    }
  };

  return (
    <Container>
      <Head>
        <title>პაროლის შეცვლა</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <Content>
        <Card>
          <Title><KeyIcon size={22} /> პაროლის შეცვლა</Title>
          <Subtitle>შეიყვანეთ მიმდინარე და ახალი პაროლი</Subtitle>

          {error && <Alert><WarningIcon size={16} /> {error}</Alert>}
          {success && <Alert success><CheckCircleIcon size={16} /> {success}</Alert>}

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>მიმდინარე პაროლი</Label>
              <InputWrapper>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <ToggleBtn
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "დამალვა" : "ჩვენება"}
                </ToggleBtn>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>ახალი პაროლი</Label>
              <InputWrapper>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="მინიმუმ 6 სიმბოლო"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>გაიმეორეთ ახალი პაროლი</Label>
              <InputWrapper>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="გაიმეორეთ ახალი პაროლი"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? "მიმდინარეობს შეცვლა..." : "პაროლის შეცვლა"}
            </SubmitButton>
          </form>
        </Card>
      </Content>
    </Container>
  );
}
