import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// ImgBB-ს base64 upload ლიმიტი 32MB-ია — request body-ს ცოტა მარჟით ვზღუდავთ.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

// სურათს ImgBB-ზე ატვირთავს და თავისუფალ URL-ს აბრუნებს. API key სერვერის
// მხარეს რჩება (IMGBB_API_KEY, არა NEXT_PUBLIC_*) — კლიენტს არასდროს ეგზავნება.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "IMGBB_API_KEY არ არის კონფიგურირებული" });
  }

  const { image } = req.body || {};
  if (typeof image !== "string" || !image) {
    return res.status(400).json({ message: "სურათი აუცილებელია" });
  }

  try {
    const params = new URLSearchParams();
    params.append("key", apiKey);
    params.append("image", image);

    const response = await axios.post("https://api.imgbb.com/1/upload", params, {
      timeout: 30000,
    });

    const url = response.data?.data?.url;
    if (!url) {
      return res.status(502).json({ message: "ImgBB-მ სურათის URL ვერ დააბრუნა" });
    }

    return res.status(200).json({ url });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.error?.message || "სურათის ატვირთვა ვერ მოხერხდა";
    return res.status(status).json({ message });
  }
}
