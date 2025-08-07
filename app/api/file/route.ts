// app/api/file/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  if (!token || !token.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ message: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    // Fetch the file from the provided URL
    const res = await fetch(url,{
        headers: {
            Authorization: `Bearer ${token.accessToken}`,
        },
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Failed to fetch file", status: res.status }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const buffer = await res.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching file", error: error.message }, { status: 500 });
  }
}
