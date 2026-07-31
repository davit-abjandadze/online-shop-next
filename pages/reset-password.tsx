import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CheckCircleIcon, KeyIcon, WarningIcon } from "@/components/ui/RefIcons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("პაროლები არ ემთხვევა ერთმანეთს");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "შეცდომა მოხდა");
        return;
      }

      setSuccess(true);
      toast.success(data.message);

      // 3 წამის შემდეგ ლოგინის გვერდზე გადასვლა
      setTimeout(() => {
        router.push("/ka/login");
      }, 3000);
    } catch (error) {
      toast.error("სერვერთან დაკავშირება ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ref-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
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
      <div style={{ maxWidth: "420px", width: "100%", background: "var(--ref-bg-elevated)", borderRadius: "16px", padding: "40px 32px", boxShadow: "var(--ref-shadow-md)", border: "1px solid var(--ref-border-soft)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "28px", fontSize: "22px", color: "var(--ref-text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <KeyIcon size={24} /> ახალი პაროლის დაყენება
        </h1>

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "var(--ref-text-primary)" }}>
                ახალი პაროლი:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--ref-border-soft)",
                  borderRadius: "8px",
                  background: "var(--ref-bg-elevated)",
                  color: "var(--ref-text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "var(--ref-text-primary)" }}>
                დაადასტურეთ ახალი პაროლი:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--ref-border-soft)",
                  borderRadius: "8px",
                  background: "var(--ref-bg-elevated)",
                  color: "var(--ref-text-primary)",
                  outline: "none",
                }}
              />
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
