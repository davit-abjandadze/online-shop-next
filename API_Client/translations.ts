// ხელით დაწერილი დამხმარე ტიპები (არ არის გენერირებული) — ბექენდის Phase 1-ის
// მრავალენოვანი კონტენტის ცვლილების ასახვისთვის. გენერირებული კლიენტი
// (`./client/models`) ჯერ არ ასახავს ამ ცვლილებას (`yarn generate:api` ჯერ არ
// გაშვებულა backend-ის განახლებული swagger.json-ის წინააღმდეგ), ამიტომ ეს
// ტიპები აქ ვინახავთ და `API_Client/types.ts`-ში ვიყენებთ, სანამ რეალურად არ
// მოხდება რეგენერაცია. `yarn generate:api`-ის შემდეგ ეს ფაილი შესაძლოა აღარ
// იყოს საჭირო (გენერირებული client-ის ტიპებით ჩანაცვლდეს).

export interface NameTranslationDto {
  name: string;
}

export interface NameTranslationsDto {
  ka: NameTranslationDto;
  en?: NameTranslationDto;
  ru?: NameTranslationDto;
}

export interface ValueTranslationDto {
  value: string;
}

export interface ValueTranslationsDto {
  ka: ValueTranslationDto;
  en?: ValueTranslationDto;
  ru?: ValueTranslationDto;
}

export interface NameDescriptionTranslationDto {
  name: string;
  description?: string;
}

export interface ProductTranslationsDto {
  ka: NameDescriptionTranslationDto;
  en?: NameDescriptionTranslationDto;
  ru?: NameDescriptionTranslationDto;
}
