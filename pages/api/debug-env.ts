import type { NextApiRequest, NextApiResponse } from "next";

// დროებითი დიაგნოსტიკური endpoint — Amplify-ის SSR runtime-ს რეალურად რა env
// vars მიუწვდება თუ არა ხელი ვამოწმებთ. წაშლილი უნდა იყოს გამოყენების შემდეგ.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    ENVIRONMENT: process.env.ENVIRONMENT || null,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || null,
    hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    NODE_ENV: process.env.NODE_ENV || null,
  });
}
