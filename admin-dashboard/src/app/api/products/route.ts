import { NextResponse } from "next/server";

import { readDb, writeDb } from "../../lib/db";
import { ProductFormData } from "../../types/product";

export async function GET() {
  try {
    const db = await readDb();

    return NextResponse.json(db.products);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductFormData;

    const db = await readDb();

    const newProduct = {
      id:
        db.products.length > 0
          ? Math.max(...db.products.map((product) => product.id)) + 1
          : 1,
      ...body,
    };

    db.products.push(newProduct);

    await writeDb(db);

    return NextResponse.json(newProduct, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
