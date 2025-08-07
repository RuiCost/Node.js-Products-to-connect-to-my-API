// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE_URL = "http://localhost:8080/api/product";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url); // Get query params from request
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "8";

  const url = new URL(`${API_BASE_URL}/search`);
  if (query) url.searchParams.set("query", query);
  if (category) url.searchParams.set("category", category);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}


export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  console.log("Authorized?");
  const body = await req.json();

  console.log("Data" + JSON.stringify(body))

  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  console.log(text)

    const data = text ? JSON.parse(text) : {}; // fallback to empty object

    console.log(data)

    return NextResponse.json(data, { status: res.status });
}
