// Database types for Supabase

export interface Database {
  public: {
    Tables: {
      owners: {
        Row: {
          id: string
          email: string
          restaurant_name: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          restaurant_name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          restaurant_name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          owner_id: string
          table_number: number
          qr_code_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          owner_id: string
          table_number: number
          qr_code_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          owner_id?: string
          table_number?: number
          qr_code_url?: string | null
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          owner_id: string
          table_id: string | null
          table_number: number
          customer_name: string | null
          customer_phone: string | null
          status: 'waiting' | 'accepted' | 'preparing' | 'on-the-way' | 'completed' | 'cancelled'
          subtotal: number
          tax: number
          total: number
          payment_status: 'pending' | 'paid' | 'failed'
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          table_id?: string | null
          table_number: number
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'waiting' | 'accepted' | 'preparing' | 'on-the-way' | 'completed' | 'cancelled'
          subtotal: number
          tax: number
          total: number
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          table_id?: string | null
          table_number?: number
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'waiting' | 'accepted' | 'preparing' | 'on-the-way' | 'completed' | 'cancelled'
          subtotal?: number
          tax?: number
          total?: number
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          name: string
          price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          name: string
          price: number
          quantity: number
          subtotal: number
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          name?: string
          price?: number
          quantity?: number
          subtotal?: number
        }
      }
    }
  }
}

// Application types
export interface MenuItem {
  id: string
  owner_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: string
  owner_id: string
  table_id: string | null
  table_number: number
  customer_name: string | null
  customer_phone: string | null
  status: 'waiting' | 'accepted' | 'preparing' | 'on-the-way' | 'completed' | 'cancelled'
  subtotal: number
  tax: number
  total: number
  payment_status: 'pending' | 'paid' | 'failed'
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Owner {
  id: string
  email: string
  restaurant_name: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}
