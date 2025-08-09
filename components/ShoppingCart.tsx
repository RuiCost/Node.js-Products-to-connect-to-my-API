"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // make sure this path matches your setup
import { Trash } from "lucide-react"; // installed via lucide-react (shadcn default)


type CartItem = {
  date: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string;
    imageURL: string;
    category: {
      idCategory: number;
      name: string;
    };
  };
};


type ShoppingCartProps = {
  items?: CartItem[]; // optional, for server-passed data
};

export default function ShoppingCart({ items: initialItems }: ShoppingCartProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems || []);
  const [error, setError] = useState<string | null>(null);

  // Debounce handle for onChange pushes (arrow clicks or quick edits)
  const pushDebounceRef = useRef<number | null>(null);

  const pushShoppingCart = async (cartItems: CartItem[]) =>{
    const simplifiedPayload = cartItems.map(({ product, quantity }) => ({
      idProduct: product.id,
      quantity,
    }));
    try {
      const res = await fetch("/api/shoppingCart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simplifiedPayload),
      });

      if (!res.ok) {
        throw new Error(`Failed to push cart: ${res.statusText}`);
      }

      const data = await res.json();
      setItems(data);
      return data;
    } catch (err: any) {
      console.error("Error pushing shopping cart:", err.message);
      throw err;
    }
  };

  const schedulePush = (nextItems: CartItem[]) => {
    if (pushDebounceRef.current) {
      window.clearTimeout(pushDebounceRef.current);
    }
    pushDebounceRef.current = window.setTimeout(() => {
      pushShoppingCart(nextItems);
    }, 300);
  };

  const updateShoppingList = async () => {
    try {
      const res = await fetch("/api/shoppingCart");
      if (!res.ok) throw new Error("Failed to fetch shopping cart");
      const data: CartItem[] = await res.json();
      setItems(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  // Only fetch if no initialItems were passed from the server
  useEffect(() => {
    if (!initialItems) {
      updateShoppingList();
    }
  }, [initialItems]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const resetShoppingCart = async () => {
    await pushShoppingCart([]);
  };

  const updateQuantityAndMaybePush = (
    index: number,
    rawValue: string,
    pushMode: "debounce" | "immediate"
  ) => {
    const parsed = Number(rawValue);
    const nextQty = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;

    const nextItems = items.map((it, i) =>
      i === index ? { ...it, quantity: nextQty } : it
    );

    setItems(nextItems);

    if (pushMode === "immediate") {
      if (pushDebounceRef.current) window.clearTimeout(pushDebounceRef.current);
      pushShoppingCart(nextItems);
    } else {
      schedulePush(nextItems);
    }
  };

  return (
    <main className="p-6 mx-auto max-w-4xl flex justify-center flex-col items-center">
      <div className="mb-6 flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            await resetShoppingCart();
          }}
        >
          Reset
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Table>
        <TableCaption>Shopping Cart</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product</TableHead>
            <TableHead>Price/Unit</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-10 text-center"></TableHead> {/* Icon-only column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ product, quantity }, index) => (
            <TableRow key={product.id + index}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell><Input
                type="number"
                min={0}
                step={1}
                value={quantity}
                onChange={(e) => {
                  updateQuantityAndMaybePush(index, e.target.value, "debounce");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    updateQuantityAndMaybePush(index, target.value, "immediate");
                  }
                }}
                className="w-24"
                aria-label={`Quantity for ${product.name}`}
              /></TableCell>
              <TableCell className="text-right">
                ${(quantity * product.price).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const nextItems = items.filter((_, i) => i !== index);
                    setItems(nextItems);
                    pushShoppingCart(nextItems);
                  }}
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">${total.toFixed(2)}</TableCell>
            <TableCell ></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </main>
  );
}
