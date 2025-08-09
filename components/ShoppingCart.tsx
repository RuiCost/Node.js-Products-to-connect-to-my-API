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
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react"

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

  const { data: session } = useSession();
  const [payMethod, setPayMethod] = useState<"MBWAY" | "CARD" | "MONEY">("MONEY");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const router = useRouter();

  // Debounce handle for onChange pushes (arrow clicks or quick edits)
  const pushDebounceRef = useRef<number | null>(null);

const handlePayment = async () => {
  setPayLoading(true);
  setPayError(null);
  setPaySuccess(null);
  try {
    // 1. Criar invoice
    const userId = session?.user?.id;
    if (!userId) throw new Error("Utilizador não autenticado");
    const invoiceRes = await fetch("/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userId, payMethod }),
    });
    if (!invoiceRes.ok) {
      let msg = "";
      try {
        const data = await invoiceRes.json();
        if (data.details && Array.isArray(data.details)) {
          msg = data.details.join(", ");
        } else {
          msg = data.message || "Erro ao criar invoice";
        }
      } catch {
        const text = await invoiceRes.text();
        if (text) msg = text;
      }
      throw new Error(msg);
    }
    const invoice = await invoiceRes.json();
    const idInvoice = invoice.idInvoice;

    // 2. Para cada item do carrinho, criar productInvoice
    for (const item of items) {
      const res = await fetch("/api/productInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idInvoice,
          idProduct: item.product.id,
          quantity: item.quantity,
        }),
      });
      if (!res.ok) {
        let msg = "";
        try {
          const data = await res.json();
          if (data.details && Array.isArray(data.details)) {
            msg = data.details.join(", ");
          } else {
            msg = data.message || "Erro ao associar produto à invoice";
          }
        } catch {
          const text = await res.text();
          if (text) msg = text;
        }
        throw new Error(msg);
      }
    }
    setPaySuccess("Pagamento efetuado com sucesso!");
    window.location.reload();
  } catch (err: any) {
    setPayError(err.message);
  } finally {
    setPayLoading(false);
  }
};

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
      <TableCell>
        <Input
          type="number"
          min={0}
          max={product.quantity}
          step={1}
          value={quantity}
          onChange={(e) => {
            let val = Number(e.target.value);
            // Garante que não passa do stock disponível
            if (val > product.quantity) val = product.quantity;
            if (val < 0) val = 0;
            updateQuantityAndMaybePush(index, String(val), "debounce");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              let val = Number(target.value);
              if (val > product.quantity) val = product.quantity;
              if (val < 0) val = 0;
              updateQuantityAndMaybePush(index, String(val), "immediate");
            }
          }}
          className="w-24"
          aria-label={`Quantity for ${product.name}`}
        />
      </TableCell>
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
            { items.length > 0 && (
          <div className="w-full mt-6 flex flex-col gap-2">
          <label className="font-semibold">Método de Pagamento:</label>
          <select
            value={payMethod}
            onChange={e => setPayMethod(e.target.value as "MBWAY" | "CARD" | "MONEY")}
            className="border rounded p-2"
          >
            <option value="MONEY">Dinheiro</option>
            <option value="CARD">Cartão</option>
            <option value="MBWAY">MBWAY</option>
          </select>
          <Button
            onClick={handlePayment}
            disabled={payLoading}
            className="mt-2"
          >
            {payLoading ? "A processar..." : "Pagar"}
          </Button>
          {payError && <p className="text-red-500">{payError}</p>}
          {paySuccess && <p className="text-green-600">{paySuccess}</p>}
        </div>
        )}

    </main>
  );
}
