import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password, rePassword, fullName } = await request.json();

    if (!username || !password || !rePassword || !fullName) {
      return NextResponse.json(
        { message: "Username, password, rePassword and full name are required" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        password: "testpass",
        rePassword: "testpass",
        fullName: "Test User",
        authorities: ["CUSTOMER"]
      }),
    });

    console.log("Backend response status:", res.status);
    const text = await res.text();
    console.log("Backend response body:", text);

    const body = JSON.stringify({ 
      username: username, 
      password: password , 
      rePassword: rePassword, 
      fullName: fullName, authorities: ["CUSTOMER"]});
    console.log(body);

    // Forward registration request to backend API
    const backendRes = await fetch("http://localhost:8080/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!backendRes.ok) {
      // Try to get backend error message
      let errorMsg = "Registration failed";
      try {
        const errData = await backendRes.json();
        errorMsg = errData.message || errorMsg;
      } catch {
        // ignore parse errors
      }
      return NextResponse.json({ message: errorMsg }, { status: backendRes.status });
    }

    // Success - forward success message or generic
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }
}
