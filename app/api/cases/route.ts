import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";

export async function GET() {
  await connectDB();
  const cases = await Case.find();
  return Response.json(cases);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const newCase = await Case.create(data);
  return Response.json(newCase, { status: 201 });
}
