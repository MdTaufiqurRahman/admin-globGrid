import type { LinkProps } from "@tanstack/react-router";
import {
  Factory,
  FileText,
  Headset,
  LayoutDashboard,
  Megaphone,
  Package,
  Ship,
  ShoppingCart,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

type NavLink = { label: string; icon: LucideIcon; to: LinkProps["to"] };

/** In the menu so the whole admin can be seen, but waiting on the API. */
type NavSoon = { label: string; icon: LucideIcon; soon: true };

export type NavItem = NavLink | NavSoon;

/** The sidebar's sections. A section moves off `soon` once its API exists and its page is built. */
export const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ label: "Dashboard", icon: LayoutDashboard, to: "/" }] },
  {
    label: "Catalog",
    items: [
      { label: "Categories", icon: Tags, to: "/categories" },
      { label: "Products", icon: Package, soon: true },
      { label: "Factories", icon: Factory, soon: true },
    ],
  },
  {
    label: "Sourcing",
    items: [
      { label: "RFQs", icon: FileText, to: "/rfqs" },
      { label: "Freight", icon: Ship, soon: true },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Consultations", icon: Headset, to: "/consultations" },
      { label: "Orders", icon: ShoppingCart, soon: true },
      { label: "Customers", icon: Users, soon: true },
    ],
  },
  { label: "Website", items: [{ label: "Content", icon: Megaphone, soon: true }] },
];
