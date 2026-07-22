export default function enumToObject(enumerator: any) {
  let result: any = {};

  for (const key in enumerator) {
    const value = enumerator[key];

    if (typeof value !== "string") {
      result[key] = value;
    }
  }

  return result;
}
