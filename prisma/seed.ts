import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
    },
    create: {
      firstName: "ادمین",
      lastName: "سیستم",
      age: 30,
      address: "تهران",
      education: "کارشناسی",
      gender: "MALE",
      email,
      passwordHash,
      role: "ADMIN",
      group: "A",
    },
  });

  const defaultGalleryTitle = "مشهد ۱۴۰۴";
  const defaultGalleryImages = [
    "https://masjid-portal-site.vercel.app/api/uploads/cmue3lpzl0003il04pvgztm01",
    "https://masjid-portal-site.vercel.app/api/uploads/cmue3li8n0002il046xrglwup",
    "https://masjid-portal-site.vercel.app/api/uploads/cmue3la7y0001il0483zg3sl0",
    "https://masjid-portal-site.vercel.app/api/uploads/cmue3l2y80002js0496yu03jf",
  ];

  const existingGallery = await prisma.gallery.findFirst({
    where: { title: defaultGalleryTitle },
    select: { id: true },
  });

  if (!existingGallery) {
    await prisma.gallery.create({
      data: {
        title: defaultGalleryTitle,
        coverImageUrl: defaultGalleryImages[0],
        images: {
          create: defaultGalleryImages.map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log(`Admin user is ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
