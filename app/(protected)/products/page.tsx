"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

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

type Category = {
  idCategory: number;
  name: string;
};

export default function ProjectsPage() {
  const { data: session, status } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  // Fetch categories from backend on component mount
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories"); // adjust path as needed
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    try {
      let url = "/api/products";
      if (query || category) {
        const params = new URLSearchParams();
        if (query) params.append("query", query);
        if (category) params.append("category", category);
        url = `/api/products?${params.toString()}`;
        console.log(url);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.content || data); // Handles both paged and flat results
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
      fetchProducts();
    }
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  if (status === "loading") return <p className="p-4">Loading session...</p>;
  if (status === "unauthenticated") return <p className="p-4">You must be signed in to view this page.</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <main className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-40"
          />
          <Select value={category} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {/* Dynamically render categories */}
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.idCategory} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {product.name}
                  <Badge variant="secondary">{product.category.name}</Badge>
                </CardTitle>
              </CardHeader>
              <div className="w-full h-48 bg-black mb-4 flex items-center justify-center">
                <ProductImage url={product.imageURL} alt={product.name} />
              </div>
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
          </Link>
        ))}
      </div>
    </main>
  );
}
