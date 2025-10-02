// scripts/addProvisionIds.mjs
import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://csa1_admin:Zellies500@cluster0.gafmcfx.mongodb.net/politrack1_db?retryWrites=true&w=majority&appName=Cluster0";
const oid = () => new mongoose.Types.ObjectId();

async function run() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI env var.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const coll = mongoose.connection.db.collection("bills");

  const cursor = coll.find({}, { projection: { _id: 1, provisions: 1 } });
  let updated = 0;

  for await (const doc of cursor) {
    const provisions = Array.isArray(doc.provisions) ? doc.provisions : [];
    let dirty = false;

    const newProvisions = provisions.map((p) => {
      const np = { ...p };
      if (!np._id) {
        np._id = oid();
        dirty = true;
      }

      const lts = Array.isArray(np.legal_text) ? np.legal_text : [];
      np.legal_text = lts.map((lt) => {
        const n = { ...lt };
        if (!n._id) {
          n._id = oid();
          dirty = true;
        }
        return n;
      });

      return np;
    });

    if (dirty) {
      await coll.updateOne(
        { _id: doc._id },
        { $set: { provisions: newProvisions } }
      );
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} bill(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
