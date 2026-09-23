import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().trim().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  age: z.coerce.number().int().min(10, "سن نامعتبر است").max(100, "سن نامعتبر است"),
  address: z.string().trim().min(5, "آدرس باید کامل‌تر باشد"),
  education: z.string().trim().min(2, "تحصیلات را وارد کنید"),
  gender: z.enum(["MALE", "FEMALE"]),
  email: z.email("ایمیل نامعتبر است"),
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
  isRegistrationOpen: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type EventInput = z.infer<typeof eventSchema>;
