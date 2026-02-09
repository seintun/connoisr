export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  notes?: string;
  options?: Record<string, string>;
}

export interface TableSession {
  tableId: string;
  cart: CartItem[];
  orders: Order[];
  status: 'browsing' | 'ordering' | 'payment' | 'completed';
}

export interface Order {
  id: string;
  tableId: string;
  items: CartItem[];
  status: 'ordered' | 'cooking' | 'ready' | 'served' | 'paid';
  createdAt: number; // Changed from Date to number for easier serialization
  total: number;
}
