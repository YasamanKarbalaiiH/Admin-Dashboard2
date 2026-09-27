import { NextResponse } from "next/server";
import { readDb, writeDb } from "../../lib/db";

export async function GET() {
  try {
    const db = await readDb();

    return NextResponse.json(db.profile);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const db = await readDb();

    db.profile = {
      ...db.profile,
      ...body,
    };

    await writeDb(db);

    return NextResponse.json(db.profile);
  } catch {
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
