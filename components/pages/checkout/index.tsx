import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AuthModal from "@/components/shared/AuthModal";
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
import { emailField, personalNumberField, phoneNumberField } from "@/components/shared/validation/schemas";
import { AddressFormValues, addressFormSchema } from "./schemas";
import * as S from "./style";

const resolveImage = (image?: string) =>
  image ? (image.startsWith("http") ? image : `${CDN_URL}${image}`) : undefined;

// მისამართის ფორმის "ქალაქი" სელექტისთვის — ყველაზე ხშირად შერჩეული
// ქართული ქალაქები (backend-ზე city უბრალო string ველია, აქ ჩამონათვალის
// გაფართოება ბექენდის ცვლილებას არ საჭიროებს).
const GEORGIAN_CITIES = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "რუსთავი",
  "გორი",
  "ზუგდიდი",
  "ფოთი",
  "ხაშური",
  "სამტრედია",
  "სენაკი",
  "ზესტაფონი",
  "მარნეული",
  "თელავი",
  "ახალციხე",
  "ოზურგეთი",
  "ქობულეთი",
  "ბორჯომი",
  "გურჯაანი",
  "ახალქალაქი",
  "წყალტუბო",
];

// კვირის დღეების key-ები/ლეიბლები ფილიალის workingHours-ის ჩვენებისთვის —
// dashboard/schemas.ts-ის BRANCH_DAY_KEYS-ის იგივე თანმიმდევრობა (mon..sun).
const WEEK_DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type WeekDayKey = (typeof WEEK_DAY_KEYS)[number];
const WEEK_DAY_LABELS: Record<WeekDayKey, string> = {
  mon: "ორშაბათი",
  tue: "სამშაბათი",
  wed: "ოთხშაბათი",
  thu: "ხუთშაბათი",
  fri: "პარასკევი",
  sat: "შაბათი",
  sun: "კვირა",
};
// Date.getDay() 0=კვირა..6=შაბათი — WEEK_DAY_KEYS-ის (ორშაბათიდან იწყება) იგივე ინდექსზე გადასაყვანად.
const jsDayToWeekDayKey = (jsDay: number): WeekDayKey => WEEK_DAY_KEYS[(jsDay + 6) % 7];

const GEORGIAN_MONTHS_GENITIVE = [
  "იანვარს",
  "თებერვალს",
  "მარტს",
  "აპრილს",
  "მაისს",
  "ივნისს",
  "ივლისს",
  "აგვისტოს",
  "სექტემბერს",
  "ოქტომბერს",
  "ნოემბერს",
  "დეკემბერს",
];

// "ხვალ, 30 აგვისტოს" — ფილიალიდან გატანის მზადყოფნის თარიღი (მარტივი
// მიახლოება, backend-ის რეალური ლოგისტიკის ვადის გარეშე).
const formatPickupReadyDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `ხვალ, ${tomorrow.getDate()} ${GEORGIAN_MONTHS_GENITIVE[tomorrow.getMonth()]}`;
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
            <S.WorkingHoursDay>{WEEK_DAY_LABELS[day]}</S.WorkingHoursDay>
            <span>{hours ? `${hours.open} - ${hours.close}` : "დახურულია"}</span>
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

  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState("");
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const resetEmailOtpState = () => {
    setOtpSending(false);
    setOtpVerifying(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpRequestId("");
    setOtpCodeInput("");
    setOtpError(null);
  };

  useEffect(() => {
    if (otpSent || otpVerified) resetEmailOtpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInput]);

  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [phoneOtpRequestId, setPhoneOtpRequestId] = useState("");
  const [phoneOtpCodeInput, setPhoneOtpCodeInput] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);

  const resetPhoneOtpState = () => {
    setPhoneOtpSending(false);
    setPhoneOtpVerifying(false);
    setPhoneOtpSent(false);
    setPhoneOtpVerified(false);
    setPhoneOtpRequestId("");
    setPhoneOtpCodeInput("");
    setPhoneOtpError(null);
  };

  useEffect(() => {
    if (phoneOtpSent || phoneOtpVerified) resetPhoneOtpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneInput]);

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

  const fetchAddresses = async () => {
    if (!session?.accessToken) return;
    setAddressesLoading(true);
    try {
      const res = await AddressesAPI(router.locale || "ka", session.accessToken).addressesControllerFindAll();
      const list = (res.data as unknown as Address[]) || [];
      setAddresses(list);
      setSelectedAddressId((prev) =>
        prev && list.some((a) => a.id === prev) ? prev : list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null
      );
    } catch {
      // მისამართების ჩატვირთვის ჩავარდნა UI-ს არ უნდა ბლოკავდეს — უბრალოდ ცარიელი დარჩება სია.
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  // ფილიალების სია საჯარო endpoint-ია — ავტორიზაცია არ სჭირდება, ამიტომ
  // ერთხელ, mount-ზევე იტვირთება (ავტორიზაციის loading-ის მოლოდინის გარეშე).
  const fetchBranches = async () => {
    setBranchesLoading(true);
    try {
      const res = await BranchesAPI(router.locale || "ka", "").branchesControllerFindAll();
      const list = (res.data as unknown as Branch[]) || [];
      setBranches(list);
      setSelectedBranchId((prev) => (prev && list.some((b) => b.id === prev) ? prev : list[0]?.id ?? null));
    } catch {
      // ფილიალების ჩატვირთვის ჩავარდნა UI-ს არ უნდა ბლოკავდეს — უბრალოდ ცარიელი დარჩება სია.
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

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
    const parsed = addressFormSchema.safeParse(addressFormValues);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof AddressFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
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
      toast.success(editingAddressId ? "მისამართი განახლდა" : "მისამართი დაემატა");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მისამართის შენახვა ვერ მოხერხდა");
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
      setSelectedAddressId((prev) => (prev === id ? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null : prev));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მისამართის წაშლა ვერ მოხერხდა");
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
  }, [status, session, router.locale]);

  const handleSendEmailOtp = async () => {
    setOtpError(null);
    const parsed = emailField().safeParse(emailInput);
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message || "გთხოვთ მიუთითოთ ვალიდური ელფოსტა");
      return;
    }
    setOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendEmailOtp({ email: parsed.data });
      setOtpRequestId(resp.data.requestId);
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "დადასტურების კოდის გაგზავნა ვერ მოხერხდა");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setOtpError(null);
    if (!otpCodeInput.trim()) {
      setOtpError("გთხოვთ შეიყვანოთ დადასტურების კოდი");
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
      setOtpError(err?.response?.data?.message || "კოდი არასწორია ან ვადაგასულია");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setPhoneOtpError(null);
    const parsed = phoneNumberField().safeParse(phoneInput);
    if (!parsed.success) {
      setPhoneOtpError(parsed.error.issues[0]?.message || "გთხოვთ მიუთითოთ ვალიდური მობილურის ნომერი");
      return;
    }
    setPhoneOtpSending(true);
    try {
      const resp = await OtpAPI(router.locale || "ka", "").otpControllerSendOtp({
        phoneNumber: toE164(parsed.data),
      });
      setPhoneOtpRequestId(resp.data.requestId);
      setPhoneOtpSent(true);
    } catch (err: any) {
      setPhoneOtpError(err?.response?.data?.message || "დადასტურების კოდის გაგზავნა ვერ მოხერხდა");
    } finally {
      setPhoneOtpSending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpError(null);
    if (!phoneOtpCodeInput.trim()) {
      setPhoneOtpError("გთხოვთ შეიყვანოთ დადასტურების კოდი");
      return;
    }
    setPhoneOtpVerifying(true);
    try {
      await OtpAPI(router.locale || "ka", "").otpControllerVerifyOtp({
        requestId: phoneOtpRequestId,
        code: phoneOtpCodeInput.trim(),
      });
      setPhoneOtpVerified(true);
    } catch (err: any) {
      setPhoneOtpError(err?.response?.data?.message || "კოდი არასწორია ან ვადაგასულია");
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

    const personalNumberParsed = personalNumberField().safeParse(personalNumberInput);
    if (!personalNumberParsed.success) {
      toast.error(personalNumberParsed.error.issues[0]?.message || "გთხოვთ მიუთითოთ ვალიდური პირადი ნომერი");
      return;
    }
    if (emailChanged && !otpVerified) {
      toast.error("ელფოსტის შესაცვლელად საჭიროა ახალი ელფოსტის დადასტურება");
      return;
    }
    if (phoneChanged && !phoneOtpVerified) {
      toast.error("მობილურის ნომრის შესაცვლელად საჭიროა ახალი ნომრის დადასტურება");
      return;
    }

    const includeEmailOtpProof = emailChanged || otpVerified;
    const includePhoneOtpProof = phoneChanged || phoneOtpVerified;

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
      toast.success("მონაცემები წარმატებით შენახულია!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მონაცემების შენახვა ვერ მოხერხდა");
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
            <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
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
            <S.AccessDeniedTitle>საჭიროა ავტორიზაცია</S.AccessDeniedTitle>
            <S.AccessDeniedText>შეკვეთის გასაფორმებლად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton type="button" onClick={() => setAuthModalOpen(true)}>
              შესვლა
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || isEmpty || purchaseBlocked) return;

    if (deliveryMethod === "courier" && !selectedAddress) {
      setAddressError("გთხოვთ აირჩიოთ ან დაამატოთ მიწოდების მისამართი");
      return;
    }
    if (deliveryMethod === "pickup" && !selectedBranch) {
      setBranchError("გთხოვთ აირჩიოთ ფილიალი");
      return;
    }
    setAddressError(null);
    setBranchError(null);
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
      toast.error(err?.response?.data?.message || "შეკვეთის გაფორმება ვერ მოხერხდა");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <S.PageBackground>
        <S.Container>
          <S.Title>შეკვეთის გაფორმება</S.Title>

          {isEmpty ? (
            <S.EmptyState>
              <CartIcon size={48} />
              <S.EmptyStateTitle>კალათა ცარიელია</S.EmptyStateTitle>
              <S.ActionButton type="button" onClick={() => router.push("/")}>
                კატალოგში დაბრუნება
              </S.ActionButton>
            </S.EmptyState>
          ) : (
            <S.Layout onSubmit={onSubmit} noValidate>
              <S.FormColumn>
                <S.SectionCard>
                  <S.SectionTitle>პერსონალური ინფორმაცია</S.SectionTitle>
                  <S.PersonalGrid>
                    <S.ReadonlyField>
                      <S.ReadonlyLabel>სახელი</S.ReadonlyLabel>
                      <S.ReadonlyValue>{user?.firstName || "—"}</S.ReadonlyValue>
                    </S.ReadonlyField>
                    <S.ReadonlyField>
                      <S.ReadonlyLabel>გვარი</S.ReadonlyLabel>
                      <S.ReadonlyValue>{user?.lastName || "—"}</S.ReadonlyValue>
                    </S.ReadonlyField>
                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        პირადი ნომერი
                        {personalNumberMissing && <S.RequiredHint> — შეავსეთ</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.Input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="11-ციფრიანი პირადი ნომერი"
                        $invalid={personalNumberMissing}
                        value={personalNumberInput}
                        onChange={(e) => setPersonalNumberInput(e.target.value)}
                      />
                    </S.ReadonlyField>

                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        მობილურის ნომერი
                        {phoneNotVerified && <S.RequiredHint> — არადამოწმებული</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.FieldRow>
                        <S.InputWrapper>
                          <S.Input
                            type="tel"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="5XX XX XX XX"
                            $invalid={!phoneInput.trim() || phoneNotVerified}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                          />
                        </S.InputWrapper>
                        {phoneNeedsVerificationUi &&
                          (phoneOtpVerified ? (
                            <S.VerifiedBadge>
                              <CheckCircleIcon size={15} /> დადასტურებულია
                            </S.VerifiedBadge>
                          ) : (
                            <S.OtpActionBtn type="button" onClick={handleSendPhoneOtp} disabled={phoneOtpSending}>
                              {phoneOtpSending ? "იგზავნება..." : phoneOtpSent ? "ხელახლა გაგზავნა" : "დამოწმება"}
                            </S.OtpActionBtn>
                          ))}
                      </S.FieldRow>
                      {phoneOtpSent && !phoneOtpVerified && phoneNeedsVerificationUi && (
                        <S.FieldRow>
                          <S.InputWrapper>
                            <S.Input
                              type="text"
                              inputMode="numeric"
                              placeholder="SMS-ით მიღებული კოდი"
                              value={phoneOtpCodeInput}
                              onChange={(e) => setPhoneOtpCodeInput(e.target.value)}
                            />
                          </S.InputWrapper>
                          <S.OtpActionBtn
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            disabled={phoneOtpVerifying || !phoneOtpCodeInput.trim()}
                          >
                            {phoneOtpVerifying ? "მოწმდება..." : "დადასტურება"}
                          </S.OtpActionBtn>
                        </S.FieldRow>
                      )}
                      {phoneOtpError && <S.FieldError>{phoneOtpError}</S.FieldError>}
                    </S.ReadonlyField>

                    <S.ReadonlyField >
                      <S.ReadonlyLabel>
                        ელ-ფოსტა
                        {emailNotVerified && <S.RequiredHint> — არადამოწმებული</S.RequiredHint>}
                      </S.ReadonlyLabel>
                      <S.FieldRow>
                        <S.InputWrapper>
                          <S.Input
                            type="email"
                            $invalid={!emailInput.trim() || emailNotVerified}
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                          />
                        </S.InputWrapper>
                        {emailNeedsVerificationUi &&
                          (otpVerified ? (
                            <S.VerifiedBadge>
                              <CheckCircleIcon size={15} /> დადასტურებულია
                            </S.VerifiedBadge>
                          ) : (
                            <S.OtpActionBtn type="button" onClick={handleSendEmailOtp} disabled={otpSending}>
                              {otpSending ? "იგზავნება..." : otpSent ? "ხელახლა გაგზავნა" : "დამოწმება"}
                            </S.OtpActionBtn>
                          ))}
                      </S.FieldRow>
                      {otpSent && !otpVerified && emailNeedsVerificationUi && (
                        <S.FieldRow>
                          <S.InputWrapper>
                            <S.Input
                              type="text"
                              inputMode="numeric"
                              placeholder="ელფოსტაზე მიღებული კოდი"
                              value={otpCodeInput}
                              onChange={(e) => setOtpCodeInput(e.target.value)}
                            />
                          </S.InputWrapper>
                          <S.OtpActionBtn
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={otpVerifying || !otpCodeInput.trim()}
                          >
                            {otpVerifying ? "მოწმდება..." : "დადასტურება"}
                          </S.OtpActionBtn>
                        </S.FieldRow>
                      )}
                      {otpError && <S.FieldError>{otpError}</S.FieldError>}
                    </S.ReadonlyField>
                     <S.SaveInfoRow>
                    <S.SaveInfoButton type="button" onClick={handleSavePersonalInfo} disabled={savingInfo}>
                      {savingInfo ? "ინახება..." : "მონაცემების შენახვა"}
                    </S.SaveInfoButton>
                  </S.SaveInfoRow>
                  </S.PersonalGrid>

                 

                  {purchaseBlocked && (
                    <S.InfoAlert>
                      <WarningIcon size={16} />
                      <span>
                        შეკვეთის გასაფორმებლად საჭიროა ელფოსტის და მობილურის დადასტურება და პირადი ნომრის
                        შევსება — შეავსეთ ველები ზემოთ და დააჭირეთ &bdquo;მონაცემების შენახვას&ldquo;.
                      </span>
                    </S.InfoAlert>
                  )}
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>მიწოდების დეტალები</S.SectionTitle>
                  <S.MethodRow>
                    <S.MethodOption
                      $active={deliveryMethod === "courier"}
                      type="button"
                      onClick={() => setDeliveryMethod("courier")}
                    >
                      <TruckIcon size={20} />
                      საკურიერო მომსახურება
                    </S.MethodOption>
                    <S.MethodOption
                      $active={deliveryMethod === "pickup"}
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                    >
                      <BoxIcon size={20} />
                      ფილიალიდან გატანა
                    </S.MethodOption>
                  </S.MethodRow>

                  {deliveryMethod === "pickup" ? (
                    branchesLoading ? (
                      <S.ReadonlyValue>იტვირთება...</S.ReadonlyValue>
                    ) : branches.length === 0 ? (
                      <S.ReadonlyValue>ამჟამად აქტიური ფილიალი არ არის</S.ReadonlyValue>
                    ) : (
                      <S.AddressListPanel>
                        <S.AddressSelectedCard>
                          <BoxIcon size={18} />
                          <S.AddressBody>
                            <S.Label>ფილიალი</S.Label>
                            <S.AddressValue>{selectedBranch?.title || "ფილიალი არ არის არჩეული"}</S.AddressValue>
                            <span style={{ fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                              შეკვეთის აღება შესაძლებელი იქნება {formatPickupReadyDate()}
                            </span>
                          </S.AddressBody>
                          {selectedBranch && (
                            <S.InfoToggleBtn
                              type="button"
                              title="ფილიალის დეტალები"
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
                          შეცვალე ფილიალი
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
                                onClick={() => setSelectedBranchId(branch.id)}
                              >
                                <PinIcon size={16} />
                                <S.AddressBody>
                                  <S.Label>{branch.title}</S.Label>
                                  <S.AddressValue>{branch.address}</S.AddressValue>
                                </S.AddressBody>
                                <S.InfoToggleBtn
                                  type="button"
                                  title="ფილიალის დეტალები"
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
                    <S.ReadonlyValue>იტვირთება...</S.ReadonlyValue>
                  ) : addresses.length === 0 ? (
                    // მისამართი საერთოდ არ არსებობს — პირდაპირ დამატების ფორმა ჩანს.
                    <S.AddressFormFields>
                      <S.AddressFormRow>
                        <S.ReadonlyField>
                          <S.Input
                            type="text"
                            placeholder="სახელი (მაგ. სამსახური, სახლი)"
                            $invalid={!!addressFormErrors.title}
                            value={addressFormValues.title}
                            onChange={(e) => handleAddressFieldChange("title", e.target.value)}
                          />
                          {addressFormErrors.title && <S.FieldError>{addressFormErrors.title}</S.FieldError>}
                        </S.ReadonlyField>
                        <S.ReadonlyField>
                          <S.Input
                            type="tel"
                            placeholder="ტელეფონის ნომერი"
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
                            <option value="">ქალაქი</option>
                            {GEORGIAN_CITIES.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </S.Select>
                          {addressFormErrors.city && <S.FieldError>{addressFormErrors.city}</S.FieldError>}
                        </S.ReadonlyField>
                        <S.ReadonlyField>
                          <S.Input
                            type="text"
                            placeholder="მისამართი"
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
                          placeholder="დამატებითი კომენტარი"
                          value={addressFormValues.comment}
                          onChange={(e) => handleAddressFieldChange("comment", e.target.value)}
                        />
                      </S.ReadonlyField>
                      <S.SaveInfoButton type="button" onClick={handleSubmitAddress} disabled={addressSaving}>
                        {addressSaving ? "ინახება..." : "შენახვა"}
                      </S.SaveInfoButton>
                    </S.AddressFormFields>
                  ) : (
                    <S.AddressListPanel>
                      <S.AddressSelectedCard>
                        <PinIcon size={18} />
                        <S.AddressBody>
                          <S.Label>მისამართი</S.Label>
                          <S.AddressValue>
                            {selectedAddress
                              ? `${selectedAddress.title} - ${selectedAddress.city}, ${selectedAddress.address}`
                              : "მისამართი არ არის არჩეული"}
                          </S.AddressValue>
                        </S.AddressBody>
                      </S.AddressSelectedCard>

                      <S.ToggleAddressesBtn type="button" onClick={() => setShowAddressList((v) => !v)}>
                        შეცვალე/დაამატე მისამართი
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
                              onClick={() => setSelectedAddressId(addr.id)}
                            >
                              <PinIcon size={16} />
                              <S.AddressBody>
                                <S.Label>მისამართი</S.Label>
                                <S.AddressValue>
                                  {addr.title} - {addr.city}, {addr.address}
                                </S.AddressValue>
                              </S.AddressBody>
                              <S.AddressItemActions>
                                <S.IconButton
                                  type="button"
                                  title="რედაქტირება"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditAddressModal(addr);
                                  }}
                                >
                                  <EditIcon size={16} />
                                </S.IconButton>
                                <S.IconButton
                                  type="button"
                                  title="წაშლა"
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
                            დაამატე ახალი მისამართი
                          </S.AddNewAddressBtn>
                        </>
                      )}
                    </S.AddressListPanel>
                  )}
                  {deliveryMethod === "courier" && addressError && <S.FieldError>{addressError}</S.FieldError>}
                  {deliveryMethod === "pickup" && branchError && <S.FieldError>{branchError}</S.FieldError>}
                </S.SectionCard>

                <S.SectionCard>
                  <S.SectionTitle>გადახდის მეთოდი</S.SectionTitle>
                  <S.MethodRow>
                    <S.MethodOption $active type="button">
                      საქართველოს ბანკი
                    </S.MethodOption>
                    <S.MethodOption $disabled type="button" disabled>
                      თიბისი ბანკი
                      <S.SoonBadge>მალე</S.SoonBadge>
                    </S.MethodOption>
                  </S.MethodRow>
                </S.SectionCard>
              </S.FormColumn>

              <S.SummaryColumn>
                <S.SummaryTitle>შეკვეთა</S.SummaryTitle>
                <S.SummaryRow>
                  <span>პროდუქტი ({itemsCount})</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                <S.SummaryRow>
                  <span>მიტანის დირებულება:</span>
                  <span>უფასო</span>
                </S.SummaryRow>
                <S.Divider />
                <S.SummaryRow>
                  <span>სულ თანხა:</span>
                  <span>{subtotal.toFixed(2)} ₾</span>
                </S.SummaryRow>
                {discount > 0 && (
                  <S.SummaryRow $discount>
                    <span>ფასდაკლება:</span>
                    <span>-{discount.toFixed(2)} ₾</span>
                  </S.SummaryRow>
                )}
                <S.TotalRow>
                  ჯამში გადასახდელი:
                  <S.TotalValue>{total.toFixed(2)} ₾</S.TotalValue>
                </S.TotalRow>

                <S.DeliveryNotice>
                  {deliveryMethod === "pickup" ? (
                    <>
                      <BoxIcon size={18} />
                      <span>
                        შეკვეთის აღება ფილიალიდან
                        <br />
                        {selectedBranch?.title ? `${selectedBranch.title} — ` : ""}
                        {formatPickupReadyDate()}
                      </span>
                    </>
                  ) : (
                    <>
                      <TruckIcon size={18} />
                      <span>
                        მიტანის თარიღი: 7-8 სექტემბერი
                        <br />
                        თუ შეკვეთავთ დღეს, 13:00 საათის შემდეგ
                      </span>
                    </>
                  )}
                </S.DeliveryNotice>

                <S.SubmitButton type="submit" disabled={submitting || purchaseBlocked}>
                  <LockIcon size={16} />
                  {submitting ? "მუშავდება..." : "ბარათით გადახდა (BOG)"}
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
              <S.ModalTitle>{editingAddressId ? "მისამართის რედაქტირება" : "დაამატე ახალი მისამართი"}</S.ModalTitle>
              <S.CloseButton type="button" onClick={closeAddressModal}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <S.AddressFormFields>
              <S.ReadonlyField>
                <S.Input
                  type="text"
                  placeholder="სახელი (მაგ. სამსახური, სახლი)"
                  $invalid={!!addressFormErrors.title}
                  value={addressFormValues.title}
                  onChange={(e) => handleAddressFieldChange("title", e.target.value)}
                />
                {addressFormErrors.title && <S.FieldError>{addressFormErrors.title}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Input
                  type="tel"
                  placeholder="ტელეფონის ნომერი"
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
                  <option value="">აირჩიეთ</option>
                  {GEORGIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </S.Select>
                {addressFormErrors.city && <S.FieldError>{addressFormErrors.city}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Input
                  type="text"
                  placeholder="მისამართი"
                  $invalid={!!addressFormErrors.address}
                  value={addressFormValues.address}
                  onChange={(e) => handleAddressFieldChange("address", e.target.value)}
                />
                {addressFormErrors.address && <S.FieldError>{addressFormErrors.address}</S.FieldError>}
              </S.ReadonlyField>
              <S.ReadonlyField>
                <S.Textarea
                  rows={2}
                  placeholder="დამატებითი კომენტარი"
                  value={addressFormValues.comment}
                  onChange={(e) => handleAddressFieldChange("comment", e.target.value)}
                />
              </S.ReadonlyField>
              <S.ModalSubmitButton type="button" onClick={handleSubmitAddress} disabled={addressSaving}>
                {addressSaving ? "ინახება..." : "შენახვა"}
              </S.ModalSubmitButton>
            </S.AddressFormFields>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </>
  );
};

export default CheckoutComponent;
