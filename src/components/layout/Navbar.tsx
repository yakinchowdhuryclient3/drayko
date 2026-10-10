import { getMenuItems } from "@/lib/queries/menu-items";
import NavbarClient from "./NavbarClient";

// Force fresh data on every request (no cache)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NavbarServer() {
  const menuItems = await getMenuItems();

  console.log("🔵 Navbar items count:", menuItems.length);
  console.log("🔵 Labels:", menuItems.map((m: any) => m.label).join(", "));

  const items =
    menuItems.length > 0
      ? menuItems
      : [
          { id: "1", label: "SALE", href: "/sale", color: "red", sort_order: 1, is_active: true },
        ];

  return <NavbarClient items={items} />;
}