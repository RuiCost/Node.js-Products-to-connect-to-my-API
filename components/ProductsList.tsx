// components/ProductsList.tsx
"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

type Product = {
  id: number
  name: string
  price: number
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8080/api/product")
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-6 w-[200px]" />
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {products.map(product => (
        <li key={product.id} className="border p-4 rounded-md shadow-sm">
          <div className="text-lg font-medium">{product.name}</div>
          <Separator className="my-2" />
          <div className="text-sm text-muted-foreground">€ {product.price.toFixed(2)}</div>
        </li>
      ))}
    </ul>
  )
}
