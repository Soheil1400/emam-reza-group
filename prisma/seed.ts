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
