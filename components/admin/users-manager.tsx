"use client";

import { ChevronDown, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";
import { formatFaNumber } from "@/lib/persian";

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode: string | null;
  educationStage: "STUDENT" | "UNIVERSITY_STUDENT" | "EMPLOYED" | null;
  fatherName: string | null;
  birthDateJalali: string | null;
  birthProvince: string | null;
  currentCircle: string | null;
  personnelPhotoUrl: string | null;
  idCardPhotoUrl: string | null;
  discoverSource: "FAMILY" | "ENVIRONMENTAL_ADS" | "DIRECT_INVITE" | null;
  mobile: string | null;
  motherMobile: string | null;
  fatherMobile: string | null;
  homePhone: string | null;
  fatherJob: string | null;
  homeAddress: string | null;
  age: number;
  address: string;
  education: string;
  gender: "MALE" | "FEMALE";
  email: string;
  role: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "EVENT_MANAGER" | "ADMIN";
  group: "UNASSIGNED" | "A" | "B";
  groupId: string | null;
};

type GroupRow = {
  id: string;
  name: string;
};

const educationStageLabels: Record<NonNullable<UserRow["educationStage"]>, string> = {
  STUDENT: "دانش آموز",
  UNIVERSITY_STUDENT: "دانشجو",
  EMPLOYED: "شاغل",
};

const discoverSourceLabels: Record<NonNullable<UserRow["discoverSource"]>, string> = {
  FAMILY: "از طریق خانواده",
  ENVIRONMENTAL_ADS: "از طریق تبلیغات محیطی",
  DIRECT_INVITE: "از طریق دعوت مستقیم عضو گروه",
};

export function UsersManager({
  users,
  groups,
}: {
  users: UserRow[];
  groups: GroupRow[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeProfileUser, setActiveProfileUser] = useState<UserRow | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  function showMessage(kind: "success" | "error" | "info", message: string) {
    setSnackbar({ show: true, kind, message });
    setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 3000);
  }

  async function saveUser(userId: string, formData: FormData) {
    setPendingId(userId);
    const payload = {
      role: String(formData.get("role") ?? "USER"),
      group: "UNASSIGNED",
      groupId: String(formData.get("groupId") ?? "") || null,
    };

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { message?: string };
    setPendingId(null);

    if (!response.ok) {
      showMessage("error", data.message ?? "بروزرسانی ناموفق بود");
      return;
    }

    showMessage("success", "کاربر بروزرسانی شد");
    router.refresh();
  }

  async function deleteUser(userId: string) {
    setPendingId(userId);
    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    setPendingId(null);

    if (!response.ok) {
      showMessage("error", data.message ?? "حذف کاربر ناموفق بود");
      return;
    }

    showMessage("success", "کاربر حذف شد");
    router.refresh();
  }

  function showField(value: string | null | undefined) {
    if (!value || value.trim() === "") return "ثبت نشده";
    return value;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-3">نام</th>
              <th className="p-3">ایمیل یا شماره همراه</th>
              <th className="p-3">سن</th>
              <th className="p-3">نقش</th>
              <th className="p-3">حلقه</th>
              <th className="p-3">پروفایل کاربر</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-100">
                <td className="p-3">{`${user.firstName} ${user.lastName}`}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{formatFaNumber(user.age)}</td>
                <td className="p-3">
                  <form
                    action={async (fd) => {
                      await saveUser(user.id, fd);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative">
                      <select
                        name="role"
                        defaultValue={user.role === "SUB_ADMIN" ? "CIRCLE_LEAD" : user.role}
                        className="appearance-none rounded-lg border border-zinc-300 py-1 pr-2 pl-7"
                      >
                        <option value="USER">کاربر</option>
                        <option value="COMMANDER">فرمانده</option>
                        <option value="CIRCLE_LEAD">سرحلقه</option>
                        <option value="EVENT_MANAGER">مسئول رویداد</option>
                        <option value="ADMIN">ادمین اصلی</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    </div>
                    <div className="relative">
                      <select
                        name="groupId"
                        defaultValue={user.groupId ?? ""}
                        className="appearance-none rounded-lg border border-zinc-300 py-1 pr-2 pl-7"
                      >
                        <option value="">بدون حلقه</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    </div>
                    <button
                      disabled={pendingId === user.id}
                      className="rounded-lg border border-emerald-700 px-2 py-1 text-emerald-700 disabled:opacity-60"
                    >
                      {pendingId === user.id ? "در حال ذخیره..." : "ذخیره"}
                    </button>
                  </form>
                </td>
                <td className="p-3">{groups.find((group) => group.id === user.groupId)?.name ?? "بدون حلقه"}</td>
                <td className="p-3">
                  <button
                    onClick={() => setActiveProfileUser(user)}
                    className="rounded-lg border border-zinc-400 px-2 py-1 text-zinc-700"
                  >
                    مشاهده
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={pendingId === user.id}
                    className="rounded-lg border border-rose-600 px-2 py-1 text-rose-600 disabled:opacity-60"
                  >
                    {pendingId === user.id ? "..." : "حذف"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeProfileUser ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setActiveProfileUser(null)}
            className="absolute inset-0 bg-black/40"
            aria-label="بستن پنجره مشخصات کاربر"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-xl bg-white p-4 shadow-2xl md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">پروفایل کاربر</h3>
              <button
                type="button"
                onClick={() => setActiveProfileUser(null)}
                className="rounded-lg border border-zinc-300 p-1.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ProfileDetails user={activeProfileUser} showField={showField} />
          </div>

          <div className="absolute top-1/2 left-1/2 hidden w-[min(780px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-2xl md:block">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">پروفایل کاربر</h3>
              <button
                type="button"
                onClick={() => setActiveProfileUser(null)}
                className="rounded-lg border border-zinc-300 p-1.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[72vh] overflow-y-auto pl-1">
              <ProfileDetails user={activeProfileUser} showField={showField} />
            </div>
          </div>
        </div>
      ) : null}

      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </>
  );
}

function ProfileDetails({
  user,
  showField,
}: {
  user: UserRow;
  showField: (value: string | null | undefined) => string;
}) {
  const details: Array<{ label: string; value: string }> = [
    { label: "نام", value: `${user.firstName} ${user.lastName}` },
    { label: "ایمیل یا شماره همراه", value: user.email },
    { label: "کد ملی", value: showField(user.nationalCode) },
    { label: "سن", value: formatFaNumber(user.age) },
    { label: "جنسیت", value: user.gender === "MALE" ? "آقا" : "خانم" },
    { label: "مقطع تحصیلی", value: user.educationStage ? educationStageLabels[user.educationStage] : "ثبت نشده" },
    { label: "تحصیلات قدیمی", value: showField(user.education) },
    { label: "نام پدر", value: showField(user.fatherName) },
    { label: "تاریخ تولد شمسی", value: showField(user.birthDateJalali) },
    { label: "استان محل تولد", value: showField(user.birthProvince) },
    { label: "حلقه فعلی", value: showField(user.currentCircle) },
    { label: "روش آشنایی", value: user.discoverSource ? discoverSourceLabels[user.discoverSource] : "ثبت نشده" },
    { label: "شماره موبایل", value: showField(user.mobile) },
    { label: "شماره همراه مادر", value: showField(user.motherMobile) },
    { label: "شماره همراه پدر", value: showField(user.fatherMobile) },
    { label: "تلفن منزل", value: showField(user.homePhone) },
    { label: "شغل پدر", value: showField(user.fatherJob) },
    { label: "آدرس منزل", value: showField(user.homeAddress) },
    { label: "آدرس قدیمی", value: showField(user.address) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {details.map((item) => (
          <div key={item.label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-500">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ProfileImageCard label="عکس پرسنلی" url={user.personnelPhotoUrl} />
        <ProfileImageCard label="عکس شناسنامه" url={user.idCardPhotoUrl} />
      </div>
    </div>
  );
}

function ProfileImageCard({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          مشاهده تصویر
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : (
        <p className="mt-2 text-sm text-zinc-700">ثبت نشده</p>
      )}
    </div>
  );
}
