export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string | null; created_at: string };
        Insert: { id: string; full_name?: string | null; email?: string | null; created_at?: string };
        Update: { full_name?: string | null; email?: string | null };
      };
      categories: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: { name?: string; slug?: string };
      };
      products: {
        Row: { id: string; name: string; description: string | null; price: number; image_url: string | null; category_id: string | null; active: boolean; created_at: string };
        Insert: { id?: string; name: string; description?: string | null; price: number; image_url?: string | null; category_id?: string | null; active?: boolean; created_at?: string };
        Update: { name?: string; description?: string | null; price?: number; image_url?: string | null; category_id?: string | null; active?: boolean };
      };
      orders: {
        Row: { id: string; user_id: string | null; status: string; total: number; stripe_checkout_session_id: string | null; created_at: string };
        Insert: { id?: string; user_id?: string | null; status?: string; total: number; stripe_checkout_session_id?: string | null; created_at?: string };
        Update: { status?: string; total?: number; stripe_checkout_session_id?: string | null };
      };
      order_items: {
        Row: { id: string; order_id: string; product_id: string; quantity: number; unit_price: number };
        Insert: { id?: string; order_id: string; product_id: string; quantity: number; unit_price: number };
        Update: { quantity?: number; unit_price?: number };
      };
    };
  };
};
