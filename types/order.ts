export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export type Order = {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total: number;
  stripe_checkout_session_id: string | null;
  created_at: string;
};
