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
  imageURL: string;
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

// ...existing code...
import ProductImage from "@/components/ProductImage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
// ...existing code...

export default function ProductPage() {
  const { id } = useParams();
  const { status } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

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

const handleBuy = async () => {
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    const res = await fetch("/api/shoppingCart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idProduct: product!.id, quantity }),
    });
    if (!res.ok) {
      let msg = "";
      try {
        const data = await res.json();
        if (data.details && Array.isArray(data.details)) {
          msg = data.details.join(", ");
        } else {
          msg = data.message || "Erro ao adicionar ao carrinho";
        }
      } catch {
        const text = await res.text();
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    setSuccess("Produto adicionado ao carrinho!");
    // Opcional: router.push("/shoppingCart");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
// ...existing code...
  if (status === "loading") return <p className="p-4">Loading session...</p>;
  if (!product) return <p className="p-4">Loading product...</p>;

  return (
    <main className="p-6 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-4xl">
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

        <div className="flex flex-col md:flex-row gap-8 mt-8 items-center justify-center">
          <div className="w-full md:w-[420px] flex items-center justify-center bg-black h-80 rounded-lg border mb-6 md:mb-0">
            <ProductImage url={product.imageURL} alt={product.name} className="object-contain max-h-72" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="mb-2 text-muted-foreground">{product.description}</p>
            <div className="space-y-2 text-sm mb-4">
              <p><strong>ID:</strong> {product.id}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Stock:</strong> {product.quantity}</p>
              <p><strong>Category:</strong> {product.category.name}</p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Input
                type="number"
                min={1}
                max={product.quantity}
                value={quantity === 0 ? "" : quantity}
                onChange={e => {
                  const val = e.target.value;
                  if (val === "") {
                    setQuantity(0);
                  } else {
                    const num = Number(val);
                    setQuantity(num);
                  }
                }}
                className="w-24"
                aria-label="Quantidade"
              />
              <Button onClick={handleBuy} disabled={loading || quantity < 1 || quantity > product.quantity}>
                {loading ? "A adicionar..." : "Comprar"}
              </Button>
            </div>
            {/* Mostra mensagem de erro do servidor aqui */}
            {success && <p className="text-green-600">{success}</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
// ...existing code...