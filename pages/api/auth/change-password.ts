import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "ყველა ველი სავალდებულოა" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" });
  }

  try {
    // აქ ხდება პაროლის შეცვლის ლოგიკა ბექენდთან
    return res.status(200).json({ message: "პაროლი წარმატებით შეიცვალა" });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message || "პაროლის შეცვლა ვერ მოხერხდა";

    return res.status(status).json({ message });
  }
}
