import { getMenuItems } from "@/lib/queries/menu-items";
import NavbarClient from "./NavbarClient";

export default async function NavbarServer() {
  const menuItems = await getMenuItems();

  // Fallback if DB empty
  const items =
    menuItems.length > 0
      ? menuItems
      : [
          { id: "1", label: "SALE", href: "/sale", color: "red", sort_order: 1, is_active: true },
          { id: "2", label: "WINTER COLLECTION", href: "/winter-collection", color: "default", sort_order: 2, is_active: true },
        ];

  return <NavbarClient items={items} />;
}