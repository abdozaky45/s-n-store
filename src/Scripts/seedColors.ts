import mongoose, { connect } from "mongoose";
import "dotenv/config";
import dns from "dns";

// Match the app's DB setup: the local resolver may refuse Atlas SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import ColorModel from "../Model/Color/ColorModel";

/**
 * Seed + (re)order the color list.
 *
 * The Color model has no `order` field, so ordering is driven by `createdAt`
 * (the `getAllColors` service sorts by `createdAt: 1`). The COLORS array below
 * is the single source of truth for the order: each color gets an explicit,
 * strictly-increasing `createdAt` (BASE + index seconds) written via `$set`,
 * so re-running this script re-applies the array order to existing docs too.
 *
 * Order = by importance (lingerie): skin tones + black/white first, then the
 * core neutrals & classics, then fashion shades and less-requested colors.
 *
 * Upsert is keyed on `hex` (findOneAndUpdate, upsert:true) — re-runs refresh an
 * existing color instead of duplicating it, and existing data is never dropped.
 *
 * Notes on the data:
 *   - "Multi" (#MULTICOLOR) was removed from the catalog (deleted manually).
 *   - "Pink Nude" (#EDB8C5) dropped earlier as a near-duplicate of Pink (#F0B8C6).
 *   - ar names fixed earlier: بنفسجي غامق (Dark Purple), برجندي (Burgundy), موف (Mauve).
 *
 * Run with:  npx ts-node src/Scripts/seedColors.ts
 */
type Color = { name: { ar: string; en: string }; hex: string };

const COLORS: Color[] = [
  // Core: skin tones + black/white (top sellers in lingerie)
  { name: { ar: "أسود", en: "Black" }, hex: "#000000" },
  { name: { ar: "أبيض", en: "White" }, hex: "#FAFAFA" },
  { name: { ar: "نود", en: "Nude" }, hex: "#E6CBB5" },
  { name: { ar: "بيج", en: "Beige" }, hex: "#EBEACF" },
  { name: { ar: "طبيعي", en: "Natural" }, hex: "#E6E4DA" },
  { name: { ar: "كحلي", en: "Navy" }, hex: "#010160" },
  { name: { ar: "رمادي", en: "Grey" }, hex: "#9A9C9D" },
  // Classics
  { name: { ar: "أحمر", en: "Red" }, hex: "#B81529" },
  { name: { ar: "وردي", en: "Pink" }, hex: "#F0B8C6" },
  { name: { ar: "بودري", en: "Powder" }, hex: "#F4CCD3" },
  { name: { ar: "برجندي", en: "Burgundy" }, hex: "#6E011A" },
  { name: { ar: "خمري", en: "Wine" }, hex: "#602B30" },
  { name: { ar: "بني", en: "Brown" }, hex: "#956852" },
  { name: { ar: "بني فاتح", en: "Light Brown" }, hex: "#D0AF6E" },
  { name: { ar: "ذهبي", en: "Gold" }, hex: "#C8A96F" },
  // Fashion shades
  { name: { ar: "موف", en: "Mauve" }, hex: "#DAB0F4" },
  { name: { ar: "ليلكي", en: "Lilac" }, hex: "#C1A3BD" },
  { name: { ar: "بنفسجي", en: "Purple" }, hex: "#BAA5C0" },
  { name: { ar: "بنفسجي غامق", en: "Dark Purple" }, hex: "#88307C" },
  { name: { ar: "خوخي", en: "Peach" }, hex: "#F7C5A0" },
  { name: { ar: "مرجاني", en: "Coral" }, hex: "#FC7E56" },
  { name: { ar: "أزرق", en: "Blue" }, hex: "#162558" },
  { name: { ar: "تيل", en: "Teal" }, hex: "#027172" },
  { name: { ar: "فيروزي", en: "Turquoise" }, hex: "#46DAC9" },
  { name: { ar: "نعناعي", en: "Mint" }, hex: "#A1F89D" },
  { name: { ar: "أخضر", en: "Green" }, hex: "#777735" },
  { name: { ar: "أخضر زيتوني", en: "Olive Green" }, hex: "#73764B" },
  { name: { ar: "زيتي", en: "Olive" }, hex: "#827A00" },
  { name: { ar: "أصفر", en: "Yellow" }, hex: "#F5DB5F" },
  { name: { ar: "برتقالي", en: "Orange" }, hex: "#F5A525" },
  { name: { ar: "فضي", en: "Silver" }, hex: "#BBBBB9" },
  { name: { ar: "قرفة", en: "Cinnamon" }, hex: "#CB661F" },
];

const run = async () => {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not set in the environment. Aborting.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", false);
    await connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    console.log(`DB Connected. Seeding/ordering ${COLORS.length} colors...\n`);

    const BASE = new Date("2026-06-01T00:00:00.000Z").getTime();

    // Upsert keyed on `hex` via the native collection, which bypasses Mongoose's
    // schema layer. This matters because `timestamps: true` marks `createdAt`
    // immutable, so a Mongoose `$set` on `createdAt` is silently dropped — the
    // native driver has no such rule, so the array order (createdAt = BASE +
    // index) is reliably re-applied to existing docs on every run.
    const ops = COLORS.map((c, index) => {
      const ts = new Date(BASE + index * 1000);
      return {
        updateOne: {
          filter: { hex: c.hex },
          update: { $set: { name: c.name, hex: c.hex, createdAt: ts, updatedAt: ts } },
          upsert: true,
        },
      };
    });

    const result = await ColorModel.collection.bulkWrite(ops, { ordered: true });
    console.log(
      `Done. inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, total: ${COLORS.length}\n`
    );

    // Read back in display order to confirm.
    const ordered = await ColorModel.find().sort({ createdAt: 1 }).select("name hex").lean();
    console.log(`Final display order (${ordered.length}):`);
    ordered.forEach((c: any, i) => {
      console.log(`${String(i + 1).padStart(2)}  ${String(c.name?.en ?? "").padEnd(14)} ${String(c.name?.ar ?? "").padEnd(14)} ${c.hex}`);
    });
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nDB Disconnected.");
  }
};

run();
