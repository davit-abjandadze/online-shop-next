import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

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
      <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444" }}>არასწორი ბმული</h2>
        <p>გთხოვთ, ხელახლა სცადოთ პაროლის აღდგენა.</p>
        <a href="/ka/forgot-password" style={{ color: "#0070f3" }}>
          პაროლის აღდგენა
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        ახალი პაროლის დაყენება
      </h1>

      {!success ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
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
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
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
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "ინახება..." : "პაროლის შეცვლა"}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <h2 style={{ color: "#10b981", marginBottom: "20px" }}>
            ✅ პაროლი წარმატებით შეიცვალა!
          </h2>
          <p style={{ color: "#666" }}>
            3 წამში გადახვალთ ლოგინის გვერდზე...
          </p>
        </div>
      )}
    </div>
  );
}