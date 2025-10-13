// addSubdocIdsForCompass.mjs
import { ObjectId } from "mongodb";
import fs from "node:fs";

function oid() {
  return { $oid: new ObjectId().toHexString() };
}

function ensureSubIds(bill) {
  if (Array.isArray(bill.provisions)) {
    bill.provisions = bill.provisions.map((p) => {
      const out = { ...p };
      if (!out._id) out._id = oid();

      if (Array.isArray(out.legal_text)) {
        out.legal_text = out.legal_text.map((t) => {
          const item = { ...t };
          if (!item._id) item._id = oid();
          return item;
        });
      }

      return out;
    });
  }
  return bill;
}

const inPath = process.argv[2];
const outPath =
  process.argv[3] || inPath.replace(/\.json$/i, ".withSubIds.json");

const bill = JSON.parse(fs.readFileSync(inPath, "utf8"));
const output = ensureSubIds(bill);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

console.log("Wrote:", outPath);
