import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, KeyIcon, WarningIcon } from "@/components/ui/RefIcons";
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/components/shared/validation/schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid var(--ref-border-soft)",
  borderRadius: "8px",
  background: "var(--ref-bg-elevated)",
  color: "var(--ref-text-primary)",
  outline: "none",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const headTags = (
    <Head>
      <title>პაროლის აღდგენა - საზოგადოებრივი აზრის პლატფორმა</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: loading },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        toast.error(resData.message || "შეცდომა მოხდა");
        return;
      }

      setSuccess(true);
      toast.success(resData.message);

      // 3 წამის შემდეგ ლოგინის გვერდზე გადასვლა
      setTimeout(() => {
        router.push("/ka/login");
      }, 3000);
    } catch (error) {
      toast.error("სერვერთან დაკავშირება ვერ მოხერხდა");
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ref-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {headTags}
        <div style={{ maxWidth: "400px", textAlign: "center", background: "var(--ref-bg-elevated)", borderRadius: "16px", padding: "40px 32px", boxShadow: "var(--ref-shadow-md)", border: "1px solid var(--ref-border-soft)" }}>
          <WarningIcon size={40} />
          <h2 style={{ color: "var(--ref-danger)", margin: "16px 0 8px 0", fontSize: "20px" }}>არასწორი ბმული</h2>
          <p style={{ color: "var(--ref-text-secondary)", fontSize: "14px" }}>გთხოვთ, ხელახლა სცადოთ პაროლის აღდგენა.</p>
          <a href="/ka/forgot-password" style={{ color: "var(--ref-primary)", fontWeight: 600, fontSize: "14px" }}>
            პაროლის აღდგენა
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ref-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {headTags}
      <div style={{ maxWidth: "420px", width: "100%", background: "var(--ref-bg-elevated)", borderRadius: "16px", padding: "40px 32px", boxShadow: "var(--ref-shadow-md)", border: "1px solid var(--ref-border-soft)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "28px", fontSize: "22px", color: "var(--ref-text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <KeyIcon size={24} /> ახალი პაროლის დაყენება
        </h1>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "var(--ref-text-primary)" }}>
                ახალი პაროლი:
              </label>
              <input
                type="password"
                style={{
                  ...inputStyle,
                  borderColor: errors.newPassword ? "var(--ref-danger)" : "var(--ref-border-soft)",
                }}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p style={{ color: "var(--ref-danger)", fontSize: "12px", marginTop: "6px" }}>
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "var(--ref-text-primary)" }}>
                დაადასტურეთ ახალი პაროლი:
              </label>
              <input
                type="password"
                style={{
                  ...inputStyle,
                  borderColor: errors.confirmPassword ? "var(--ref-danger)" : "var(--ref-border-soft)",
                }}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p style={{ color: "var(--ref-danger)", fontSize: "12px", marginTop: "6px" }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: loading ? "var(--ref-text-secondary)" : "var(--ref-primary)",
                color: "var(--ref-text-on-primary)",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {loading ? "ინახება..." : "პაროლის შეცვლა"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircleIcon size={40} />
            <h2 style={{ color: "var(--ref-success)", margin: "16px 0 8px 0", fontSize: "18px" }}>
              პაროლი წარმატებით შეიცვალა!
            </h2>
            <p style={{ color: "var(--ref-text-secondary)", fontSize: "14px" }}>
              3 წამში გადახვალთ ლოგინის გვერდზე...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
