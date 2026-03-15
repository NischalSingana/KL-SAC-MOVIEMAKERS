import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// ── Test 1: Neon DB ──────────────────────────────────────────
console.log("\n🔵 Testing Neon DB connection...");
try {
  const sql = neon(DATABASE_URL);
  const result = await sql`SELECT NOW() as time, version() as version`;
  console.log("✅ Neon DB connected!");
  console.log("   Server time:", result[0].time);
  console.log("   PostgreSQL:", result[0].version.split(" ").slice(0, 2).join(" "));
} catch (err) {
  console.error("❌ Neon DB failed:", err.message);
}

// ── Test 2: Cloudflare R2 ────────────────────────────────────
console.log("\n🟠 Testing Cloudflare R2 connection...");
try {
  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const testKey = `_connectivity-test-${Date.now()}.txt`;
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: testKey,
    Body: "KL-SAC connectivity test",
    ContentType: "text/plain",
  }));
  console.log("✅ Cloudflare R2 connected!");
  console.log(`   Test file uploaded: ${testKey}`);
  console.log(`   Bucket: ${R2_BUCKET_NAME}`);
} catch (err) {
  console.error("❌ Cloudflare R2 failed:", err.message);
  if (err.message.includes("403") || err.message.includes("Forbidden"))
    console.log("   → Check R2 API token has 'Object Read & Write' permission");
  if (err.message.includes("NoSuchBucket"))
    console.log(`   → Bucket "${R2_BUCKET_NAME}" not found — create it in Cloudflare R2 dashboard`);
}

console.log("\n✨ Done.\n");
