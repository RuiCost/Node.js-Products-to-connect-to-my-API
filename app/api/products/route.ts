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

  // Parse multipart/form-data
  const formData = await req.formData();

  // Extract fields
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);
  const description = formData.get("description") as string;
  const category = parseInt(formData.get("category") as string);
  const image = formData.get("file") as File | null;

  // Step 1: Create product
  const createRes = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify({ name, price, quantity, description, category }),
  });

  const text = await createRes.text();
  const createdProduct = text ? JSON.parse(text) : {};

  if (!createRes.ok) {
    return NextResponse.json({ message: "Product creation failed", error: createdProduct }, { status: createRes.status });
  }

  const productId = createdProduct.id;

  // Step 2: Upload image (if present)
  if (image && image instanceof File) {
    const uploadForm = new FormData();
    uploadForm.append("file", image);

    const uploadRes = await fetch(`http://localhost:8080/api/product/photo/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        // Do not set Content-Type here, let fetch handle it
      },
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ message: "Product created but image upload failed" }, { status: 500 });
    }
  }

  return NextResponse.json(createdProduct, { status: 201 });
}
