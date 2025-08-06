

// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch("http://localhost:8080/api/category", {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
