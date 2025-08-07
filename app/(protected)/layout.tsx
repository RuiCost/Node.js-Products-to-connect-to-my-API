// app/(protected)/layout.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path to where you define your NextAuth config
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // or whatever your login route is
  }

  return <>
    <TopBar /> {/* ✅ Add the top bar */} 
    {children}
    </>;
}
