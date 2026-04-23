import type { InventoryItem, Status } from '../types/inventory';

export const today = new Date();
today.setHours(0, 0, 0, 0);

/**
 * Calculates the status of an inventory item based on quantity and expiry.
 */
export function getStatus(item: InventoryItem): Status {
  const exp = new Date(item.expiry);
  if (exp < today) return 'Expired';
  if (item.quantity <= item.min_stock) return 'Low';
  return 'In Stock';
}

/**
 * Calculates the number of days left until expiry.
 */
export function getDaysLeft(expiry: string): number {
  const exp = new Date(expiry);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const STATUS_STYLE: Record<Status, string> = {
  'In Stock': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Low': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Expired': 'bg-rose-50 text-rose-700 border border-rose-200',
};

export const STATUS_DOT: Record<Status, string> = {
  'In Stock': 'bg-emerald-500',
  'Low': 'bg-amber-500',
  'Expired': 'bg-rose-500',
};

export const INVENTORY_CATEGORIES = [
  'Chemicals', 
  'Reagents', 
  'Enzymes', 
  'Consumables', 
  'Dyes', 
  'Equipment', 
  'Glassware'
];

export const INVENTORY_UNITS = [
  'bottles', 
  'vials', 
  'pcs', 
  'packs', 
  'kg', 
  'g', 
  'mg', 
  'L', 
  'mL', 
  'µL', 
  'units', 
  'pairs'
];
