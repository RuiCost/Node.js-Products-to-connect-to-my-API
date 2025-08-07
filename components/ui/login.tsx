// app/products/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar produto");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Erro inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="p-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main className="p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {product.name}
            <Badge variant="secondary">{product.category.name}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{product.description}</p>
          <div>
            <span className="font-semibold">Preço:</span> ${product.price}
          </div>
          <div>
            <span className="font-semibold">Stock disponível:</span> {product.quantity}
          </div>
          <Button onClick={() => router.back()} className="mt-4">
            Voltar
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
