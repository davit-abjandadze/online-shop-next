import type { NextApiRequest, NextApiResponse } from "next";
import { AuthAPI } from "@/API_Client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { firstName, lastName, email, password, gender, age } = req.body;

  if (!firstName || !lastName || !email || !password || !age) {
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

  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 14 || parsedAge > 120) {
    return res.status(400).json({ message: "Invalid age" });
  }

  try {
    const authApi = AuthAPI("en", "");
    const payload = {
      firstName,
      lastName,
      email,
      password,
      gender,
      age: parsedAge,
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
