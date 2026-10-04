import { NextResponse } from "next/server";

import { readDb, writeDb } from "../../../lib/db";
import { CustomerFormData } from "../../../types/customer";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const customerId = Number(id);

    const db = await readDb();

    const customer = db.customers.find((item) => item.id === customerId);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const customerId = Number(id);

    const body = (await request.json()) as CustomerFormData;

    const db = await readDb();

    const customerIndex = db.customers.findIndex(
      (item) => item.id === customerId,
    );

    if (customerIndex === -1) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    const updatedCustomer = {
      ...db.customers[customerIndex],
      ...body,
    };

    db.customers[customerIndex] = updatedCustomer;

    await writeDb(db);

    return NextResponse.json(updatedCustomer);
  } catch {
    return NextResponse.json(
      { message: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const customerId = Number(id);

    const db = await readDb();

    const customerIndex = db.customers.findIndex(
      (item) => item.id === customerId,
    );

    if (customerIndex === -1) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    const deletedCustomer = db.customers[customerIndex];

    db.customers.splice(customerIndex, 1);

    await writeDb(db);

    return NextResponse.json(deletedCustomer);
  } catch {
    return NextResponse.json(
      { message: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
