import { createClient } from "@/lib/supabase/client";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  alt_phone: string | null;
  division: string;
  district: string;
  area: string;
  address: string;
  delivery_note: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
  created_at: string;
};

export type CartItemInput = {
  product_id: string;
  product_name: string;
  product_image: string | null;
  size: string;
  color: string;
  price: number;
  quantity: number;
};

export type OrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  alt_phone?: string;
  division: string;
  district: string;
  area: string;
  address: string;
  delivery_note?: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  items: CartItemInput[];
};

// ============ GENERATE ORDER NUMBER (DRK-0001) ============
export async function generateOrderNumber(): Promise<string> {
  const supabase = createClient();

  // Get count of existing orders
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error counting orders:", error);
    // Fallback: timestamp based
    return `DRK-${Date.now().toString().slice(-6)}`;
  }

  const nextNumber = (count || 0) + 1;
  return `DRK-${String(nextNumber).padStart(4, "0")}`;
}

// ============ CREATE ORDER ============
export async function createOrder(
  input: OrderInput
): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createClient();

  try {
    const orderNumber = await generateOrderNumber();

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        customer_email: input.customer_email || null,
        alt_phone: input.alt_phone || null,
        division: input.division,
        district: input.district,
        area: input.area,
        address: input.address,
        delivery_note: input.delivery_note || null,
        subtotal: input.subtotal,
        delivery_charge: input.delivery_charge,
        total: input.total,
        payment_method: input.payment_method,
        payment_status: "pending",
        order_status: "pending",
      })
      .select()
      .single();

    if (orderError || !orderData) {
      return {
        order: null,
        error: orderError?.message || "Failed to create order",
      };
    }

    // Insert order items
    const itemsToInsert = input.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      size: item.size,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError);
      // Order created but items failed — still return order
    }

    return { order: orderData as Order, error: null };
  } catch (error) {
    console.error("Create order exception:", error);
    return {
      order: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============ GET ORDER BY NUMBER (for tracking) ============
export async function getOrderByNumber(
  orderNumber: string,
  phone: string
): Promise<{ order: Order | null; items: OrderItem[] }> {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber.toUpperCase())
    .eq("customer_phone", phone)
    .maybeSingle();

  if (!order) {
    return { order: null, items: [] };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    order: order as Order,
    items: (items || []) as OrderItem[],
  };
}