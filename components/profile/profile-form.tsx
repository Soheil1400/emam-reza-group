"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  ChevronDown,
  GraduationCap,
  Home,
  ImageUp,
  MapPinned,
  Phone,
  School,
  User,
  Users,
} from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";

type ProfileData = {
  firstName: string;
  lastName: string;
  nationalCode: string;
  educationStage: "STUDENT" | "UNIVERSITY_STUDENT" | "EMPLOYED";
  fatherName: string;
  birthDateJalali: string;
  birthProvince: string;
  currentCircle: string;
  personnelPhotoUrl: string;
  idCardPhotoUrl: string;
  discoverSource: "FAMILY" | "ENVIRONMENTAL_ADS" | "DIRECT_INVITE";
  mobile: string;
  motherMobile: string;
  fatherMobile: string;
  homePhone: string;
  fatherJob: string;
  homeAddress: string;
};

const educationOptions = [
  { value: "STUDENT", label: "دانش آموز" },
  { value: "UNIVERSITY_STUDENT", label: "دانشجو" },
  { value: "EMPLOYED", label: "شاغل" },
] as const;

const discoverOptions = [
  { value: "FAMILY", label: "از طریق خانواده" },
  { value: "ENVIRONMENTAL_ADS", label: "از طریق تبلیغات محیطی (پوستر، بنر، اطلاعیه و...)" },
  { value: "DIRECT_INVITE", label: "از طریق دعوت مستقیم یکی از اعضای گروه" },
] as const;

const provinceOptions = [
  "تهران",
  "البرز",
  "اصفهان",
  "فارس",
  "خراسان رضوی",
  "قم",
  "مازندران",
  "گیلان",
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "خوزستان",
  "کرمان",
  "هرمزگان",
];

function persianToLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

function LabeledInput({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  icon: React.ReactNode;
  label: string;
  name: keyof ProfileData;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
        {icon}
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
    </label>
  );
}

export function ProfileForm({ initialData }: { initialData: Partial<ProfileData> }) {
  const [form, setForm] = useState<ProfileData>({
    firstName: initialData.firstName ?? "",
    lastName: initialData.lastName ?? "",
    nationalCode: initialData.nationalCode ?? "",
    educationStage: initialData.educationStage ?? "STUDENT",
    fatherName: initialData.fatherName ?? "",
    birthDateJalali: initialData.birthDateJalali ?? "",
    birthProvince: initialData.birthProvince ?? "تهران",
    currentCircle: initialData.currentCircle ?? "",
    personnelPhotoUrl: initialData.personnelPhotoUrl ?? "",
    idCardPhotoUrl: initialData.idCardPhotoUrl ?? "",
    discoverSource: initialData.discoverSource ?? "FAMILY",
    mobile: initialData.mobile ?? "",
    motherMobile: initialData.motherMobile ?? "",
    fatherMobile: initialData.fatherMobile ?? "",
    homePhone: initialData.homePhone ?? "",
    fatherJob: initialData.fatherJob ?? "",
    homeAddress: initialData.homeAddress ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  const personnelInputRef = useRef<HTMLInputElement | null>(null);
  const idCardInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingKey, setUploadingKey] = useState<"personnelPhotoUrl" | "idCardPhotoUrl" | null>(null);

  function updateField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImage(file: File | null, key: "personnelPhotoUrl" | "idCardPhotoUrl") {
    if (!file) return;
    setUploadingKey(key);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/profile/uploads", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as { url?: string; message?: string };
    setUploadingKey(null);

    if (!response.ok || !data.url) {
      setSnackbar({ show: true, message: data.message ?? "آپلود تصویر ناموفق بود", kind: "error" });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
      return;
    }

    updateField(key, data.url);
    setSnackbar({ show: true, message: "تصویر با موفقیت آپلود شد", kind: "success" });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2000);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      nationalCode: persianToLatinDigits(form.nationalCode),
      birthDateJalali: persianToLatinDigits(form.birthDateJalali),
      mobile: persianToLatinDigits(form.mobile),
      motherMobile: persianToLatinDigits(form.motherMobile),
      fatherMobile: persianToLatinDigits(form.fatherMobile),
      homePhone: persianToLatinDigits(form.homePhone),
    };

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { message?: string };
    setSubmitting(false);

    if (!response.ok) {
      setSnackbar({ show: true, message: data.message ?? "ذخیره پروفایل ناموفق بود", kind: "error" });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
      return;
    }

    setSnackbar({ show: true, message: "پروفایل با موفقیت ذخیره شد", kind: "success" });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 2500);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-emerald-900">پروفایل</h1>
        <p className="mt-2 text-sm text-zinc-600">اطلاعات فردی خود را کامل و ذخیره کنید.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <LabeledInput
            icon={<User className="h-4 w-4 text-emerald-700" />}
            label="نام"
            name="firstName"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
          <LabeledInput
            icon={<User className="h-4 w-4 text-emerald-700" />}
            label="نام خانوادگی"
            name="lastName"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
          <LabeledInput
            icon={<School className="h-4 w-4 text-emerald-700" />}
            label="کد ملی"
            name="nationalCode"
            value={form.nationalCode}
            inputMode="numeric"
            onChange={(event) => updateField("nationalCode", event.target.value)}
          />

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <GraduationCap className="h-4 w-4 text-emerald-700" />
              مقطع تحصیلی
            </span>
            <div className="relative">
              <select
                value={form.educationStage}
                onChange={(event) =>
                  updateField("educationStage", event.target.value as ProfileData["educationStage"])
                }
                className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white py-2.5 pr-3 pl-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                {educationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>

          <LabeledInput
            icon={<Users className="h-4 w-4 text-emerald-700" />}
            label="نام پدر"
            name="fatherName"
            value={form.fatherName}
            onChange={(event) => updateField("fatherName", event.target.value)}
          />

          <LabeledInput
            icon={<CalendarDays className="h-4 w-4 text-emerald-700" />}
            label="تاریخ تولد (شمسی)"
            name="birthDateJalali"
            value={form.birthDateJalali}
            placeholder="مثال: 1382/07/21"
            onChange={(event) => updateField("birthDateJalali", event.target.value)}
          />

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <MapPinned className="h-4 w-4 text-emerald-700" />
              استان محل تولد
            </span>
            <div className="relative">
              <select
                value={form.birthProvince}
                onChange={(event) => updateField("birthProvince", event.target.value)}
                className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white py-2.5 pr-3 pl-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                {provinceOptions.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>

          <LabeledInput
            icon={<Users className="h-4 w-4 text-emerald-700" />}
            label="شما در حال حاضر عضو کدام حلقه هستید؟"
            name="currentCircle"
            value={form.currentCircle}
            onChange={(event) => updateField("currentCircle", event.target.value)}
          />

          <label className="block md:col-span-2">
            <span className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <Users className="h-4 w-4 text-emerald-700" />
              چگونه با گروه امام رضا (ع) آشنا شدید؟
            </span>
            <div className="relative">
              <select
                value={form.discoverSource}
                onChange={(event) =>
                  updateField("discoverSource", event.target.value as ProfileData["discoverSource"])
                }
                className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white py-2.5 pr-3 pl-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                {discoverOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>

          <LabeledInput
            icon={<Phone className="h-4 w-4 text-emerald-700" />}
            label="شماره موبایل"
            name="mobile"
            value={form.mobile}
            inputMode="numeric"
            onChange={(event) => updateField("mobile", event.target.value)}
          />
          <LabeledInput
            icon={<Phone className="h-4 w-4 text-emerald-700" />}
            label="شماره تلفن همراه مادر"
            name="motherMobile"
            value={form.motherMobile}
            inputMode="numeric"
            onChange={(event) => updateField("motherMobile", event.target.value)}
          />
          <LabeledInput
            icon={<Phone className="h-4 w-4 text-emerald-700" />}
            label="شماره تلفن همراه پدر"
            name="fatherMobile"
            value={form.fatherMobile}
            inputMode="numeric"
            onChange={(event) => updateField("fatherMobile", event.target.value)}
          />
          <LabeledInput
            icon={<Phone className="h-4 w-4 text-emerald-700" />}
            label="شماره تلفن منزل"
            name="homePhone"
            value={form.homePhone}
            inputMode="numeric"
            onChange={(event) => updateField("homePhone", event.target.value)}
          />
          <LabeledInput
            icon={<BriefcaseBusiness className="h-4 w-4 text-emerald-700" />}
            label="شغل پدر"
            name="fatherJob"
            value={form.fatherJob}
            onChange={(event) => updateField("fatherJob", event.target.value)}
          />

          <label className="block md:col-span-2">
            <span className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <Home className="h-4 w-4 text-emerald-700" />
              آدرس منزل
            </span>
            <textarea
              value={form.homeAddress}
              onChange={(event) => updateField("homeAddress", event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </label>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <Camera className="h-4 w-4 text-emerald-700" />
              عکس پرسنلی
            </span>
            <input
              value={form.personnelPhotoUrl}
              onChange={(event) => updateField("personnelPhotoUrl", event.target.value)}
              placeholder="لینک عکس پرسنلی"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              ref={personnelInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void uploadImage(event.target.files?.[0] ?? null, "personnelPhotoUrl");
                event.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => personnelInputRef.current?.click()}
              disabled={uploadingKey === "personnelPhotoUrl"}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-70"
            >
              <ImageUp className="h-4 w-4" />
              {uploadingKey === "personnelPhotoUrl" ? "در حال آپلود..." : "آپلود عکس پرسنلی"}
            </button>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
              <Camera className="h-4 w-4 text-emerald-700" />
              عکس شناسنامه
            </span>
            <input
              value={form.idCardPhotoUrl}
              onChange={(event) => updateField("idCardPhotoUrl", event.target.value)}
              placeholder="لینک عکس شناسنامه"
              className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <input
              ref={idCardInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void uploadImage(event.target.files?.[0] ?? null, "idCardPhotoUrl");
                event.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => idCardInputRef.current?.click()}
              disabled={uploadingKey === "idCardPhotoUrl"}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-70"
            >
              <ImageUp className="h-4 w-4" />
              {uploadingKey === "idCardPhotoUrl" ? "در حال آپلود..." : "آپلود عکس شناسنامه"}
            </button>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-70"
            >
              {submitting ? "در حال ذخیره..." : "ذخیره اطلاعات پروفایل"}
            </button>
          </div>
        </form>
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </main>
  );
}
