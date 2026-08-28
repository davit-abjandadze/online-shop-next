// ბრაუზერში არჩეულ სურათს base64-ად კითხულობს და საკუთარ /api/upload-image
// route-ს უგზავნის, რომელიც ImgBB-ზე ატვირთავს (API key სერვერის მხარეს რჩება).
// წარმატების შემთხვევაში ImgBB-ის საჯარო URL-ს აბრუნებს.
export const uploadImageToImgbb = async (file: File): Promise<string> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:image/png;base64,...." -> მხოლოდ base64 ნაწილი გვჭირდება
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(new Error("ფაილის წაკითხვა ვერ მოხერხდა"));
    reader.readAsDataURL(file);
  });

  const res = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "სურათის ატვირთვა ვერ მოხერხდა");
  }

  return data.url as string;
};
