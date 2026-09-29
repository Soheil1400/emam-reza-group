"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ImageUrlInput } from "@/components/admin/image-url-input";
import { ImageUrlPreview } from "@/components/ui/image-url-preview";
import { Snackbar } from "@/components/ui/snackbar";

type SectionType = "TEXT" | "TEXT_IMAGE";

type SectionInput = {
  type: SectionType;
  title: string;
  text: string;
  imageUrl?: string;
};

type InitialData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  isPublished: boolean;
  sections: SectionInput[];
} | null;

const defaultSection: SectionInput = {
  type: "TEXT",
  title: "",
  text: "",
  imageUrl: "",
};

export function BlogBuilderForm({ initialData }: { initialData: InitialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [sections, setSections] = useState<SectionInput[]>(
    initialData?.sections.length ? initialData.sections : [defaultSection],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    kind: "success" | "error" | "info";
  }>({ show: false, message: "", kind: "info" });

  const isEditMode = useMemo(() => Boolean(initialData?.id), [initialData?.id]);

  function addSection() {
    setSections((prev) => [...prev, { ...defaultSection }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  function updateSection(index: number, nextValue: Partial<SectionInput>) {
    setSections((prev) =>
      prev.map((section, currentIndex) =>
        currentIndex === index ? { ...section, ...nextValue } : section,
      ),
    );
  }

  async function submit() {
    setError("");
    setLoading(true);
    const payload = { title, slug, excerpt, isPublished, sections };

    const url = isEditMode ? `/api/admin/blogs/${initialData?.id}` : "/api/admin/blogs";
    const method = isEditMode ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "ذخیره روایت ناموفق بود.");
      setSnackbar({
        show: true,
        message: data.message ?? "ذخیره روایت ناموفق بود.",
        kind: "error",
      });
      setTimeout(() => setSnackbar({ show: false, message: "", kind: "info" }), 3000);
      return;
    }

    setSnackbar({
      show: true,
      message: "روایت با موفقیت ذخیره شد",
      kind: "success",
    });
    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">{isEditMode ? "ویرایش روایت" : "ایجاد روایت جدید"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">عنوان</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">اسلاگ</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium">خلاصه</span>
            <textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
            <span className="text-sm">انتشار فوری</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">سکشن {index + 1}</h3>
              {sections.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="rounded-lg border border-rose-600 px-2 py-1 text-sm text-rose-600"
                >
                  حذف سکشن
                </button>
              ) : null}
            </div>

            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">نوع سکشن</span>
                <select
                  value={section.type}
                  onChange={(event) =>
                    updateSection(index, { type: event.target.value as SectionType })
                  }
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                >
                  <option value="TEXT">فقط متن</option>
                  <option value="TEXT_IMAGE">متن + تصویر</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">عنوان سکشن</span>
                <input
                  value={section.title}
                  onChange={(event) => updateSection(index, { title: event.target.value })}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">متن</span>
                <textarea
                  value={section.text}
                  onChange={(event) => updateSection(index, { text: event.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
              {section.type === "TEXT_IMAGE" ? (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">لینک تصویر</span>
                  <ImageUrlInput
                    value={section.imageUrl ?? ""}
                    onChange={(next) => updateSection(index, { imageUrl: next })}
                    placeholder="لینک تصویر سکشن"
                    uploadNamePrefix={`blog-section-${index + 1}`}
                  />
                  <ImageUrlPreview url={section.imageUrl} alt={section.title || `سکشن ${index + 1}`} />
                </label>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addSection}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
        >
          افزودن سکشن جدید
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
        >
          {loading ? "در حال ذخیره..." : "ذخیره روایت"}
        </button>
      </div>
      <Snackbar show={snackbar.show} message={snackbar.message} kind={snackbar.kind} />
    </section>
  );
}
