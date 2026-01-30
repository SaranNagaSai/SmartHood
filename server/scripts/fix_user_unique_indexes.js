/*
Fixes production DB unique index issues for User email/phone nullability.

Problem:
- Some environments have unique indexes on `users.email` and/or `users.phone` created WITHOUT sparse,
  which causes E11000 duplicate key errors for multiple documents where the value is null.

What this script does:
- Connects to MongoDB
- Drops existing `email_1` and `phone_1` indexes (if present)
- Normalizes empty-string values to null
- Re-syncs indexes from the Mongoose schema (which defines email/phone as unique + sparse)

Usage:
  node scripts/fix_user_unique_indexes.js
*/

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");

const must = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

async function main() {
    must(process.env.MONGODB_URI, "Missing MONGODB_URI in environment (.env)");

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    const indexes = await User.collection.indexes();
    console.log("Existing user indexes:");
    indexes.forEach((idx) => console.log(`- ${idx.name} unique=${!!idx.unique} sparse=${!!idx.sparse}`));

    // Normalize empty strings to null so sparse indexes behave as expected.
    await User.updateMany({ email: "" }, { $set: { email: null } });
    await User.updateMany({ phone: "" }, { $set: { phone: null } });

    // Drop non-sparse unique indexes if present.
    for (const name of ["email_1", "phone_1"]) {
        const found = indexes.find((i) => i.name === name);
        if (!found) continue;

        console.log(`Dropping index: ${name}`);
        try {
            // eslint-disable-next-line no-await-in-loop
            await User.collection.dropIndex(name);
        } catch (err) {
            console.warn(`Could not drop index ${name}: ${err.message}`);
        }
    }

    console.log("Syncing indexes from schema...");
    await User.syncIndexes();

    const after = await User.collection.indexes();
    console.log("Updated user indexes:");
    after.forEach((idx) => console.log(`- ${idx.name} unique=${!!idx.unique} sparse=${!!idx.sparse}`));

    console.log("Done.");
}

main()
    .catch((err) => {
        console.error("Index fix failed:", err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await mongoose.disconnect();
        } catch {
            // ignore
        }
    });
