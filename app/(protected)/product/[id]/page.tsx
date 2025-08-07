"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ProductPage() {
  const { id } = useParams();
  const { status } = useSession(); // still used to guard access
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch product");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (id && status === "authenticated") {
      fetchProduct();
    }
  }, [id, status]);

  if (status === "loading") return <p className="p-4">Loading session...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!product) return <p className="p-4">Loading product...</p>;

  return (
    <main className="p-6">
      {/* Shadcn Breadcrumbs */}
      <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/products">Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{product.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="mb-2 text-muted-foreground">{product.description}</p>

      <div className="space-y-2 text-sm">
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>Price:</strong> ${product.price}</p>
        <p><strong>Stock:</strong> {product.quantity}</p>
        <p><strong>Category:</strong> {product.category.name}</p>
      </div>
    </main>
  );
}
