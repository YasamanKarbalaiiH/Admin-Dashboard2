import { NextResponse } from "next/server";

import { readDb, writeDb } from "../../../lib/db";
import { InvoiceFormData } from "../../../types/invoice";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const invoiceId = Number(id);

    const db = await readDb();

    const invoice = db.invoices.find((item) => item.id === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        {
          message: "Invoice not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch invoice",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const invoiceId = Number(id);

    const body = (await request.json()) as InvoiceFormData;

    const db = await readDb();

    const invoiceIndex = db.invoices.findIndex((item) => item.id === invoiceId);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        {
          message: "Invoice not found",
        },
        {
          status: 404,
        },
      );
    }

    const updatedInvoice = {
      ...db.invoices[invoiceIndex],
      ...body,
    };

    db.invoices[invoiceIndex] = updatedInvoice;

    await writeDb(db);

    return NextResponse.json(updatedInvoice);
  } catch {
    return NextResponse.json(
      {
        message: "Failed to update invoice",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const invoiceId = Number(id);

    const db = await readDb();

    const invoiceIndex = db.invoices.findIndex((item) => item.id === invoiceId);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        {
          message: "Invoice not found",
        },
        {
          status: 404,
        },
      );
    }

    const deletedInvoice = db.invoices[invoiceIndex];

    db.invoices.splice(invoiceIndex, 1);

    await writeDb(db);

    return NextResponse.json(deletedInvoice);
  } catch {
    return NextResponse.json(
      {
        message: "Failed to delete invoice",
      },
      {
        status: 500,
      },
    );
  }
}
