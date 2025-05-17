"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  CreditCard,
  // FileText, // Removed Reports icon
  Users,
  // Settings2, // Settings icon was present but not used in navItems
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/UserNav";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/stock", label: "Stock", icon: Boxes },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/staff", label: "Staff", icon: Users },
  // { href: "/reports", label: "Reports", icon: FileText }, // Removed Reports nav item
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                tooltip={{ children: item.label, className: "bg-primary text-primary-foreground" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
         <UserNav />
      </SidebarFooter>
    </>
  );
}
