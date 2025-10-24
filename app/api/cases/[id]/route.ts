// app/api/cases/[id]/route.ts
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";

function isObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request, context: any) {
  // always await context.params to satisfy Next.js
  const { id } = await context.params;
  await connectDB();

  try {
    const query = isObjectId(id) ? { _id: id } : { id: parseInt(id, 10) };
    if (!isObjectId(id) && Number.isNaN(parseInt(id, 10))) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const caseItem = await Case.findOne(query);
    if (!caseItem) return Response.json({ error: "Case not found" }, { status: 404 });
    return Response.json(caseItem);
  } catch (err) {
    console.error("GET error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  const { id } = await context.params;
  await connectDB();

  try {
    const data = await request.json();

    let updatedCase;
    if (isObjectId(id)) {
      updatedCase = await Case.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } else {
      const numeric = parseInt(id, 10);
      if (Number.isNaN(numeric)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
      }
      updatedCase = await Case.findOneAndUpdate({ id: numeric }, data, {
        new: true,
        runValidators: true,
      });
    }

    if (!updatedCase) return Response.json({ error: "Case not found" }, { status: 404 });
    return Response.json(updatedCase);
  } catch (err) {
    console.error("PUT error:", err);
    return Response.json({ error: "Failed to update case" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;
  await connectDB();

  try {
    let deleted;
    if (isObjectId(id)) {
      deleted = await Case.findByIdAndDelete(id);
    } else {
      const numeric = parseInt(id, 10);
      if (Number.isNaN(numeric)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
      }
      deleted = await Case.findOneAndDelete({ id: numeric });
    }

    if (!deleted) return Response.json({ error: "Case not found" }, { status: 404 });
    return Response.json({ message: "Case deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    return Response.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
