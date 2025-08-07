"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TopBar() {
  const { data: session } = useSession();
  const username = session?.user?.username || "Guest";

  return (
    <header className="w-full px-6 py-4 border-b flex items-center justify-between bg-white">
      {/* Left: App name */}
      <Link href="/" className="text-xl font-bold tracking-tight">
        Pastelaria
      </Link>

      {/* Center: Navigation */}
      <NavigationMenu>
        <NavigationMenuList className="space-x-4">
          <NavigationMenuItem>
            <Link href="/products" className="text-sm font-medium hover:underline">
              Products
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/add-product" className="text-sm font-medium hover:underline">
              Add Product
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right: User info */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{username}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
