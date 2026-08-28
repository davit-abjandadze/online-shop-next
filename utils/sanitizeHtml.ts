// მარტივი whitelist-სანიტაიზერი RichTextEditor-ის გამოსატანად (bold/italic/
// underline, ტექსტის ფერი და ზომა, სათაური, სიები, ბმული). დაუშვებელი
// ტეგები/ატრიბუტები (მათ შორის event handler-ები, <script>, javascript:
// ბმულები და ა.შ.) იშლება, მაგრამ მათი ტექსტური შიგთავსი რჩება. გამოიყენება
// ორივეს — ფორმიდან შენახვამდე და საჯარო გვერდზე dangerouslySetInnerHTML-ით
// გამოტანამდე.
const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "SPAN",
  "BR",
  "P",
  "DIV",
  "H3",
  "UL",
  "OL",
  "LI",
  "A",
]);

const SAFE_FONT_SIZE = /^\d{1,3}(\.\d+)?px$/;

const sanitizeChildren = (nodes: ChildNode[], doc: Document): ChildNode[] =>
  nodes.flatMap((node) => sanitizeNode(node, doc));

const sanitizeNode = (node: ChildNode, doc: Document): ChildNode[] => {
  if (node.nodeType === Node.TEXT_NODE) return [node.cloneNode() as ChildNode];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as HTMLElement;
  const children = sanitizeChildren(Array.from(el.childNodes), doc);

  // დაუშვებელი ტეგი — თავად ტეგს ვშლით, შიგთავსს ვტოვებთ (მაგ. <script>-ის
  // ტექსტური კონტენტი ცალკე დანიშნულებით არ შესრულდება, უბრალო ტექსტად დარჩება).
  if (!ALLOWED_TAGS.has(el.tagName)) return children;

  // ბმული — მხოლოდ http(s) href-ს ვუშვებთ, target/rel ყოველთვის ჩვენი,
  // მომხმარებლისეული (paste) მნიშვნელობები კი უგულებელყოფილია.
  if (el.tagName === "A") {
    const href = el.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href)) return children;
    const anchor = doc.createElement("a");
    anchor.setAttribute("href", href);
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
    children.forEach((child) => anchor.appendChild(child));
    return [anchor];
  }

  const clean = doc.createElement(el.tagName.toLowerCase());
  if (el.tagName === "SPAN") {
    // el.style.color/fontSize ბრაუზერის CSSOM-ის მიერაა დაპარსული — არასწორი
    // მნიშვნელობა (მაგ. url(), expression()) აქ უკვე ცარიელია, ინექცია არშესაძლებელია.
    if (el.style.color) clean.style.color = el.style.color;
    if (el.style.fontSize && SAFE_FONT_SIZE.test(el.style.fontSize)) {
      clean.style.fontSize = el.style.fontSize;
    }
  }
  children.forEach((child) => clean.appendChild(child));
  return [clean];
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return "";
  // SSR-ზე DOMParser ხელმისაწვდომი არაა — plain ტექსტად ვტოვებთ escape-ით.
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";
  const container = doc.createElement("div");
  sanitizeChildren(Array.from(root.childNodes), doc).forEach((node) => container.appendChild(node));
  return container.innerHTML;
};

export default sanitizeHtml;
