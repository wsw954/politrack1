// lib/services/tracker.js
import mongoose from "mongoose";
import dbConnect from "@/config/db";
import User from "@/models/User";
import Bill from "@/models/Bill";
import { sanitizeAnnotations, isObjectId } from "@/lib/validation/annotations";

/** Ensure DB connection for any service call */
async function ensureDb() {
  await dbConnect();
}

/** Find the single tracked-bill entry for a user (lean). */
export async function getTrackedBillEntry(userId, billId) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId)) return null;

  const user = await User.findOne(
    { _id: userId, "tracker.bills.itemId": billId },
    { "tracker.bills.$": 1 }
  ).lean();

  return user?.tracker?.bills?.[0] || null;
}

/** Create minimal tracked bill if missing. Returns true if newly created or exists. */
export async function ensureTrackedBill(userId, billId) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId)) return false;

  const exists = await User.exists({
    _id: userId,
    "tracker.bills.itemId": billId,
  });
  if (exists) return true;

  const billOk = await Bill.exists({ _id: billId });
  if (!billOk) return false;

  const now = new Date();
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        "tracker.bills": {
          itemId: new mongoose.Types.ObjectId(String(billId)),
          itemType: "Bill",
          generalNotes: "",
          links: [],
          attachments: [],
          labels: [],
          provisionAnnotations: [],
          createdAt: now,
          updatedAt: now,
        },
      },
    }
  );
  return true;
}

/** -------- Bill-level annotations -------- */

export async function getBillAnnotations({ userId, billId }) {
  const tracked = await getTrackedBillEntry(userId, billId);
  if (!tracked) return null;
  return {
    generalNotes: tracked.generalNotes ?? "",
    links: tracked.links ?? [],
    attachments: tracked.attachments ?? [],
    labels: tracked.labels ?? [],
  };
}

export async function putBillAnnotations({ userId, billId, payload }) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId))
    return { ok: false, status: 400, message: "Invalid ids" };

  const ok = await ensureTrackedBill(userId, billId);
  if (!ok) return { ok: false, status: 404, message: "Bill not found" };

  const { value, errors } = sanitizeAnnotations(payload || {});
  const res = await User.updateOne(
    { _id: userId, "tracker.bills.itemId": billId },
    {
      $set: {
        "tracker.bills.$.generalNotes": value.generalNotes,
        "tracker.bills.$.links": value.links,
        "tracker.bills.$.attachments": value.attachments,
        "tracker.bills.$.labels": value.labels,
        "tracker.bills.$.updatedAt": new Date(),
      },
    }
  );

  if (!res.modifiedCount)
    return { ok: false, status: 404, message: "Tracked bill not found" };
  return { ok: true, status: 200, annotations: value, warnings: errors };
}

export async function clearBillAnnotations({ userId, billId }) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId))
    return { ok: false, status: 400, message: "Invalid ids" };
  const res = await User.updateOne(
    { _id: userId, "tracker.bills.itemId": billId },
    {
      $set: {
        "tracker.bills.$.generalNotes": "",
        "tracker.bills.$.links": [],
        "tracker.bills.$.attachments": [],
        "tracker.bills.$.labels": [],
        "tracker.bills.$.updatedAt": new Date(),
      },
    }
  );
  if (!res.modifiedCount)
    return { ok: false, status: 404, message: "Tracked bill not found" };
  return { ok: true, status: 200 };
}

/** -------- Provision-level annotations -------- */

export async function getProvisionAnnotations({ userId, billId, provId }) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId) || !isObjectId(provId))
    return null;

  const tracked = await getTrackedBillEntry(userId, billId);
  if (!tracked) return null;

  const hit = (tracked.provisionAnnotations || []).find(
    (p) => String(p.provId) === String(provId)
  );
  return hit
    ? {
        generalNotes: hit.generalNotes ?? "",
        links: hit.links ?? [],
        attachments: hit.attachments ?? [],
        labels: hit.labels ?? [],
      }
    : { generalNotes: "", links: [], attachments: [], labels: [] };
}

export async function putProvisionAnnotations({
  userId,
  billId,
  provId,
  payload,
}) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId) || !isObjectId(provId))
    return { ok: false, status: 400, message: "Invalid ids" };

  const ok = await ensureTrackedBill(userId, billId);
  if (!ok) return { ok: false, status: 404, message: "Bill not found" };

  const { value, errors } = sanitizeAnnotations(payload || {});
  const res = await User.updateOne(
    {
      _id: userId,
      "tracker.bills.itemId": billId,
      "tracker.bills.provisionAnnotations.provId": provId,
    },
    {
      $set: {
        "tracker.bills.$[bill].provisionAnnotations.$[prov].generalNotes":
          value.generalNotes,
        "tracker.bills.$[bill].provisionAnnotations.$[prov].links": value.links,
        "tracker.bills.$[bill].provisionAnnotations.$[prov].attachments":
          value.attachments,
        "tracker.bills.$[bill].provisionAnnotations.$[prov].labels":
          value.labels,
        "tracker.bills.$[bill].updatedAt": new Date(),
      },
    },
    {
      arrayFilters: [
        { "bill.itemId": new mongoose.Types.ObjectId(billId) },
        { "prov.provId": new mongoose.Types.ObjectId(provId) },
      ],
    }
  );

  if (!res.modifiedCount) {
    // push new provision annotation if it didn't exist
    await User.updateOne(
      { _id: userId, "tracker.bills.itemId": billId },
      {
        $push: {
          "tracker.bills.$.provisionAnnotations": {
            provId: new mongoose.Types.ObjectId(provId),
            ...value,
            updatedAt: new Date(),
          },
        },
        $set: { "tracker.bills.$.updatedAt": new Date() },
      }
    );
  }

  return { ok: true, status: 200, annotations: value, warnings: errors };
}

export async function clearProvisionAnnotations({ userId, billId, provId }) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId) || !isObjectId(provId))
    return { ok: false, status: 400, message: "Invalid ids" };

  const res = await User.updateOne(
    { _id: userId, "tracker.bills.itemId": billId },
    {
      $pull: {
        "tracker.bills.$.provisionAnnotations": {
          provId: new mongoose.Types.ObjectId(provId),
        },
      },
      $set: { "tracker.bills.$.updatedAt": new Date() },
    }
  );

  if (!res.modifiedCount)
    return {
      ok: false,
      status: 404,
      message: "Provision annotation not found",
    };
  return { ok: true, status: 200 };
}

/** -------- Optional index (annotated provisions list) -------- */

export async function listAnnotatedProvisionsIndexed({
  userId,
  billId,
  page = 1,
  limit = 50,
  includeMeta = false,
}) {
  await ensureDb();
  if (!isObjectId(userId) || !isObjectId(billId)) {
    return { meta: { page, limit, total: 0, pages: 1, with: [] }, data: [] };
  }

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    { $project: { tracker: 1 } },
    { $unwind: "$tracker.bills" },
    { $match: { "tracker.bills.itemId": new mongoose.Types.ObjectId(billId) } },
    {
      $project: { provisionAnnotations: "$tracker.bills.provisionAnnotations" },
    },
    { $unwind: "$provisionAnnotations" },
    {
      $project: {
        provId: "$provisionAnnotations.provId",
        hasNotes: {
          $gt: [
            {
              $strLenCP: {
                $ifNull: ["$provisionAnnotations.generalNotes", ""],
              },
            },
            0,
          ],
        },
        linksCount: { $size: { $ifNull: ["$provisionAnnotations.links", []] } },
        attachmentsCount: {
          $size: { $ifNull: ["$provisionAnnotations.attachments", []] },
        },
        labelsCount: {
          $size: { $ifNull: ["$provisionAnnotations.labels", []] },
        },
        updatedAt: { $ifNull: ["$provisionAnnotations.updatedAt", null] },
      },
    },
  ];

  if (includeMeta) {
    pipeline.push(
      {
        $lookup: {
          from: "bills",
          let: { bid: new mongoose.Types.ObjectId(billId), pid: "$provId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$bid"] } } },
            {
              $project: {
                provision: {
                  $first: {
                    $filter: {
                      input: "$provisions",
                      as: "p",
                      cond: { $eq: ["$$p._id", "$$pid"] },
                    },
                  },
                },
              },
            },
            {
              $project: {
                "provision.section_number": 1,
                "provision.heading": 1,
                "provision.type": 1,
              },
            },
          ],
          as: "_bill",
        },
      },
      {
        $addFields: {
          meta: {
            $let: {
              vars: {
                p: {
                  $ifNull: [{ $arrayElemAt: ["$_bill.provision", 0] }, null],
                },
              },
              in: {
                section_number: "$$p.section_number",
                heading: "$$p.heading",
                type: "$$p.type",
              },
            },
          },
        },
      },
      { $project: { _bill: 0 } }
    );
  }

  pipeline.push({ $sort: { updatedAt: -1, provId: 1 } });
  pipeline.push({
    $facet: {
      data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await mongoose.connection.db
    .collection("users")
    .aggregate(pipeline)
    .toArray();

  const data = result?.data ?? [];
  const total = result?.total?.[0]?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    meta: { page, limit, total, pages, with: includeMeta ? ["meta"] : [] },
    data,
  };
}
