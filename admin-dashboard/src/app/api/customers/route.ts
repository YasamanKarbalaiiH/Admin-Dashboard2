import { NextResponse } from "next/server";

import { readDb, writeDb } from "../../lib/db";
import { CustomerFormData } from "../../types/customer";

export async function GET() {
  try {
    const db = await readDb();

    return NextResponse.json(db.customers);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CustomerFormData;

    const db = await readDb();

    const newCustomer = {
      id:
        db.customers.length > 0
          ? Math.max(...db.customers.map((customer) => customer.id)) + 1
          : 1,
      ...body,
      createdAt: new Date().toISOString().split("T")[0],
    };

    db.customers.push(newCustomer);

    await writeDb(db);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 },
    );
  }
}
