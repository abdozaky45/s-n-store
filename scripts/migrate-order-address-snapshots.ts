/**
 * One-time migration: repoint every existing order's `customerInfo` at an
 * immutable snapshot copy of the address, so later edits/deletes of the live
 * address can't rewrite or break order history.
 *
 * - Orders sharing the same live address share one snapshot (created once).
 * - Orders already pointing at a snapshot are skipped (safe to re-run).
 * - Orders whose address was already hard-deleted are reported and left as-is
 *   (the data is gone — nothing to snapshot).
 *
 * Run (uses DB_URL from .env):
 *   npx ts-node scripts/migrate-order-address-snapshots.ts            # dry run
 *   npx ts-node scripts/migrate-order-address-snapshots.ts --apply   # write
 */
import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";
import { Types } from "mongoose";

// Same workaround as src/DbSetup/DbConfig.ts: local ISP DNS fails the SRV
// lookup Atlas connection strings need, so resolve via public DNS instead.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import OrderModel from "../src/Model/Order/OrderModel";
import CustomerInfoModel from "../src/Model/User/Customer/CustomerInfoModel";

const APPLY = process.argv.includes("--apply");

async function main() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error("DB_URL is not set");
  mongoose.set("strictQuery", false);
  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected. Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);

  // live customerInfo _id -> snapshot _id (one snapshot per live address)
  const snapshotByInfoId = new Map<string, Types.ObjectId>();
  let migrated = 0;
  let alreadySnapshot = 0;
  const orphaned: string[] = [];

  const cursor = OrderModel.find({}, { orderNumber: 1, customerInfo: 1 }).cursor();
  for await (const order of cursor) {
    const infoId = order.customerInfo?.toString();
    if (!infoId) {
      orphaned.push(order.orderNumber);
      continue;
    }
    const info = await CustomerInfoModel.findById(infoId).lean();
    if (!info) {
      orphaned.push(order.orderNumber);
      continue;
    }
    if (info.isOrderSnapshot) {
      alreadySnapshot++;
      continue;
    }

    let snapshotId = snapshotByInfoId.get(infoId);
    if (!snapshotId) {
      if (APPLY) {
        const snapshot = await CustomerInfoModel.create({
          customer: info.customer,
          country: info.country,
          firstName: info.firstName,
          lastName: info.lastName,
          address: info.address,
          apartmentSuite: info.apartmentSuite,
          shipping: info.shipping,
          postalCode: info.postalCode,
          additionalPhone: info.additionalPhone,
          email: info.email,
          isOrderSnapshot: true,
        });
        snapshotId = snapshot._id;
      } else {
        snapshotId = new Types.ObjectId(); // placeholder for dry-run counting
      }
      snapshotByInfoId.set(infoId, snapshotId);
    }

    if (APPLY) {
      await OrderModel.updateOne({ _id: order._id }, { $set: { customerInfo: snapshotId } });
    }
    migrated++;
  }

  console.log(`Orders migrated:          ${migrated}`);
  console.log(`Snapshots created:        ${snapshotByInfoId.size}`);
  console.log(`Already snapshotted:      ${alreadySnapshot}`);
  console.log(`Orphaned (address gone):  ${orphaned.length}`);
  if (orphaned.length) console.log(`  -> ${orphaned.join(", ")}`);
  if (!APPLY) console.log("Dry run only — re-run with --apply to write changes.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
