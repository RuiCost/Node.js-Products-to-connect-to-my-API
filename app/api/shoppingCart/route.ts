// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE_URL = "http://localhost:8080/api/shopingCart";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(API_BASE_URL, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
    },
  });

  if (!res.ok){
    return res;
  }

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
// ...existing code...

export async function PATCH(req: NextRequest){
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ✅ Parse the incoming shopping cart from the request body
  const newShoppingCart = await req.json();

  const body = JSON.stringify(newShoppingCart);

  // send it to the backend
  const res = await fetch(API_BASE_URL + "/multiple", {
    method:"PATCH",
    headers: {
      "Content-Type": "application/json", // important for backend to parse JSON
      Authorization: `Bearer ${token.accessToken}`,
    },
    body,
  });

  if (!res.ok){
    return res;
  }
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest){
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const newShoppingCart = await req.json();
  const body = JSON.stringify(newShoppingCart);

  const res = await fetch(API_BASE_URL, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body,
  });

  // Se não for JSON, devolve só o status e uma mensagem
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  return NextResponse.json(data, { status: res.status });
}
