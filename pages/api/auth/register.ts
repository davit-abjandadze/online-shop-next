import type { NextApiRequest, NextApiResponse } from "next";
import { AuthAPI } from "@/API_Client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { firstName, lastName, email, password, phoneNumber } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const authApi = AuthAPI("en", "");
    const payload = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
    };
    await authApi.authControllerRegister(payload);

    return res.status(201).json({ message: "Registration successful" });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "Registration failed";

    return res.status(status).json({ message });
  }
}
