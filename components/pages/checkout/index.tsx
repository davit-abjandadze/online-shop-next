import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import type { ZodIssue } from "zod";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
import PurchaseSteps, { PurchaseStep } from "@/components/shared/PurchaseSteps";
import { useCart } from "@/context/Cart";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { AddressesAPI, BranchesAPI, OrdersAPI, OtpAPI, PaymentsAPI, UserAPI } from "@/API_Client";
import { Address, Branch, Order, PaymentInitiateResponse, User } from "@/API_Client/types";
import { CDN_URL } from "@/constants";
import {
  CartIcon,
  LockIcon,
  TruckIcon,
  BoxIcon,
  PinIcon,
  WarningIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
} from "@/components/ui/RefIcons";
import { getDiscountedPrice } from "@/utils/getDiscountedPrice";
import { getCategoryName, getLocalizedDescription } from "@/utils/getCategoryName";
import { emailField, personalNumberField, phoneNumberField } from "@/components/shared/validation/schemas";
import { AddressFormValues, addressFormSchema } from "./schemas";
import * as S from "./style";

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// მისამართის ფორმის "ქალაქი" სელექტისთვის — ყველაზე ხშირად შერჩეული
// ქართული ქალაქები (backend-ზე city უბრალო string ველია, აქ ჩამონათვალის
// გაფართოება ბექენდის ცვლილებას არ საჭიროებს). ჩამონათვალის value ყოველთვის
// ქართულია (ბექენდში ინახება ასე), t()-ით მხოლოდ ჩვენებადი ლეიბლი ითარგმნება.
const GEORGIAN_CITIES = [
  { value: "თბილისი", key: "city-tbilisi" },
  { value: "ბათუმი", key: "city-batumi" },
  { value: "ქუთაისი", key: "city-kutaisi" },
  { value: "რუსთავი", key: "city-rustavi" },
  { value: "გორი", key: "city-gori" },
  { value: "ზუგდიდი", key: "city-zugdidi" },
  { value: "ფოთი", key: "city-poti" },
  { value: "ხაშური", key: "city-khashuri" },
  { value: "სამტრედია", key: "city-samtredia" },
  { value: "სენაკი", key: "city-senaki" },
  { value: "ზესტაფონი", key: "city-zestafoni" },
  { value: "მარნეული", key: "city-marneuli" },
  { value: "თელავი", key: "city-telavi" },
  { value: "ახალციხე", key: "city-akhaltsikhe" },
  { value: "ოზურგეთი", key: "city-ozurgeti" },
  { value: "ქობულეთი", key: "city-kobuleti" },
  { value: "ბორჯომი", key: "city-borjomi" },
  { value: "გურჯაანი", key: "city-gurjaani" },
  { value: "ახალქალაქი", key: "city-akhalkalaki" },
  { value: "წყალტუბო", key: "city-tskaltubo" },
];

// კვირის დღეების key-ები/ლეიბლები ფილიალის workingHours-ის ჩვენებისთვის —
// dashboard/schemas.ts-ის BRANCH_DAY_KEYS-ის იგივე თანმიმდევრობა (mon..sun).
const WEEK_DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type WeekDayKey = (typeof WEEK_DAY_KEYS)[number];
const WEEK_DAY_LABEL_KEYS: Record<WeekDayKey, string> = {
  mon: "weekday-mon",
  tue: "weekday-tue",
  wed: "weekday-wed",
  thu: "weekday-thu",
  fri: "weekday-fri",
  sat: "weekday-sat",
  sun: "weekday-sun",
};
// Date.getDay() 0=კვირა..6=შაბათი — WEEK_DAY_KEYS-ის (ორშაბათიდან იწყება) იგივე ინდექსზე გადასაყვანად.
const jsDayToWeekDayKey = (jsDay: number): WeekDayKey => WEEK_DAY_KEYS[(jsDay + 6) % 7];

const MONTH_GENITIVE_KEYS = [
  "month-genitive-1",
  "month-genitive-2",
  "month-genitive-3",
  "month-genitive-4",
  "month-genitive-5",
  "month-genitive-6",
  "month-genitive-7",
  "month-genitive-8",
  "month-genitive-9",
  "month-genitive-10",
  "month-genitive-11",
  "month-genitive-12",
];

// "ხვალ, 30 აგვისტოს" — ფილიალიდან გატანის მზადყოფნის თარიღი (მარტივი
// მიახლოება, backend-ის რეალური ლოგისტიკის ვადის გარეშე).
const formatPickupReadyDate = (t: (key: string, query?: Record<string, unknown>) => string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return t("pickup-tomorrow", {
    day: tomorrow.getDate(),
    month: t(MONTH_GENITIVE_KEYS[tomorrow.getMonth()]),
  });
};

const emptyAddressForm: AddressFormValues = {
  title: "",
  phoneNumber: "",
  city: "",
  address: "",
  comment: "",
};

// ველში მომხმარებელი 9-ციფრიან ქართულ მობილურის ნომერს (ქვეყნის კოდის გარეშე) შეიყვანს,
// ბექენდისთვის/verify.ge-სთვის კი E.164 ფორმატია საჭირო (მაგ. +995555123456) — profile-ის ანალოგიურად.
const toE164 = (localNumber: string) => `+995${localNumber.replace(/\D/g, "")}`;
const fromE164 = (phone: string) => phone.replace(/^\+995/, "");

// ფილიალის დეტალების ბლოკი (მისამართი/ტელეფონი/ელფოსტა + კვირის სამუშაო
// საათები, მიმდინარე დღის გამუქებით) — ⓘ ღილაკზე დაჭერით იშლება checkout-ის
// ფილიალიდან-გატანის სექციაში (ორივე — არჩეული ბარათი და სიის row-ები).
const BranchDetailPanel: React.FC<{ branch: Branch }> = ({ branch }) => {
  const { t } = useTranslation("checkout");
  const todayKey = jsDayToWeekDayKey(new Date().getDay());
  return (
    <S.BranchDetailPanel>
      <div>{branch.address}</div>
      <div>{branch.phoneNumber}</div>
      {branch.email && <div>{branch.email}</div>}
      {WEEK_DAY_KEYS.map((day) => {
        const hours = branch.workingHours?.[day];
        return (
          <S.WorkingHoursRow key={day} $today={day === todayKey}>
            <S.WorkingHoursDay>{t(WEEK_DAY_LABEL_KEYS[day])}</S.WorkingHoursDay>
            <span>{hours ? `${hours.open} - ${hours.close}` : t("closed")}</span>
          </S.WorkingHoursRow>
        );
      })}
    </S.BranchDetailPanel>
  );
};

// შეკვეთის გაფორმების გვერდი — "შეკვეთის დადასტურება" და "გადახდის დაწყება"
// ერთი მოქმედებაა (backend-ის createFromCart → იმწამსვე payable PENDING
// შეკვეთის დიზაინის მიხედვით), ამიტომ წარმატებული submit პირდაპირ
// PaymentsAPI-ის initiate-ს იძახებს და BOG-ის redirectUrl-ზე გადამისამართებს —
// შუალედური "შეკვეთა შეიქმნა, მაგრამ არაფერი არ გვთხოვს გადახდას" გვერდი არ რჩება.
export const CheckoutComponent: React.FC = () => {
  const { t } = useTranslation("checkout");
  // emailField/phoneNumberField/personalNumberField-ის ვალიდაციის შეტყობინებები
  // common.json-შია (`validation-*`) — "common:" პრეფიქსით ვიღებთ "checkout" namespace-იდან.
  const tValidation = (key: string, query?: Record<string, unknown>) => t(`common:${key}`, query);
  // GEORGIAN_CITIES-ის value ყოველთვის ქართულია (ბექენდის ფორმატი) — ჩვენებისას
  // შესაბამისი key-ით ვთარგმნით, თუ ცნობილი ქალაქია; წინააღმდეგ შემთხვევაში raw value-ს ვაბრუნებთ.
  const getCityLabel = (value?: string): string => {
    if (!value) return "";
    const city = GEORGIAN_CITIES.find((c) => c.value === value);
    return city ? t(city.key) : value;
  };
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, loading, refresh } = useCart();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  // ელფოსტის/მობილურის/პირადი ნომრის ამ გვერდზევე რედაქტირება — profile-ის იგივე
  // OTP-ვერიფიკაციის ნიმუში, მხოლოდ ყიდვისთვის აუცილებელ ველებზე შემოზღუდული.
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [personalNumberInput, setPersonalNumberInput] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  // "ამ ელფოსტით/ტელეფონის ნომრით მომხმარებელი უკვე არსებობს" — ბექენდის
  // დუბლირების შეცდომას შესაბამის ველთან ვაჩვენებთ და ვწითლებთ
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);
  const [phoneDuplicateError, setPhoneDuplicateError] = useState<string | null>(null);

  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState("");
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  // ხელახლა გაგზავნის ღილაკის 1-წუთიანი (60წმ) ქულდაუნი — წამებში დარჩენილი დრო
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  const resetEmailOtpState = () => {
    setOtpSending(false);
    setOtpVerifying(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpRequestId("");
    setOtpCodeInput("");
    setOtpError(null);
    setOtpResendCooldown(0);
  };

  useEffect(() => {
    if (otpSent || otpVerified) resetEmailOtpState();
    setEmailDuplicateError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInput]);

  // ყოველ წამში ვაკლებთ ქულდაუნის მთვლელს, სანამ 0-ს არ მიაღწევს
  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpResendCooldown]);

  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [phoneOtpRequestId, setPhoneOtpRequestId] = useState("");
  const [phoneOtpCodeInput, setPhoneOtpCodeInput] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);
  // ხელახლა გაგზავნის ღილაკის 1-წუთიანი (60წმ) ქულდაუნი — წამებში დარჩენილი დრო
  const [phoneOtpResendCooldown, setPhoneOtpResendCooldown] = useState(0);

  const resetPhoneOtpState = () => {
    setPhoneOtpSending(false);
    setPhoneOtpVerifying(false);
    setPhoneOtpSent(false);
    setPhoneOtpVerified(false);
    setPhoneOtpRequestId("");
    setPhoneOtpCodeInput("");
    setPhoneOtpError(null);
    setPhoneOtpResendCooldown(0);
  };

  useEffect(() => {
    if (phoneOtpSent || phoneOtpVerified) resetPhoneOtpState();
    setPhoneDuplicateError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneInput]);

  // ყოველ წამში ვაკლებთ ქულდაუნის მთვლელს, სანამ 0-ს არ მიაღწევს
  useEffect(() => {
    if (phoneOtpResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setPhoneOtpResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneOtpResendCooldown]);

  const { getOverlayProps } = useOverlayCloseHandlers();

  // შენახული მიწოდების მისამართები — თუ არცერთი არაა დამატებული, პირდაპირ
  // დამატების ფორმა ჩანს; წინააღმდეგ შემთხვევაში არჩეული მისამართის ბარათი +
  // "შეცვალე/დაამატე მისამართი" სია, ახლის დამატება/რედაქტირება კი მოდალშია.
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressList, setShowAddressList] = useState<boolean>(false);
  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressFormValues, setAddressFormValues] = useState<AddressFormValues>(emptyAddressForm);
  const [addressFormErrors, setAddressFormErrors] = useState<Partial<Record<keyof AddressFormValues, string>>>({});
  const [addressSaving, setAddressSaving] = useState<boolean>(false);
  const [addressDeletingId, setAddressDeletingId] = useState<number | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  // "ფილიალიდან გატანა" — courier-ის ალტერნატივა. deliveryMethod===pickup-ის
  // შემთხვევაში მისამართის სექცია ფილიალის შერჩევის UI-ით იცვლება.
  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "pickup">("courier");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [showBranchList, setShowBranchList] = useState<boolean>(false);
  const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);

  // გადახდის მეთოდი — ამჟამად მხოლოდ BOG-ია ხელმისაწვდომი, მაგრამ მაინც
  // მომხმარებლის ცალსახა არჩევანს ველოდებით (არ ვირჩევთ ავტომატურად), რომ
  // ყოველ checkout-ზე თავად დაადასტუროს.
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"bog" | null>(null);
  const [paymentMethodError, setPaymentMethodError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!session?.accessToken) return;
    setAddressesLoading(true);
    try {
      const res = await AddressesAPI(router.locale || "ka", session.accessToken).addressesControllerFindAll();
      const list = (res.data as unknown as Address[]) || [];
      setAddresses(list);
      // ⚠️ განზრახ არ ავირჩევთ ავტომატურად default/პირველ მისამართს — მომხმარებელმა
      // ყოველ checkout-ზე თავად უნდა აირჩიოს მიწოდების მისამართი.
      setSelectedAddressId((prev) => (prev && list.some((a) => a.id === prev) ? prev : null));
    } catch {
      // მისამართების ჩატვირთვის ჩავარდნა UI-ს არ უნდა ბლოკავდეს — უბრალოდ ცარიელი დარჩება სია.
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchAddresses();
    // session.accessToken-ზეა დამოკიდებულება, არა მთლიან session obj-ზე — NextAuth-ის
    // periodического refetch-ის დროს (SessionProvider refetchInterval, pages/_app.tsx)
    // session ყოველ ჯერზე ახალ object reference-ს აბრუნებს, თუნდაც accessToken არ
    // შეცვლილიყოს, რაც ამ effect-ს ყოველ 60 წამში ხელახლა უშვებდა
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken]);

  // ფილიალების სია საჯარო endpoint-ია — ავტორიზაცია არ სჭირდება. `/branches/available`
  // მხოლოდ იმ (აქტიურ) ფილიალებს აბრუნებს, სადაც კალათის ყველა პროდუქტი ერთდროულადაა
  // მარაგში — pickup-ის არჩევისას ისეთი ფილიალის შერჩევა, სადაც ნაწილი პროდუქტი
  // საერთოდ არ იყიდება, წინასწარვე გამორიცხულია (checkout-ის stock-შემოწმებას იმეორებს UI-ზე).
  const productIds = (cart?.items || []).map((item) => item.product.id).join(",");

  const fetchBranches = async (ids: string) => {
    setBranchesLoading(true);
    try {
      const res = await BranchesAPI(router.locale || "ka", "").branchesControllerFindAvailable(ids);
      const list = (res.data as unknown as Branch[]) || [];
      setBranches(list);
      // ⚠️ განზრახ არ ავირჩევთ ავტომატურად პირველ ფილიალს — მომხმარებელმა ყოველ
      // checkout-ზე თავად უნდა აირჩიოს ფილიალი.
      setSelectedBranchId((prev) => (prev && list.some((b) => b.id === prev) ? prev : null));
      setShowBranchList((prev) => prev || list.length > 0);
    } catch {
      // ფილიალების ჩატვირთვის ჩავარდნა UI-ს არ უნდა ბლოკავდეს — უბრალოდ ცარიელი დარჩება სია.
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    if (!productIds) return;
    fetchBranches(productIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale, productIds]);

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressFormValues(emptyAddressForm);
    setAddressFormErrors({});
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressFormValues({
      title: addr.title,
      phoneNumber: addr.phoneNumber,
      city: addr.city,
      address: addr.address,
      comment: addr.comment || "",
    });
    setAddressFormErrors({});
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => setAddressModalOpen(false);

  const handleAddressFieldChange = (field: keyof AddressFormValues, value: string) => {
    setAddressFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitAddress = async () => {
    if (!session?.accessToken) return;
    const parsed = addressFormSchema(t).safeParse(addressFormValues);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof AddressFormValues, string>> = {};
      parsed.error.issues.forEach((issue: ZodIssue) => {
        const key = issue.path[0] as keyof AddressFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setAddressFormErrors(fieldErrors);
      return;
    }
    setAddressFormErrors({});
    setAddressSaving(true);
    try {
      const api = AddressesAPI(router.locale || "ka", session.accessToken);
      const payload = {
        title: parsed.data.title,
        phoneNumber: parsed.data.phoneNumber,
        city: parsed.data.city,
        address: parsed.data.address,
        comment: parsed.data.comment || undefined,
      };
      const res = editingAddressId
        ? await api.addressesControllerUpdate(String(editingAddressId), payload)
        : await api.addressesControllerCreate(payload);
      const saved = res.data as unknown as Address;

      const listRes = await api.addressesControllerFindAll();
      const list = (listRes.data as unknown as Address[]) || [];
      setAddresses(list);
      setSelectedAddressId(saved.id);
      setAddressError(null);
      setAddressModalOpen(false);
      toast.success((editingAddressId ? t("toast-address-updated") : t("toast-address-added")) as string);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("toast-address-save-failed"));
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!session?.accessToken) return;
    setAddressDeletingId(id);
    try {
      const api = AddressesAPI(router.locale || "ka", session.accessToken);
      await api.addressesControllerRemove(String(id));
      const listRes = await api.addressesControllerFindAll();
      const list = (listRes.data as unknown as Address[]) || [];
      setAddresses(list);
      setSelectedAddressId((prev) => (prev === id ? null : prev));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("toast-address-delete-failed"));
    } finally {
      setAddressDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.accessToken || !session?.user?.id) return;
      setLoadingUser(true);
      try {
        const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerFindOne(
          session.user.id
        );
        const u = res.data as User;
        const localPhoneNumber = u.phoneNumber ? fromE164(u.phoneNumber) : "";
        setUser(u);
        setEmailInput(u.email || "");
        setSavedEmail(u.email || "");
        setPhoneInput(localPhoneNumber);
        setSavedPhoneNumber(localPhoneNumber);
        setPersonalNumberInput(u.personalNumber || "");
      } catch {
        // პერსონალური ინფორმაციის ჩატვირთვის ჩავარდნა ფორმის შევსებას არ უნდა
        // ბლოკავდეს — უბრალოდ ცარიელი დარჩება ბლოკი.
      } finally {
        setLoadingUser(false);
      }
    };
    if (status === "authenticated") fetchUser();
    // იხ. ზემოთ fetchAddresses-ის useEffect-ის კომენტარი — session obj-ის მაგივრად
    // მისი კონკრეტული ველებია დამოკიდებულებაში, რომ periodic session-refetch-მა
    // ეს ეფექტი ხელახლა არ გაუშვას
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken, session?.user?.id, router.locale]);

  const handleSendEmailOtp = async () => {
    if (otpResendCooldown > 0) return;
    setOtpError(null);
    const parsed = emailField(tValidation).safeParse(emailInput);
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message || t("error-valid-email"));
      return;
    }
    setOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendEmailOtp({ email: parsed.data });
      // backend/verify.ge-ს პასუხს ხანდახან requestId არ ჩართავს (undefined) — ამის
      // შემთხვევაში "გაგზავნილად" არ ჩავთვალოთ, თორემ /otp/verify-ზე ცარიელი
      // requestId წავა და backend-ის validation-ი 400-ს დააბრუნებს
      if (!resp.data.requestId) {
        setOtpError(t("error-otp-send-failed-retry"));
        return;
      }
      setOtpRequestId(resp.data.requestId);
      setOtpSent(true);
      setOtpResendCooldown(60);
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || t("error-otp-send-failed"));
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setOtpError(null);
    if (!otpCodeInput.trim()) {
      setOtpError(t("error-otp-code-required"));
      return;
    }
    if (!otpRequestId) {
      setOtpError(t("error-otp-session-expired"));
      setOtpSent(false);
      return;
    }
    setOtpVerifying(true);
    try {
      await OtpAPI(router.locale || "ka", "").otpControllerVerifyEmailOtp({
        requestId: otpRequestId,
        code: otpCodeInput.trim(),
      });
      setOtpVerified(true);
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || t("error-otp-invalid"));
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (phoneOtpResendCooldown > 0) return;
    setPhoneOtpError(null);
    const parsed = phoneNumberField(tValidation).safeParse(phoneInput);
    if (!parsed.success) {
      setPhoneOtpError(parsed.error.issues[0]?.message || t("error-valid-phone"));
      return;
    }
    setPhoneOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendOtp({
        phoneNumber: toE164(parsed.data),
      });
      // იხ. handleSendEmailOtp-ის კომენტარი — requestId-ის გარეშე "გაგზავნილად" არ ვთვლით
      if (!resp.data.requestId) {
        setPhoneOtpError(t("error-otp-send-failed-retry"));
        return;
      }
      setPhoneOtpRequestId(resp.data.requestId);
      setPhoneOtpSent(true);
      setPhoneOtpResendCooldown(60);
    } catch (err: any) {
      setPhoneOtpError(err?.response?.data?.message || t("error-otp-send-failed"));
    } finally {
      setPhoneOtpSending(false);
    }
  };

  // მხოლოდ მობილურის დადასტურებულ ცვლილებას ინახავს — არ ეხება ფორმის დანარჩენ,
  // ჯერ შეუნახავ ველებს. profile-ის persistVerifiedEmail-ის ანალოგიურად, რომ
  // დადასტურებისთანავე, "მონაცემების შენახვა" ღილაკზე დაჭერის გარეშეც, ავტომატურად
  // შეინახოს ახლადდადასტურებული ნომერი და გაქრეს წითელი ბორდერი/"არადამოწმებული".
  const persistVerifiedPhone = async (requestId: string, code: string, phoneValue: string) => {
    if (!session?.accessToken || !session?.user?.id) return;
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        session.user.id,
        {
          phoneNumber: toE164(phoneValue),
          phoneOtpRequestId: requestId,
          phoneOtpCode: code,
        }
      );
      setUser(res.data as User);
      setSavedPhoneNumber(phoneValue);
      resetPhoneOtpState();
      toast.success(t("toast-phone-verified-saved") as string);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("toast-phone-save-failed"));
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpError(null);
    if (!phoneOtpCodeInput.trim()) {
      setPhoneOtpError(t("error-otp-code-required"));
      return;
    }
    if (!phoneOtpRequestId) {
      setPhoneOtpError(t("error-otp-session-expired"));
      setPhoneOtpSent(false);
      return;
    }
    setPhoneOtpVerifying(true);
    try {
      const requestId = phoneOtpRequestId;
      const code = phoneOtpCodeInput.trim();
      await OtpAPI(router.locale || "ka", "").otpControllerVerifyOtp({
        requestId,
        code,
      });
      setPhoneOtpVerified(true);
      // დადასტურებისთანავე, დამატებითი დაჭერის გარეშე, ინახავს მობილურის ნომერს
      await persistVerifiedPhone(requestId, code, phoneInput.trim());
    } catch (err: any) {
      setPhoneOtpError(err?.response?.data?.message || t("error-otp-invalid"));
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!session?.accessToken || !session?.user?.id) return;

    const newEmail = emailInput.trim();
    const emailChanged = newEmail !== savedEmail;
    const newPhoneNumber = phoneInput.trim();
    const phoneChanged = newPhoneNumber !== savedPhoneNumber;

    const personalNumberParsed = personalNumberField(tValidation).safeParse(personalNumberInput);
    if (!personalNumberParsed.success) {
      toast.error((personalNumberParsed.error.issues[0]?.message || t("error-valid-personal-number")) as string);
      return;
    }
    if (emailChanged && !otpVerified) {
      toast.error(t("error-email-verification-required") as string);
      return;
    }
    if (phoneChanged && !phoneOtpVerified) {
      toast.error(t("error-phone-verification-required") as string);
      return;
    }

    const includeEmailOtpProof = emailChanged || otpVerified;
    const includePhoneOtpProof = phoneChanged || phoneOtpVerified;

    setEmailDuplicateError(null);
    setPhoneDuplicateError(null);
    setSavingInfo(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        session.user.id,
        {
          email: newEmail,
          phoneNumber: newPhoneNumber ? toE164(newPhoneNumber) : undefined,
          personalNumber: personalNumberParsed.data,
          ...(includeEmailOtpProof ? { otpRequestId, otpCode: otpCodeInput.trim() } : {}),
          ...(includePhoneOtpProof ? { phoneOtpRequestId, phoneOtpCode: phoneOtpCodeInput.trim() } : {}),
        }
      );
      const updated = res.data as User;
      setUser(updated);
      setSavedEmail(newEmail);
      setSavedPhoneNumber(newPhoneNumber);
      resetEmailOtpState();
      resetPhoneOtpState();
      toast.success(t("toast-info-saved") as string);
    } catch (err: any) {
      const message = err?.response?.data?.message || t("toast-info-save-failed");
      const errorCode = err?.response?.data?.errorCode;

      // ბექენდი დუბლირებულ ელფოსტას/ნომერზე errorCode-ს აბრუნებს (EMAIL_DUPLICATE /
      // PHONE_DUPLICATE) — ამის მიხედვით ვცნობთ შესაბამის ველს და ვწითლებთ, რომ
      // მომხმარებელმა ზუსტად დაინახოს პრობლემური ველი.
      if (errorCode === "EMAIL_DUPLICATE") {
        setEmailDuplicateError(message);
      } else if (errorCode === "PHONE_DUPLICATE") {
        setPhoneDuplicateError(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSavingInfo(false);
    }
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageBackground>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ color: "var(--ref-text-secondary)" }}>{t("loading")}</p>
          </S.Container>
        </S.PageBackground>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header onOpenAuth={() => setAuthModalOpen(true)} />
        <S.PageBackground>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>{t("auth-required-title")}</S.AccessDeniedTitle>
            <S.AccessDeniedText>{t("auth-required-text")}</S.AccessDeniedText>
            <S.ActionButton type="button" onClick={() => setAuthModalOpen(true)}>
              {t("login-button")}
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageBackground>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
      </>
    );
  }

  const items = cart?.items || [];
  const { subtotal, total, itemsCount } = items.reduce(
    (acc, item) => {
      const { price, originalPrice } = getDiscountedPrice(item.product);
      return {
        subtotal: acc.subtotal + (originalPrice ?? price) * item.quantity,
        total: acc.total + price * item.quantity,
        itemsCount: acc.itemsCount + item.quantity,
      };
    },
    { subtotal: 0, total: 0, itemsCount: 0 }
  );
  const discount = subtotal - total;
  const isEmpty = !loading && items.length === 0;

  // ყიდვისთვის სავალდებულო მონაცემები — profile-ის იგივე წესი: დაუდასტურებელი
  // ელფოსტა/მობილური ან ცარიელი პირადი ნომერი შეკვეთის გაფორმებას ბლოკავს.
  const emailNotVerified = !user?.isEmailVerified;
  const phoneNotVerified = !user?.isPhoneVerified;
  const personalNumberMissing = !personalNumberInput.trim();
  const purchaseBlocked = !loadingUser && (emailNotVerified || phoneNotVerified || personalNumberMissing);

  // OTP დადასტურების UI (ღილაკი/კოდის ველი) გამოჩნდეს არა მხოლოდ მაშინ, როცა
  // მომხმარებელი ცვლის ელფოსტას/ნომერს, არამედ მაშინაც, როცა ამჟამინდელი (შენახული)
  // ღირებულება უბრალოდ დაუდასტურებელია — profile-ის იგივე ლოგიკა.
  const emailNeedsVerificationUi =
    !!emailInput.trim() && (emailInput.trim() !== savedEmail || emailNotVerified);
  const phoneNeedsVerificationUi =
    !!phoneInput.trim() && (phoneInput.trim() !== savedPhoneNumber || phoneNotVerified);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || null;
  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || null;

  // checkout ერთ გვერდზეა (სამივე სექცია ერთდროულად ჩანს), ამიტომ ზედა
  // PurchaseSteps-ის "მიმდინარე"/"გავლილი" საფეხურები ფორმის რეალური
  // ვალიდაციის მდგომარეობიდან გამოითვლება — არა სტატიკურად, გვერდის მიხედვით.
  const personalInfoComplete = !loadingUser && !purchaseBlocked;
  const deliveryComplete = deliveryMethod === "pickup" ? !!selectedBranch : !!selectedAddress;
  const paymentComplete = !!selectedPaymentMethod;
  const currentPurchaseStep = !personalInfoComplete ? "order" : !deliveryComplete ? "address" : "payment";
  const completedPurchaseSteps: PurchaseStep[] = [
    "cart",
    ...(personalInfoComplete ? (["order"] as const) : []),
    ...(deliveryComplete ? (["address"] as const) : []),
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || isEmpty || purchaseBlocked) return;

    if (deliveryMethod === "courier" && !selectedAddress) {
      setAddressError(t("error-select-address"));
      return;
    }
    if (deliveryMethod === "pickup" && !selectedBranch) {
      setBranchError(t("error-select-branch"));
      return;
    }
    if (!selectedPaymentMethod) {
      setPaymentMethodError(t("error-select-payment"));
      return;
    }
    setAddressError(null);
    setBranchError(null);
    setPaymentMethodError(null);
    setSubmitting(true);
    try {
      const orderRes = await OrdersAPI(router.locale || "ka", session.accessToken).ordersControllerCreate(
        deliveryMethod === "pickup"
          ? { deliveryMethod: "pickup", branchId: selectedBranch!.id }
          : {
              deliveryMethod: "courier",
              shippingAddress: `${selectedAddress!.title} - ${selectedAddress!.city}, ${selectedAddress!.address}`,
            }
      );
      const order = orderRes.data as unknown as Order;

      // createFromCart-მა კალათა უკვე დაცარიელა backend-ზე — Header-ის
      // ბეჯის განახლებისთვის client-side cache-საც ვასინქრონებთ.
      refresh();

      const paymentRes = await PaymentsAPI(router.locale || "ka", session.accessToken).paymentsControllerInitiate(
        String(order.id)
      );
      const { redirectUrl } = paymentRes.data as unknown as PaymentInitiateResponse;
      // BOG-ის hosted გვერდზე გადასვლა — გარე დომეინია, next/router-ის push
      // კი client-side ნავიგაციისთვისაა, ამიტომ რეალური ბრაუზერის ნავიგაცია გვჭირდება.
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("toast-order-failed"));
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <PurchaseSteps current={currentPurchaseStep} completed={completedPurchaseSteps} />
          <S.Title>{t("page-title")}</S.Title>

          {isEmpty ? (
            <S.EmptyState>
              <CartIcon size={48} />
              <S.EmptyStateTitle>{t("empty-cart-title")}</S.EmptyStateTitle>
              <S.ActionButton type="button" onClick={() => router.push("/")}>
                {t("back-to-catalog")}
              </S.ActionButton>
            </S.EmptyState>
          ) : (
            <S.Layout onSubmit={onSubmit} noValidate>
              <S.FormColumn>
                <S.SectionCard>
                  <S.SectionTitle>
                    {t("section-personal-info")}
                    {personalInfoComplete && (
                      <S.SectionDoneBadge>
                        <CheckCircleIcon size={15} /> {t("done-badge")}
                      </S.SectionDoneBadge>
                    )}
                  </S.SectionTitle>
                  <S.PersonalGrid>
                    <S.ReadonlyField>
                      <S.ReadonlyLabel>{t("field-first-name")}</S.ReadonlyLabel>
                      <S.ReadonlyValue>{user?.firstName || "—"}</S.ReadonlyValue>
                    </S.ReadonlyField>
                    <S.ReadonlyField>
                      <S.ReadonlyLabel>{t("field-last-name")}</S.ReadonlyLabel>
                      <S.ReadonlyValue>{user?.lastName || "—"}</S.ReadonlyValue>
                    </S.ReadonlyField>
                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        {t("field-personal-number")}
                        {personalNumberMissing && <S.RequiredHint> {t("required-hint-fill")}</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.Input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder={t("personal-number-placeholder")}
                        $invalid={personalNumberMissing}
                        value={personalNumberInput}
                        onChange={(e) => setPersonalNumberInput(e.target.value)}
                      />
                    </S.ReadonlyField>

                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        {t("field-phone-number")}
                        {phoneNotVerified && <S.RequiredHint> {t("required-hint-unverified")}</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.FieldRow>
                        <S.InputWrapper>
                          <S.Input
                            type="tel"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder={t("phone-placeholder")}
                            $invalid={!phoneInput.trim() || phoneNotVerified || !!phoneDuplicateError}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                          />
                        </S.InputWrapper>
                        {phoneNeedsVerificationUi &&
                          (phoneOtpVerified ? (
                            <S.VerifiedBadge>
                              <CheckCircleIcon size={15} /> {t("otp-verified-badge")}
                            </S.VerifiedBadge>
                          ) : (
                            <S.OtpActionBtn
                              type="button"
                              onClick={handleSendPhoneOtp}
                              disabled={phoneOtpSending || phoneOtpResendCooldown > 0}
                            >
                              {phoneOtpSending
                                ? t("otp-sending")
                                : phoneOtpResendCooldown > 0
                                ? t("otp-resend-countdown", { seconds: phoneOtpResendCooldown })
                                : phoneOtpSent
                                ? t("otp-resend")
                                : t("otp-verify-button")}
                            </S.OtpActionBtn>
                          ))}
                      </S.FieldRow>
                      {phoneOtpSent && !phoneOtpVerified && phoneNeedsVerificationUi && (
                        <S.FieldRow>
                          <S.InputWrapper>
                            <S.Input
                              type="text"
                              inputMode="numeric"
                              placeholder={t("otp-code-placeholder-sms")}
                              value={phoneOtpCodeInput}
                              onChange={(e) => setPhoneOtpCodeInput(e.target.value)}
                            />
                          </S.InputWrapper>
                          <S.OtpActionBtn
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            disabled={phoneOtpVerifying || !phoneOtpCodeInput.trim()}
                          >
                            {phoneOtpVerifying ? t("otp-verifying") : t("otp-confirm-button")}
                          </S.OtpActionBtn>
                        </S.FieldRow>
                      )}
                      {phoneOtpError && <S.FieldError>{phoneOtpError}</S.FieldError>}
                      {phoneDuplicateError && <S.FieldError>{phoneDuplicateError}</S.FieldError>}
                    </S.ReadonlyField>

                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        {t("field-email")}
                        {emailNotVerified && <S.RequiredHint> {t("required-hint-unverified")}</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.FieldRow>
                        <S.InputWrapper>
                          <S.Input
                            type="email"
                            $invalid={!emailInput.trim() || emailNotVerified || !!emailDuplicateError}
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                          />
                        </S.InputWrapper>
                        {emailNeedsVerificationUi &&
                          (otpVerified ? (
                            <S.VerifiedBadge>
                              <CheckCircleIcon size={15} /> {t("otp-verified-badge")}
                            </S.VerifiedBadge>
                          ) : (
                            <S.OtpActionBtn
                              type="button"
                              onClick={handleSendEmailOtp}
                              disabled={otpSending || otpResendCooldown > 0}
                            >
                              {otpSending
                                ? t("otp-sending")
                                : otpResendCooldown > 0
                                ? t("otp-resend-countdown", { seconds: otpResendCooldown })
                                : otpSent
                                ? t("otp-resend")
                                : t("otp-verify-button")}
                            </S.OtpActionBtn>
                          ))}
                      </S.FieldRow>
                      {otpSent && !otpVerified && emailNeedsVerificationUi && (
                        <S.FieldRow>
                          <S.InputWrapper>
                            <S.Input
                              type="text"
                              inputMode="numeric"
                              placeholder={t("otp-code-placeholder-email")}
                              value={otpCodeInput}
                              onChange={(e) => setOtpCodeInput(e.target.value)}
                            />
                          </S.InputWrapper>
                          <S.OtpActionBtn
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={otpVerifying || !otpCodeInput.trim()}
                          >
                            {otpVerifying ? t("otp-verifying") : t("otp-confirm-button")}
                          </S.OtpActionBtn>
                        </S.FieldRow>
                      )}
                      {otpError && <S.FieldError>{otpError}</S.FieldError>}
                      {emailDuplicateError && <S.FieldError>{emailDuplicateError}</S.FieldError>}
                    </S.ReadonlyField>
                     <S.SaveInfoRow>
                    <S.SaveInfoButton type="button" onClick={handleSavePersonalInfo} disabled={savingInfo}>
                      {savingInfo ? t("saving") : t("save-info-button")}
                    </S.SaveInfoButton>
                  </S.SaveInfoRow>
                  </S.PersonalGrid>



                  {purchaseBlocked && (
                    <S.InfoAlert>
                      <WarningIcon size={16} />
                      <span>{t("purchase-blocked-info")}</span>
                    </S.InfoAlert>
                  )}
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>
                    {t("section-delivery-details")}
                    {deliveryComplete && (
                      <S.SectionDoneBadge>
                        <CheckCircleIcon size={15} /> {t("selected-badge")}
                      </S.SectionDoneBadge>
                    )}
                  </S.SectionTitle>
                  <S.MethodRow>
                    <S.MethodOption
                      $active={deliveryMethod === "courier"}
                      type="button"
                      onClick={() => setDeliveryMethod("courier")}
                    >
                      <TruckIcon size={20} />
                      {t("delivery-method-courier")}
                    </S.MethodOption>
                    <S.MethodOption
                      $active={deliveryMethod === "pickup"}
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                    >
                      <BoxIcon size={20} />
                      {t("delivery-method-pickup")}
                    </S.MethodOption>
                  </S.MethodRow>

                  {deliveryMethod === "pickup" ? (
                    branchesLoading ? (
                      <S.ReadonlyValue>{t("loading")}</S.ReadonlyValue>
                    ) : branches.length === 0 ? (
                      <S.ReadonlyValue>{t("no-branches-available")}</S.ReadonlyValue>
                    ) : (
                      <S.AddressListPanel>
                        <S.AddressSelectedCard>
                          <BoxIcon size={18} />
                          <S.AddressBody>
                            <S.Label>{t("branch-label")}{selectedBranch?.company?.name ? ` · ${selectedBranch.company.name}` : ""}</S.Label>
                            <S.AddressValue>{selectedBranch?.title || t("branch-not-selected")}</S.AddressValue>
                            <span style={{ fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                              {t("pickup-ready-notice", { date: formatPickupReadyDate(t) })}
                            </span>
                          </S.AddressBody>
                          {selectedBranch && (
                            <S.InfoToggleBtn
                              type="button"
                              title={t("branch-details-title")}
                              onClick={() =>
                                setExpandedBranchId((prev) => (prev === selectedBranch.id ? null : selectedBranch.id))
                              }
                            >
                              ⓘ
                            </S.InfoToggleBtn>
                          )}
                        </S.AddressSelectedCard>

                        {selectedBranch && expandedBranchId === selectedBranch.id && (
                          <BranchDetailPanel branch={selectedBranch} />
                        )}

                        <S.ToggleAddressesBtn type="button" onClick={() => setShowBranchList((v) => !v)}>
                          {t("change-branch")}
                          <ChevronDownIcon
                            size={16}
                            style={{ transform: showBranchList ? "rotate(180deg)" : undefined }}
                          />
                        </S.ToggleAddressesBtn>

                        {showBranchList &&
                          branches.map((branch) => (
                            <React.Fragment key={branch.id}>
                              <S.AddressListItem
                                $selected={branch.id === selectedBranchId}
                                onClick={() => {setSelectedBranchId(branch.id)}}
                              >
                                <PinIcon size={16} />
                                <S.AddressBody>
                                  <S.Label>{branch.title}{branch.company?.name ? ` · ${branch.company.name}` : ""}</S.Label>
                                  <S.AddressValue>{branch.address}</S.AddressValue>
                                </S.AddressBody>
                                <S.InfoToggleBtn
                                  type="button"
                                  title={t("branch-details-title")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedBranchId((prev) => (prev === branch.id ? null : branch.id));
                                  }}
                                >
                                  ⓘ
                                </S.InfoToggleBtn>
                              </S.AddressListItem>
                              {expandedBranchId === branch.id && <BranchDetailPanel branch={branch} />}
                            </React.Fragment>
                          ))}
                      </S.AddressListPanel>
                    )
                  ) : addressesLoading ? (
                    <S.ReadonlyValue>{t("loading")}</S.ReadonlyValue>
                  ) : addresses.length === 0 ? (
                    // მისამართი საერთოდ არ არსებობს — პირდაპირ დამატების ფორმა ჩანს.
                    <S.AddressFormFields>
                      <S.AddressFormRow>
                        <S.ReadonlyField>
                          <S.Input
                            type="text"
                            placeholder={t("address-name-placeholder")}
                            $invalid={!!addressFormErrors.title}
                            value={addressFormValues.title}
                            onChange={(e) => handleAddressFieldChange("title", e.target.value)}
                          />
                          {addressFormErrors.title && <S.FieldError>{addressFormErrors.title}</S.FieldError>}
                        </S.ReadonlyField>
                        <S.ReadonlyField>
                          <S.Input
                            type="tel"
                            placeholder={t("phone-number-placeholder")}
                            $invalid={!!addressFormErrors.phoneNumber}
                            value={addressFormValues.phoneNumber}
                            onChange={(e) => handleAddressFieldChange("phoneNumber", e.target.value)}
                          />
                          {addressFormErrors.phoneNumber && (
                            <S.FieldError>{addressFormErrors.phoneNumber}</S.FieldError>
                          )}
                        </S.ReadonlyField>
                      </S.AddressFormRow>
                      <S.AddressFormRow>
                        <S.ReadonlyField>
                          <S.Select
                            $invalid={!!addressFormErrors.city}
                            value={addressFormValues.city}
                            onChange={(e) => handleAddressFieldChange("city", e.target.value)}
                          >
                            <option value="">{t("city-select-placeholder")}</option>
                            {GEORGIAN_CITIES.map((city) => (
                              <option key={city.value} value={city.value}>
                                {t(city.key)}
                              </option>
                            ))}
                          </S.Select>
                          {addressFormErrors.city && <S.FieldError>{addressFormErrors.city}</S.FieldError>}
                        </S.ReadonlyField>
                        <S.ReadonlyField>
                          <S.Input
                            type="text"
                            placeholder={t("address-placeholder")}
                            $invalid={!!addressFormErrors.address}
                            value={addressFormValues.address}
                            onChange={(e) => handleAddressFieldChange("address", e.target.value)}
                          />
                          {addressFormErrors.address && <S.FieldError>{addressFormErrors.address}</S.FieldError>}
                        </S.ReadonlyField>
                      </S.AddressFormRow>
                      <S.ReadonlyField>
                        <S.Textarea
                          rows={2}
                          placeholder={t("comment-placeholder")}
                          value={addressFormValues.comment}
                          onChange={(e) => handleAddressFieldChange("comment", e.target.value)}
                        />
                      </S.ReadonlyField>
                      <S.SaveInfoButton type="button" onClick={handleSubmitAddress} disabled={addressSaving}>
                        {addressSaving ? t("saving") : t("save")}
                      </S.SaveInfoButton>
                    </S.AddressFormFields>
                  ) : (
                    <S.AddressListPanel>
                   
                      <S.ToggleAddressesBtn type="button" onClick={() => setShowAddressList((v) => !v)}>
                        {t("change-add-address")}
                        <ChevronDownIcon
                          size={16}
                          style={{ transform: showAddressList ? "rotate(180deg)" : undefined }}
                        />
                      </S.ToggleAddressesBtn>

                      {showAddressList && (
                        <>
                          {addresses.map((addr) => (
                            <S.AddressListItem
                              key={addr.id}
                              $selected={addr.id === selectedAddressId}
                              onClick={() => {setSelectedAddressId(addr.id); setShowAddressList(false);}}
                            >
                              <PinIcon size={16} />
                              <S.AddressBody>
                                <S.Label>{t("address-label")}</S.Label>
                                <S.AddressValue>
                                  {addr.title} - {getCityLabel(addr.city)}, {addr.address}
                                </S.AddressValue>
                              </S.AddressBody>
                              <S.AddressItemActions>
                                <S.IconButton
                                  type="button"
                                  title={t("edit")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditAddressModal(addr);
                                  }}
                                >
                                  <EditIcon size={16} />
                                </S.IconButton>
                                <S.IconButton
                                  type="button"
                                  title={t("delete")}
                                  disabled={addressDeletingId === addr.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAddress(addr.id);
                                  }}
                                >
                                  <TrashIcon size={16} />
                                </S.IconButton>
                              </S.AddressItemActions>
                            </S.AddressListItem>
                          ))}
                          <S.AddNewAddressBtn type="button" onClick={openAddAddressModal}>
                            {t("add-new-address")}
                          </S.AddNewAddressBtn>
                        </>
                      )}

                         {selectedAddress && 
                      <S.AddressSelectedCard>
                        <PinIcon size={18} />
                        <S.AddressBody>
                          <S.Label>{t("address-label")}</S.Label>
                          <S.AddressValue>
                            {selectedAddress
                              ? `${selectedAddress.title} - ${getCityLabel(selectedAddress.city)}, ${selectedAddress.address}`
                              : t("address-not-selected")}
                          </S.AddressValue>
                        </S.AddressBody>
                      </S.AddressSelectedCard>
                          } 
                    </S.AddressListPanel>
                  )}
                  {deliveryMethod === "courier" && addressError && <S.FieldError>{addressError}</S.FieldError>}
                  {deliveryMethod === "pickup" && branchError && <S.FieldError>{branchError}</S.FieldError>}
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>
                    {t("section-payment-method")}
                    {paymentComplete && (
                      <S.SectionDoneBadge>
                        <CheckCircleIcon size={15} /> {t("ready-to-pay-badge")}
                      </S.SectionDoneBadge>
                    )}
                  </S.SectionTitle>
                  <S.MethodRow>
                    <S.MethodOption
                      $active={selectedPaymentMethod === "bog"}
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod("bog");
                        setPaymentMethodError(null);
                      }}
                    >
                      {t("payment-bog")}
                    </S.MethodOption>
                    <S.MethodOption $disabled type="button" disabled>
                      {t("payment-tbc")}
                      <S.SoonBadge>{t("coming-soon")}</S.SoonBadge>
                    </S.MethodOption>
                  </S.MethodRow>
                  {paymentMethodError && <S.FieldError>{paymentMethodError}</S.FieldError>}
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>{t("cart-products-section", { count: itemsCount })}</S.SectionTitle>
                  <S.OrderItemsList>
                    {items.map((item) => {
                      const image = resolveImage(item.product.images?.[0]);
                      const { price: unitPrice, originalPrice, discountPercent } = getDiscountedPrice(item.product);
                      const productName = getCategoryName(item.product, router.locale);
                      const productDescription = getLocalizedDescription(item.product, router.locale);
                      return (
                        <S.OrderItemCard key={item.id}>
                          <S.OrderItemImage>{image && <img src={image} alt={productName} />}</S.OrderItemImage>
                          <S.OrderItemInfo>
                            <S.OrderItemName>{productName}</S.OrderItemName>
                            {productDescription && <S.OrderItemDescription>{productDescription}</S.OrderItemDescription>}
                            <S.OrderItemQty>{t("item-qty", { count: item.quantity })}</S.OrderItemQty>
                          </S.OrderItemInfo>
                          <S.OrderItemPrice>
                            {(unitPrice * item.quantity).toFixed(2)} ₾
                            {originalPrice && (
                              <S.OrderItemOldPrice>{(originalPrice * item.quantity).toFixed(2)} ₾</S.OrderItemOldPrice>
                            )}
                            {discountPercent && <S.OrderItemDiscountBadge>-{discountPercent}%</S.OrderItemDiscountBadge>}
                          </S.OrderItemPrice>
                        </S.OrderItemCard>
                      );
                    })}
                  </S.OrderItemsList>
                </S.SectionCard>
              </S.FormColumn>

              <S.SummaryColumn>
                <S.SummaryTitle>{t("summary-title")}</S.SummaryTitle>
                <S.SummaryRow>
                  <span>{t("summary-products", { count: itemsCount })}</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                <S.SummaryRow>
                  <span>{t("summary-delivery-cost")}</span>
                  <span>{t("free")}</span>
                </S.SummaryRow>
                <S.Divider />
                <S.SummaryRow>
                  <span>{t("summary-total-price")}</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                {discount > 0 && (
                  <S.SummaryRow $discount>
                    <span>{t("summary-discount")}</span>
                    <span>-{discount.toFixed(2)} ₾</span>
                  </S.SummaryRow>
                )}
                <S.TotalRow>
                  {t("summary-total-payable")}
                  <S.TotalValue>{total.toFixed(2)} ₾</S.TotalValue>
                </S.TotalRow>

                <S.DeliveryNotice>
                  {deliveryMethod === "pickup" ? (
                    <>
                      <BoxIcon size={18} />
                      <span>
                        {t("delivery-notice-pickup")}
                        <br />
                        {selectedBranch?.title ? `${selectedBranch.title} — ` : ""}
                        {formatPickupReadyDate(t)}
                      </span>
                    </>
                  ) : (
                    <>
                      <TruckIcon size={18} />
                      <span>
                        {t("delivery-notice-courier")}
                        <br />
                        {t("delivery-notice-courier-cutoff")}
                      </span>
                    </>
                  )}
                </S.DeliveryNotice>

                <S.SubmitButton type="submit" disabled={submitting || purchaseBlocked || !selectedPaymentMethod}>
                  <LockIcon size={16} />
                  {submitting ? t("submitting") : t("pay-with-card")}
                </S.SubmitButton>
              </S.SummaryColumn>
            </S.Layout>
          )}
        </S.Container>
      </S.PageBackground>
      <Footer />

      {addressModalOpen && (
        <S.ModalOverlay {...getOverlayProps(closeAddressModal)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle>{editingAddressId ? t("modal-edit-address-title") : t("modal-add-address-title")}</S.ModalTitle>
              <S.CloseButton type="button" onClick={closeAddressModal}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <S.AddressFormFields>
              <S.ReadonlyField>
                <S.Input
                  type="text"
                  placeholder={t("address-name-placeholder")}
                  $invalid={!!addressFormErrors.title}
                  value={addressFormValues.title}
                  onChange={(e) => handleAddressFieldChange("title", e.target.value)}
                />
                {addressFormErrors.title && <S.FieldError>{addressFormErrors.title}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Input
                  type="tel"
                  placeholder={t("phone-number-placeholder")}
                  $invalid={!!addressFormErrors.phoneNumber}
                  value={addressFormValues.phoneNumber}
                  onChange={(e) => handleAddressFieldChange("phoneNumber", e.target.value)}
                />
                {addressFormErrors.phoneNumber && <S.FieldError>{addressFormErrors.phoneNumber}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Select
                  $invalid={!!addressFormErrors.city}
                  value={addressFormValues.city}
                  onChange={(e) => handleAddressFieldChange("city", e.target.value)}
                >
                  <option value="">{t("city-select-placeholder-choose")}</option>
                  {GEORGIAN_CITIES.map((city) => (
                    <option key={city.value} value={city.value}>
                      {t(city.key)}
                    </option>
                  ))}
                </S.Select>
                {addressFormErrors.city && <S.FieldError>{addressFormErrors.city}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Input
                  type="text"
                  placeholder={t("address-placeholder")}
                  $invalid={!!addressFormErrors.address}
                  value={addressFormValues.address}
                  onChange={(e) => handleAddressFieldChange("address", e.target.value)}
                />
                {addressFormErrors.address && <S.FieldError>{addressFormErrors.address}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Textarea
                  rows={2}
                  placeholder={t("comment-placeholder")}
                  value={addressFormValues.comment}
                  onChange={(e) => handleAddressFieldChange("comment", e.target.value)}
                />
              </S.ReadonlyField>
              <S.ModalSubmitButton type="button" onClick={handleSubmitAddress} disabled={addressSaving}>
                {addressSaving ? t("saving") : t("save")}
              </S.ModalSubmitButton>
            </S.AddressFormFields>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </>
  );
};

export default CheckoutComponent;
