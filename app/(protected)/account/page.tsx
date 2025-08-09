"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
  fullName: string;
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/account");
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [status]);

  if (loading) return <p className="p-6">Loading account info...</p>;
  if (status === "unauthenticated") return <p className="p-6">You must be logged in.</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <div className="space-y-2">
        <p><strong>Full Name:</strong> {user?.fullName}</p>
        <p><strong>Email:</strong> {user?.username}</p>
      </div>
    </div>
  );
}
