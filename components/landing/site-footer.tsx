import { BookOpenText } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-emerald-900/20 bg-emerald-950 py-10 text-emerald-50">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h3 className="inline-flex items-center gap-2 text-xl font-bold">
          <BookOpenText className="h-5 w-5" />
          گروه فرهنگی امام رضا
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-100">
          با الهام از معماری و هویت اسلامی، تلاش می‌کنیم محیطی آرام، امیدبخش و منظم برای ارتباط
          بهتر اعضای مسجد، برنامه‌ها و محتوای آموزشی فراهم کنیم.
        </p>
      </div>
    </footer>
  );
}
