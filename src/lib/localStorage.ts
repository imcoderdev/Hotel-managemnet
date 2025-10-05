// LocalStorage utility functions for managing restaurant data
// All data is stored in browser's localStorage for demo purposes

import { MenuItem, Owner, Order } from "@/types";

// Keys for localStorage
const STORAGE_KEYS = {
  OWNERS: 'restaurant_owners',
  MENU_ITEMS: 'restaurant_menu',
  ORDERS: 'restaurant_orders',
  CURRENT_OWNER: 'current_owner_id',
};

// Helper function to safely parse JSON from localStorage
function safeJSONParse<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key}:`, error);
    return defaultValue;
  }
}

// Helper function to safely stringify and save to localStorage
function safeJSONStringify(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

// ============ OWNER MANAGEMENT ============

export function getAllOwners(): Owner[] {
  return safeJSONParse<Owner[]>(STORAGE_KEYS.OWNERS, []);
}

export function createOwner(username: string, password: string): Owner {
  const owners = getAllOwners();
  
  // Check if username already exists
  if (owners.some(owner => owner.username === username)) {
    throw new Error('Username already exists');
  }

  const newOwner: Owner = {
    id: Date.now().toString(),
    username,
    password, // In a real app, this should be hashed!
    createdAt: new Date().toISOString(),
  };

  owners.push(newOwner);
  safeJSONStringify(STORAGE_KEYS.OWNERS, owners);
  return newOwner;
}

export function loginOwner(username: string, password: string): Owner | null {
  const owners = getAllOwners();
  const owner = owners.find(o => o.username === username && o.password === password);
  
  if (owner) {
    // Save current owner ID
    localStorage.setItem(STORAGE_KEYS.CURRENT_OWNER, owner.id);
  }
  
  return owner || null;
}

export function logoutOwner(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_OWNER);
}

export function getCurrentOwner(): Owner | null {
  const ownerId = localStorage.getItem(STORAGE_KEYS.CURRENT_OWNER);
  if (!ownerId) return null;

  const owners = getAllOwners();
  return owners.find(o => o.id === ownerId) || null;
}

// ============ MENU MANAGEMENT ============

export function getAllMenuItems(): MenuItem[] {
  return safeJSONParse<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
}

export function addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt'>): MenuItem {
  const items = getAllMenuItems();
  
  const newItem: MenuItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  safeJSONStringify(STORAGE_KEYS.MENU_ITEMS, items);
  return newItem;
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
  const items = getAllMenuItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return null;

  items[index] = { ...items[index], ...updates };
  safeJSONStringify(STORAGE_KEYS.MENU_ITEMS, items);
  return items[index];
}

export function deleteMenuItem(id: string): boolean {
  const items = getAllMenuItems();
  const filtered = items.filter(item => item.id !== id);
  
  if (filtered.length === items.length) return false;
  
  safeJSONStringify(STORAGE_KEYS.MENU_ITEMS, filtered);
  return true;
}

// ============ ORDER MANAGEMENT ============

export function getAllOrders(): Order[] {
  return safeJSONParse<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export function getOrdersByDateRange(startDate: Date, endDate: Date): Order[] {
  const orders = getAllOrders();
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

export function getOrdersByOwner(ownerId: string): Order[] {
  const orders = getAllOrders();
  return orders.filter(order => order.ownerId === ownerId);
}

export function getDailyOrderStats(ownerId: string) {
  const orders = getOrdersByOwner(ownerId);
  const dailyStats: Record<string, { orders: Order[], totalRevenue: number, orderCount: number }> = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!dailyStats[date]) {
      dailyStats[date] = { orders: [], totalRevenue: 0, orderCount: 0 };
    }
    dailyStats[date].orders.push(order);
    dailyStats[date].totalRevenue += order.total;
    dailyStats[date].orderCount += 1;
  });
  
  return dailyStats;
}

export function createOrder(tableNumber: number, items: any[], total: number, ownerId?: string): Order {
  const orders = getAllOrders();
  
  const newOrder: Order = {
    id: Date.now().toString(),
    tableNumber,
    items,
    total,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    ownerId: ownerId || getCurrentOwner()?.id,
  };

  orders.push(newOrder);
  safeJSONStringify(STORAGE_KEYS.ORDERS, orders);
  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status']): boolean {
  const orders = getAllOrders();
  const order = orders.find(o => o.id === id);
  
  if (!order) return false;
  
  order.status = status;
  safeJSONStringify(STORAGE_KEYS.ORDERS, orders);
  return true;
}

// ============ INITIALIZATION ============

// Initialize with sample data if needed (optional - can be disabled)
export function initializeSampleData(): void {
  // Leave menu empty by default - owner should add their own items
  // Uncomment below to add sample data
  
  /*
  const items = getAllMenuItems();
  
  if (items.length === 0) {
    const sampleItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with cheese, lettuce, tomato, and our special sauce',
        price: 12.99,
        image: '/src/assets/hero-food.jpg',
      },
      {
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomatoes, and basil on our homemade crust',
        price: 14.99,
        image: '/src/assets/pizza.jpg',
      },
      {
        name: 'Grilled Steak',
        description: 'Premium ribeye steak with roasted vegetables and garlic butter',
        price: 24.99,
        image: '/src/assets/steak.jpg',
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with grilled chicken, parmesan, and Caesar dressing',
        price: 10.99,
        image: '/src/assets/salad.jpg',
      },
      {
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon, parmesan cheese, and black pepper',
        price: 13.99,
        image: '/src/assets/pasta.jpg',
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        price: 7.99,
        image: '/src/assets/dessert.jpg',
      },
    ];

    sampleItems.forEach(item => addMenuItem(item));
  }
  */
}
