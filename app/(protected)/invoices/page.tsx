"use client";

import { useEffect, useState } from "react";

type Product = {
  idProduct: string;
  name: string;
  price: number;
  quantity: number;
};

type Invoice = {
  idInvoice: number;
  startDate: string;
  totalPrice: number;
  payMethod: string;
  products: Product[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT");
}

function payMethodBadge(method: string) {
  const color =
    method === "MONEY"
      ? "bg-green-100 text-green-800"
      : method === "CARD"
      ? "bg-blue-100 text-blue-800"
      : "bg-yellow-100 text-yellow-800";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {method}
    </span>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/invoices");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Erro ao buscar invoices");
        }
        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">As suas faturas</h1>
      {loading && <p>A carregar...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && invoices.length === 0 && <p>Não existem faturas.</p>}
        <div className="space-y-8">
        {invoices.map((invoice, idx) => (
          <div
            key={invoice.idInvoice}
            className="border rounded-xl p-6 shadow bg-white"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <span className="font-semibold text-lg">
                  Fatura #{idx + 1}
                </span>
                <span className="ml-2 text-gray-500 text-sm">
                  {formatDate(invoice.startDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {payMethodBadge(invoice.payMethod)}
                <span className="font-bold text-lg text-green-700">
                  Total: ${invoice.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <table className="w-full text-sm border rounded overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-2 py-1">Produto</th>
                    <th className="text-center px-2 py-1">Quantidade</th>
                    <th className="text-center px-2 py-1">Preço</th>
                    <th className="text-right px-2 py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((prod) => (
                    <tr key={prod.idProduct} className="border-t">
                      <td className="px-2 py-1">{prod.name}</td>
                      <td className="text-center px-2 py-1">{prod.quantity}</td>
                      <td className="text-center px-2 py-1">
                        ${prod.price.toFixed(2)}
                      </td>
                      <td className="text-right px-2 py-1">
                        ${(prod.price * prod.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}