import React, { useEffect, useRef } from "react";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import * as S from "./style";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COLORS = ["#111827", "#dc2626", "#2563eb", "#16a34a", "#d97706", "#7c3aed"];
const FONT_SIZES: Record<string, string> = { small: "11px", normal: "13px", large: "20px" };

/**
 * Rich-text ველი "დამატებითი ინფორმაციის" აღწერილობისთვის — Bold/Italic/
 * Underline, ტექსტის ფერი და ზომა, სათაური, სიები, ბმული. document.execCommand
 * ამ ფორმატირებებისთვის ჯერ კიდევ საკმარისად მხარდაჭერილია ბრაუზერებში,
 * ამიტომ მძიმე დამოკიდებულების (react-quill და ა.შ.) გარეშე ვართ. შენახვამდე
 * და გამოტანამდე ორივეგან sanitizeHtml წმენდს დაუშვებელ ტეგებს/ატრიბუტებს.
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>(value);
  const savedRangeRef = useRef<Range | null>(null);

  // DOM-ს მხოლოდ მაშინ ვახლებთ, როცა value გარედან შეიცვალა (მაგ. სხვა
  // ბლოკის რედაქტირებაზე გადართვისას) — თორემ ყოველ keystroke-ზე cursor
  // საწყის პოზიციაში გადახტება.
  useEffect(() => {
    if (value !== lastValueRef.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    // ახალი ხაზი Enter-ზე <p>-ად ჩაიწეროს <div>-ის ნაცვლად — formatBlock('P')
    // მერე კონსისტენტურად მუშაობს.
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      // ძველ ბრაუზერებში ბრძანება არ არსებობს — უბრალოდ ვტოვებთ დეფოლტზე
    }
  }, []);

  // ედიტორში ბოლო selection/cursor-ს მუდმივად ვინახავთ — dropdown-ის
  // გახსნა ან window.prompt() ფოკუსს ედიტორიდან ართმევს და ამოწმებული
  // ტექსტიც იკარგება, ამიტომ ბრძანების გაშვებამდე ხელახლა ვაბრუნებთ.
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || "";
    lastValueRef.current = html;
    onChange(html);
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const exec = (command: string, arg?: string) => {
    restoreSelection();
    document.execCommand(command, false, arg);
    emitChange();
  };

  // fontSize-ს ჩვეულებრივ execCommand მოძველებულ <font size="N">-ს აგებინებს —
  // ამის ნაცვლად size="7"-ს მარკერად ვიყენებთ და მაშინვე ვცვლით
  // <span style="font-size: ...">-ად, რომ sanitizeHtml-მაც სწორად ამოიცნოს.
  const applyFontSize = (px: string) => {
    restoreSelection();
    document.execCommand("fontSize", false, "7");
    editorRef.current?.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = px;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    emitChange();
  };

  const applyBlock = (tag: string) => {
    restoreSelection();
    document.execCommand("formatBlock", false, tag);
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt("ბმულის URL:", "https://");
    if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    restoreSelection();
    document.execCommand("createLink", false, href);
    // ახლად შექმნილ ბმულებს target/rel-ს ვურთავთ, security-ის გამო.
    editorRef.current?.querySelectorAll("a:not([target])").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    emitChange();
  };

  return (
    <S.RichTextWrap>
      <S.RichTextToolbar>
        <S.RichTextSelect
          defaultValue=""
          onChange={(e) => {
            const val = e.target.value;
            if (val === "h3") applyBlock("H3");
            else if (val === "p") applyBlock("P");
            else if (val === "small") applyFontSize(FONT_SIZES.small);
            else if (val === "large") applyFontSize(FONT_SIZES.large);
          }}
        >
          <option value="" disabled>
            ტექსტის ტიპი
          </option>
          <option value="p">ჩვეულებრივი</option>
          <option value="h3">სათაური</option>
          <option value="small">პატარა ტექსტი</option>
          <option value="large">დიდი ტექსტი</option>
        </S.RichTextSelect>

        <S.RichTextButton
          type="button"
          bold
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          aria-label="სქელი ტექსტი"
          title="სქელი ტექსტი"
        >
          B
        </S.RichTextButton>
        <S.RichTextButton
          type="button"
          italic
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          aria-label="დახრილი ტექსტი"
          title="დახრილი ტექსტი"
        >
          I
        </S.RichTextButton>
        <S.RichTextButton
          type="button"
          underline
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
          aria-label="ხაზგასმული ტექსტი"
          title="ხაზგასმული ტექსტი"
        >
          U
        </S.RichTextButton>
        <S.RichTextButton
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          aria-label="მარკირებული სია"
          title="მარკირებული სია"
        >
          •≡
        </S.RichTextButton>
        <S.RichTextButton
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          aria-label="დანომრილი სია"
          title="დანომრილი სია"
        >
          1≡
        </S.RichTextButton>
        <S.RichTextButton
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          aria-label="ბმულის ჩასმა"
          title="ბმულის ჩასმა"
        >
          🔗
        </S.RichTextButton>

        {COLORS.map((color) => (
          <S.ColorSwatch
            key={color}
            type="button"
            style={{ backgroundColor: color }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("foreColor", color)}
            aria-label={`ტექსტის ფერი ${color}`}
            title="ტექსტის ფერი"
          />
        ))}
      </S.RichTextToolbar>
      <S.RichTextEditable
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={() => {
          // ბლურზე დამატებით ვასუფთავებთ, თუ ჩასმისას (paste) მაინც მოხვდა
          // დაუშვებელი ტეგი/ატრიბუტი.
          if (!editorRef.current) return;
          const clean = sanitizeHtml(editorRef.current.innerHTML);
          if (clean !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = clean;
          }
          lastValueRef.current = clean;
          onChange(clean);
        }}
        onPaste={(e) => {
          // გარედან ჩასმა — მხოლოდ plain ტექსტად, გარე ფორმატირების გარეშე.
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
      />
    </S.RichTextWrap>
  );
};

export default RichTextEditor;
