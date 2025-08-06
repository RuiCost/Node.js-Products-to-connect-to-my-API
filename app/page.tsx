"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  category: {
    idCategory: number;
    name: string;
  };
};

export default function ProjectsPage() {
  const { data: session, status } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading")
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        {/* Show 6 skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 rounded-md" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );

  if (status === "unauthenticated")
    return <p className="p-4">You must be signed in to view this page.</p>;

  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {product.name}
                <Badge variant="secondary">{product.category.name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="text-sm">
                <span className="font-semibold">Price:</span> ${product.price}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Stock:</span> {product.quantity}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
