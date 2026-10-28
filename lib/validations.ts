import { z } from "zod";
import { isValidIdentifier, normalizeIdentifier } from "@/lib/identity";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().trim().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  age: z.coerce.number().int().min(10, "سن نامعتبر است").max(100, "سن نامعتبر است").default(18),
  address: z.string().trim().min(5, "آدرس باید کامل‌تر باشد").default("تکمیل نشده"),
  education: z.string().trim().min(2, "تحصیلات را وارد کنید").default("تکمیل نشده"),
  gender: z.enum(["MALE", "FEMALE"]),
  identifier: z
    .string()
    .trim()
    .min(5, "ایمیل یا شماره همراه را وارد کنید")
    .refine((value) => isValidIdentifier(value), {
      message: "ایمیل یا شماره همراه نامعتبر است",
    })
    .transform((value) => normalizeIdentifier(value)),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(100, "رمز عبور بیش از حد طولانی است"),
});

export const sectionSchema = z.object({
  type: z.enum(["TEXT", "TEXT_IMAGE"]),
  title: z.string().trim().min(2, "عنوان سکشن الزامی است"),
  text: z.string().trim().min(10, "متن سکشن کوتاه است"),
  imageUrl: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return undefined;
      }
      return value;
    },
    z.string().url("لینک تصویر نامعتبر است").optional(),
  ),
}).superRefine((value, ctx) => {
  if (value.type === "TEXT_IMAGE" && !value.imageUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["imageUrl"],
      message: "برای سکشن متن + تصویر، لینک تصویر الزامی است",
    });
  }
});

export const blogSchema = z.object({
  title: z.string().trim().min(5, "عنوان حداقل ۵ کاراکتر باشد"),
  slug: z
    .string()
    .trim()
    .min(3, "اسلاگ حداقل ۳ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف انگلیسی کوچک، عدد و -"),
  excerpt: z.string().trim().max(280, "خلاصه باید کوتاه‌تر باشد").optional(),
  isPublished: z.boolean().default(false),
  sections: z.array(sectionSchema).min(1, "حداقل یک سکشن لازم است"),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3, "عنوان رویداد کوتاه است"),
  imageUrl: z.string().url("لینک تصویر رویداد نامعتبر است"),
  description: z.string().trim().min(10, "توضیحات رویداد کوتاه است"),
  location: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().trim().min(2, "مکان رویداد کوتاه است").optional(),
  ),
  eventTime: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.coerce.date({ error: "زمان رویداد نامعتبر است" }).optional(),
  ),
  isRegistrationOpen: z.boolean().default(true),
});

export const eventUpdateSchema = eventSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "حداقل یک فیلد برای بروزرسانی لازم است",
);

export const gallerySchema = z.object({
  title: z.string().trim().min(2, "عنوان گالری کوتاه است"),
  coverImageUrl: z.string().url("لینک کاور نامعتبر است"),
  images: z
    .array(z.string().url("لینک عکس نامعتبر است"))
    .min(1, "حداقل یک عکس برای گالری لازم است"),
});

export const galleryUpdateSchema = gallerySchema.partial().extend({
  images: z.array(z.string().url("لینک عکس نامعتبر است")).optional(),
}).refine((value) => Object.keys(value).length > 0, "حداقل یک فیلد برای بروزرسانی لازم است");

export const homeBannerSchema = z.object({
  title: z.string().trim().min(2, "عنوان بنر کوتاه است"),
  imageUrl: z.string().url("لینک تصویر بنر نامعتبر است"),
  sortOrder: z.coerce.number().int().min(0, "ترتیب نمایش نامعتبر است").default(0),
  isActive: z.boolean().default(true),
});

export const homeBannerUpdateSchema = homeBannerSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "حداقل یک فیلد برای بروزرسانی لازم است",
);

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().trim().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  nationalCode: z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد"),
  educationStage: z.enum(["STUDENT", "UNIVERSITY_STUDENT", "EMPLOYED"]),
  fatherName: z.string().trim().min(2, "نام پدر الزامی است"),
  birthDateJalali: z
    .string()
    .trim()
    .regex(/^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/, "تاریخ تولد شمسی نامعتبر است"),
  birthProvince: z.string().trim().min(2, "استان محل تولد را وارد کنید"),
  currentCircle: z.string().trim().min(2, "نام حلقه فعلی را وارد کنید"),
  personnelPhotoUrl: z.string().url("آدرس عکس پرسنلی نامعتبر است"),
  idCardPhotoUrl: z.string().url("آدرس عکس شناسنامه نامعتبر است"),
  discoverSource: z.enum(["FAMILY", "ENVIRONMENTAL_ADS", "DIRECT_INVITE"]),
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل نامعتبر است"),
  motherMobile: z.string().regex(/^09\d{9}$/, "شماره همراه مادر نامعتبر است"),
  fatherMobile: z.string().regex(/^09\d{9}$/, "شماره همراه پدر نامعتبر است"),
  homePhone: z.string().regex(/^0\d{10}$/, "شماره تلفن منزل نامعتبر است"),
  fatherJob: z.string().trim().min(2, "شغل پدر را وارد کنید"),
  homeAddress: z.string().trim().min(10, "آدرس منزل باید کامل‌تر باشد"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
export type HomeBannerInput = z.infer<typeof homeBannerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
