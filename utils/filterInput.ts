import { KeyboardEvent, FormEvent } from "react";

export default function filterInput(e: KeyboardEvent) {
  const inputElement = e.target as HTMLInputElement;
  const dataPattern = inputElement.getAttribute("data-pattern");

  // If input has data-pattern, block paste operations
  if (dataPattern && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
    e.preventDefault();
    return;
  }

  // Block Alt/Option key combinations entirely (prevents special characters on both macOS and Windows)
  if (dataPattern && e.altKey) {
    e.preventDefault();
    return;
  }

  const [regexpString, flags] = (dataPattern || ".*")
    .replace(/\/(.*)\/(.*)/, "$1____$2")
    .split("____");

  const template = new RegExp(regexpString, flags);

  // Allow control keys (but not shift combinations for character input)
  const isControlKey = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    "Escape",
    "Tab",
    "Enter",
    "Backspace",
    "Space",
  ].includes(e.key);

  // Allow meta/ctrl combinations (like Ctrl+C, Cmd+A) but not shift or paste
  const isMetaCombo =
    (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() !== "v";

  if (
    (e.key === "." && /(\..*){1,}/.test(inputElement.value)) ||
    (!isControlKey && !isMetaCombo && !template.test(e.key))
  ) {
    e.preventDefault();
  }
}

// Additional function to handle input events and filter out invalid characters
export function filterInputValue(e: FormEvent<HTMLInputElement>) {
  const inputElement = e.target as HTMLInputElement;
  const dataPattern = inputElement.getAttribute("data-pattern");
  
  if (!dataPattern) return;

  const [regexpString, flags] = dataPattern
    .replace(/\/(.*)\/(.*)/, "$1____$2")
    .split("____");

  const template = new RegExp(`^[${regexpString}]*$`, flags);
  
  // If the current value doesn't match the pattern, remove invalid characters
  if (!template.test(inputElement.value)) {
    const validChars = inputElement.value.split('').filter(char => 
      new RegExp(regexpString, flags).test(char)
    );
    inputElement.value = validChars.join('');
  }
}
