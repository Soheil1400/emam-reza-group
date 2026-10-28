import { BookOpenText, Camera, MapPin, Phone, Send } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-emerald-900/20 bg-emerald-950 py-6 text-emerald-50 md:mt-10 md:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 md:grid-cols-2 md:gap-8">
        <h3 className="inline-flex items-center gap-2 text-base font-bold md:text-xl">
          <BookOpenText className="h-5 w-5" />
          گروه فرهنگی امام رضا
        </h3>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-emerald-100 md:text-sm md:leading-7">
          گروه فرهنگی امام رضا (ع) از سال ۱۳۹۲ به همت گروهی از مربیان و فرهیختگان دغدغه مند با هدف تعلیم و تربیت جوانان و نوجوانان توحیدی و ولایی در خدمت جامعه و انقلاب اسلامی  تاسس شد
        </p>
        <div className="mt-4 space-y-3 text-xs text-emerald-100 md:text-sm">
          <h4 className="text-sm font-semibold text-emerald-50 md:text-base">راه‌های ارتباطی</h4>
          <p className="flex items-start gap-2 leading-7">
            <MapPin className="mt-1 h-4 w-4 shrink-0" />
            <span>
              تهران میدان شهدا خیابان پیروزی خیابان شکوفه پیاده رو امیرکبیر سالن شهید آرمان
              علیوردی
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <a href="tel:09128365977" className="transition hover:text-emerald-300">
              09128365977
            </a>
            <span>|</span>
            <a href="tel:09109075591" className="transition hover:text-emerald-300">
              09109075591
            </a>
          </div>
          <a
            href="https://t.me/Gpemamreza"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-emerald-300"
          >
            <Send className="h-4 w-4 shrink-0" />
            <span dir="ltr">@gpemamreza</span>
            <span className="text-emerald-200">(تلگرام)</span>
          </a>
          <a
            href="https://www.instagram.com/gpemamreza?exln=ZzFzMXkxcW1uMWV3"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-emerald-300"
          >
            <Camera className="h-4 w-4 shrink-0" />
            <span className="text-emerald-200">اینستاگرام</span>
          </a>
          <a
            href="https://eitaa.com/Gpemamreza"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-emerald-300"
          >
            <Send className="h-4 w-4 shrink-0" />
            <span className="text-emerald-200">ایتا</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
