"use client";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react"; // Hamburger icon

export default function TopBar() {
  const { data: session } = useSession();
  const username = session?.user?.username || "Guest";
 const router = useRouter();

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="hidden sm:flex w-full px-6 py-4 border-b items-center justify-between bg-white">
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
            <DropdownMenuItem onClick={() => router.push("/account")}>
              My account
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/shoppingCart")}>
              Shopping Cart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/invoices")}>
              Invoices
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Floating Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="sm:hidden fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-full shadow-md hover:bg-gray-800"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="sm:hidden p-6 space-y-4">
          <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
          <nav className="flex flex-col gap-4">
            <Link href="/products" className="text-sm font-medium">
              Products
            </Link>
            <Link href="/add-product" className="text-sm font-medium">
              Add Product
            </Link>
            <Link href="/account" className="text-sm font-medium">
              My account
            </Link>
            <Link href="/shoppingCart" className="text-sm font-medium">
              Shopping Cart
            </Link>
            <Link href="/invoices" className="text-sm font-medium">
              Invoices
            </Link>
          </nav>
          <div className="border-t pt-4 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{username}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-auto text-sm text-red-500 hover:underline"
            >
              Logout
            </button>
            
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
