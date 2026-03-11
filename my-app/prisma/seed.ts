import { PrismaClient } from "@prisma/client/extension";
import bcrypt from "bcryptjs";

// Use direct import for seed script
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient: PC } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaNeon } = require("@prisma/adapter-neon");

let prisma: PrismaClient;

if (process.env.DATABASE_URL) {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  prisma = new PC({ adapter }) as PrismaClient;
} else {
  prisma = new PC() as PrismaClient;
}

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@klsac.edu" },
    update: {},
    create: {
      name: "Club Admin",
      email: process.env.ADMIN_EMAIL || "admin@klsac.edu",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  const equipmentItems = [
    { name: "Sony FX3 Cinema Camera", model: "FX3", serialNumber: "SFX3-001", status: "AVAILABLE" },
    { name: "DJI Ronin 4D Stabilizer", model: "Ronin 4D", serialNumber: "DJI-R4D-001", status: "AVAILABLE" },
    { name: "Rode VideoMic Pro+", model: "VideoMic Pro+", serialNumber: "RODE-VMP-001", status: "AVAILABLE" },
    { name: "Aputure 300d MkII", model: "300d MkII", serialNumber: "APU-300D-001", status: "AVAILABLE" },
    { name: "Blackmagic Pocket 6K", model: "BMPCC 6K", serialNumber: "BMP-6K-001", status: "AVAILABLE" },
    { name: "Sennheiser MKH 416", model: "MKH 416", serialNumber: "SENH-416-001", status: "AVAILABLE" },
    { name: "DJI Mini 3 Pro", model: "Mini 3 Pro", serialNumber: "DJI-M3P-001", status: "AVAILABLE" },
    { name: "Manfrotto MT055 Tripod", model: "MT055", serialNumber: "MAN-MT055-001", status: "AVAILABLE" },
  ] as const;

  for (const item of equipmentItems) {
    await prisma.equipment.upsert({
      where: { serialNumber: item.serialNumber },
      update: {},
      create: item,
    });
  }

  console.log("✅ Equipment seeded:", equipmentItems.length, "items");

  await prisma.project.upsert({
    where: { id: "clb0000000000000000000001" },
    update: {},
    create: {
      id: "clb0000000000000000000001",
      title: "Welcome Film",
      storySummary: "The inaugural short film by the KL-SAC Movie Makers Club",
      status: "COMPLETED",
      type: "SHORT_FILM",
    },
  });

  console.log("✅ Sample project created");
  console.log("🎬 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
