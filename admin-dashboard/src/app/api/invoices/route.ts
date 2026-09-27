import { NextResponse } from "next/server";

import { readDb, writeDb } from "../../lib/db";
import { InvoiceFormData } from "../../types/invoice";

export async function GET() {
  try {
    const db = await readDb();

    return NextResponse.json(db.invoices);
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch invoices",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InvoiceFormData;

    const db = await readDb();

    const newInvoice = {
      id:
        db.invoices.length > 0
          ? Math.max(...db.invoices.map((invoice) => invoice.id)) + 1
          : 1,
      ...body,
    };

    db.invoices.push(newInvoice);

    await writeDb(db);

    return NextResponse.json(newInvoice, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to create invoice",
      },
      {
        status: 500,
      },
    );
  }
}
