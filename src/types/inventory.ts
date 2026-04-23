export type Status = 'In Stock' | 'Low' | 'Expired';

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  min_stock: number;
  unit: string;
  expiry: string;
  category: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
  item_id: number;
  type: 'USE' | 'ADD' | 'UPDATE';
  quantity: number;
  user: string;
  item_name?: string;
  category?: string;
  created_at: string;
}

export type UsageLog = Transaction;

export interface InventoryItemInsert {
  name: string;
  quantity: number;
  min_stock?: number;
  unit: string;
  expiry: string;
  category: string;
}
