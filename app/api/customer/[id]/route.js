import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Customer from "../../../../models/Customer";

export async function GET(request, { params }) {
  await dbConnect();
  const customer = await Customer.findById(params.id);
  if (!customer)
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const data = await request.json();
  const customer = await Customer.findByIdAndUpdate(params.id, data, {
    new: true,
  });
  if (!customer)
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const customer = await Customer.findByIdAndDelete(params.id);
  if (!customer)
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ message: "Customer deleted successfully" });
}
