import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "./lib/db";

async function main() {
  const eq = await prisma.equipment.findMany({
    select: { name: true, quantity: true, model: true },
    orderBy: { name: "asc" }
  });
  console.log(JSON.stringify(eq, null, 2));
  process.exit(0);
}
main();
