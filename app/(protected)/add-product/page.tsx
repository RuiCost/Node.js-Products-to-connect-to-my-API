"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = {
  idCategory: number;
  name: string;
};

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    categoryId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, [status]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    // 1. Criar o produto
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        description: form.description,
        category: parseInt(form.categoryId),
      }),
    });

    if (!res.ok) throw new Error("Failed to add product");

    const product = await res.json();

    // 2. Fazer upload da imagem, com token
    if (imageFile && session?.accessToken) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch(`http://localhost:8080/api/product/photo/${product.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Product created but image upload failed");
      }
    }

    router.push("/");
  } catch (err: any) {
    setError(err.message);
  }
};


  if (status === "unauthenticated") return <p className="p-4">Sign in to add a product.</p>;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Product</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} required />
        </div>

        <div>
          <Label>Category</Label>
          <Select onValueChange={(value) => handleChange("categoryId", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.idCategory} value={cat.idCategory.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* IMAGE INPUT */}
        <div>
          <Label htmlFor="image">Product Image</Label>
          <div
            className={cn(
              "border border-dashed border-gray-300 p-4 rounded-md text-center cursor-pointer",
              imageFile && "border-green-500"
            )}
          >
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="image" className="cursor-pointer">
              {imageFile ? imageFile.name : "Click or drag to select an image"}
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit">Add Product</Button>
      </form>
    </main>
  );
}
