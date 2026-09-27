import { NextResponse } from "next/server";

import { readDb, writeDb } from "../../../lib/db";
import { ProductFormData } from "../../../types/product";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);

    const db = await readDb();

    const product = db.products.find((item) => item.id === productId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);

    const body = (await request.json()) as ProductFormData;

    const db = await readDb();

    const productIndex = db.products.findIndex((item) => item.id === productId);

    if (productIndex === -1) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const updatedProduct = {
      ...db.products[productIndex],
      ...body,
    };

    db.products[productIndex] = updatedProduct;

    await writeDb(db);

    return NextResponse.json(updatedProduct);
  } catch {
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);

    const db = await readDb();

    const productIndex = db.products.findIndex((item) => item.id === productId);

    if (productIndex === -1) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const deletedProduct = db.products[productIndex];

    db.products.splice(productIndex, 1);

    await writeDb(db);

    return NextResponse.json(deletedProduct);
  } catch {
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
