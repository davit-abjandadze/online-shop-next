import type { NextApiRequest, NextApiResponse } from "next";
import { AuthAPI } from "@/API_Client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "გთხოვთ მიუთითოთ ვალიდური ელფოსტა" });
  }

  try {
    // აქ შეგვიძლია გამოვიძახოთ ბექენდის პაროლის აღდგენის API
    // ან დავაბრუნოთ წარმატების შეტყობინება
    return res.status(200).json({
      message: "პაროლის აღდგენის ინსტრუქცია წარმატებით გაიგზავნა თქვენს ელფოსტაზე",
    });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || "პაროლის აღდგენა ვერ მოხერხდა";

    return res.status(status).json({ message });
  }
}
