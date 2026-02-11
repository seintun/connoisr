export interface CartItem {
  instanceId: string;
  menuItemId: string;
  name: string;
  category: string;
  price: number;
  quantity: number; // Deprecated: Always 1 for instances, but kept for compatibility during refactor if needed, or we can just remove it. Let's keep it as always 1 for now to minimize breakage until we fix all usages.
  notes?: string;
  options?: {
    spiciness?: string;
    sweetness?: string;
    allergens?: string;
    removals?: string;
    note?: string;
    [key: string]: string | undefined;
  };
  isCustomized?: boolean;
  tags?: string[];
  orderedByName?: string;
  status: 'PENDING' | 'SENT';
}

export interface TableSession {
  tableId: string;
  guestName?: string;
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
