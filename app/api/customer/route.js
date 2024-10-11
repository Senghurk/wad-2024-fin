import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Customer from "../../../models/Customer";

export async function GET() {
  await dbConnect();
  const customers = await Customer.find({});
  return NextResponse.json(customers);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const customer = await Customer.create(data);
  return NextResponse.json(customer);
}
