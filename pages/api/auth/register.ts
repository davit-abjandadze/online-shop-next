import type { NextApiRequest, NextApiResponse } from "next";
import { AuthAPI } from "@/API_Client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { firstName, lastName, email, password, phoneNumber, otpRequestId, otpCode } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // დეტალურ სირთულეს (დიდი/პატარა ასო, ციფრი) ბექენდის @IsStrongPassword ამოწმებს
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  // კლიენტის IP ბექენდის throttler-ისთვის (5/წთ IP-ზე) — სხვაგვარად ყველა
  // რეგისტრაცია Next სერვერის ერთი IP-დან ჩანდა. CDN/proxy-ის (Amplify/CloudFront)
  // დაწერილ X-Forwarded-For-ს უცვლელად ვაწვდით — login-ის (authorize) იგივე
  // წესით, რომ ბექენდის TRUST_PROXY=1 ორივეგან ერთსა და იმავე ჩანაწერს იღებდეს.
  const priorForwardedFor = req.headers["x-forwarded-for"] ?? req.headers["x-real-ip"];
  const forwardedFor = Array.isArray(priorForwardedFor) ? priorForwardedFor.join(", ") : priorForwardedFor;

  try {
    const authApi = AuthAPI("en", "");
    const payload = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      // SMS-ვერიფიკაციის (PHONE_VERIFICATION_ENABLED) დროს ბექენდი ამას ითხოვს —
      // ადრე payload ხელახლა იწყობოდა ამ ველების გარეშე და რეგისტრაცია ყოველთვის ეცემოდა.
      ...(typeof otpRequestId === "string" && typeof otpCode === "string" ? { otpRequestId, otpCode } : {}),
    };
    await authApi.authControllerRegister(payload, {
      headers: forwardedFor ? { "X-Forwarded-For": forwardedFor } : {},
    });

    return res.status(201).json({ message: "Registration successful" });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "Registration failed";

    return res.status(status).json({ message });
  }
}
