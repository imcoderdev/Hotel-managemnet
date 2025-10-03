// Type definitions for the restaurant ordering system

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  createdAt: string;
}

export interface Owner {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
  ownerId?: string;
}
