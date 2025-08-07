import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE_URL = "http://localhost:8080/api/product";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const productId = params.id;

  try {
    const res = await fetch(`${API_BASE_URL}/${productId}`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    const text = await res.text();

    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ message: "Error fetching product", error: err.message }, { status: 500 });
  }
}
