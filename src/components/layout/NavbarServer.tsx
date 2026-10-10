import NavbarClient from "./NavbarClient";

const STATIC_MENU_ITEMS = [
  { id: "1", label: "SALE", href: "/sale", color: "red", sort_order: 1, is_active: true },
  { id: "2", label: "WINTER COLLECTION", href: "/winter-collection", color: "default", sort_order: 2, is_active: true },
  { id: "3", label: "FORMAL WEARS", href: "/category/formal-wears", color: "default", sort_order: 3, is_active: true },
  { id: "4", label: "KURTA", href: "/category/kurta", color: "default", sort_order: 4, is_active: true },
  { id: "5", label: "POLO", href: "/category/polo", color: "default", sort_order: 5, is_active: true },
  { id: "6", label: "TROUSER", href: "/category/trouser", color: "default", sort_order: 6, is_active: true },
  { id: "7", label: "SHIRTS", href: "/category/shirts", color: "default", sort_order: 7, is_active: true },
  { id: "8", label: "T-SHIRTS", href: "/category/t-shirts", color: "default", sort_order: 8, is_active: true },
  { id: "9", label: "PAIJAMA", href: "/category/paijama", color: "default", sort_order: 9, is_active: true },
  { id: "10", label: "WOMEN'S COLLECTION", href: "/category/womens", color: "pink", sort_order: 10, is_active: true },
  { id: "11", label: "SLIDES", href: "/category/slides", color: "default", sort_order: 11, is_active: true },
  { id: "12", label: "SHOES", href: "/category/shoes", color: "default", sort_order: 12, is_active: true },
];

export default function NavbarServer() {
  return <NavbarClient items={STATIC_MENU_ITEMS} />;
}