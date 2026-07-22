export default function formatPhoneNumber(
  input: string | number,
  hideLastDigits?: boolean
) {
  let cleaned = ("" + input).replace(/\D/g, "");

  let match = cleaned.match(/^(\d{3,4})(\d{2})(\d{2})(\d{2})$/);

  if (match) {
    return (
      match[1] +
      " " +
      match[2] +
      " " +
      match[3] +
      " " +
      (hideLastDigits ? "**" : match[4])
    );
  }

  return "";
}
