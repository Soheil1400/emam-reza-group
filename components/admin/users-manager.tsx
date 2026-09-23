"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Snackbar } from "@/components/ui/snackbar";
import { formatFaNumber } from "@/lib/persian";

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  education: string;
  email: string;
  role: "USER" | "SUB_ADMIN" | "COMMANDER" | "CIRCLE_LEAD" | "ADMIN";
  group: "UNASSIGNED" | "A" | "B";
  groupId: string | null;
};

type GroupRow = {
  id: string;
  name: string;
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

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-3">نام</th>
              <th className="p-3">ایمیل</th>
              <th className="p-3">سن</th>
              <th className="p-3">آدرس</th>
              <th className="p-3">تحصیلات</th>
              <th className="p-3">نقش</th>
              <th className="p-3">حلقه</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-zinc-100">
                <td className="p-3">{`${user.firstName} ${user.lastName}`}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{formatFaNumber(user.age)}</td>
                <td className="p-3">{user.address}</td>
                <td className="p-3">{user.education}</td>
                <td className="p-3">
                  <form
                    action={async (fd) => {
                      await saveUser(user.id, fd);
                    }}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="role"
                      defaultValue={user.role === "SUB_ADMIN" ? "CIRCLE_LEAD" : user.role}
                      className="rounded-lg border border-zinc-300 px-2 py-1"
                    >
                      <option value="USER">کاربر</option>
                      <option value="COMMANDER">فرمانده</option>
                      <option value="CIRCLE_LEAD">سرحلقه</option>
                      <option value="ADMIN">ادمین اصلی</option>
                    </select>
                    <select
                      name="groupId"
                      defaultValue={user.groupId ?? ""}
                      className="rounded-lg border border-zinc-300 px-2 py-1"
                    >
                      <option value="">بدون حلقه</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
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
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </>
  );
}
