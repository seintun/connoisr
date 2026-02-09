export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  options?: Record<string, string>;
}

export interface TableSession {
  tableId: string;
  cart: CartItem[];
  status: 'browsing' | 'ordering' | 'payment' | 'completed';
}

export interface Order {
  id: string;
  tableId: string;
  items: CartItem[];
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  total: number;
}
