import { supabase } from '../lib/supabase';
import type { InventoryItem, InventoryItemInsert, Transaction } from '../types/inventory';

const TABLE_NAME = 'items'; 

export const inventoryService = {
  async fetchItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as InventoryItem[];
  },

  async addItem(item: InventoryItemInsert, userId: string): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...item, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as InventoryItem;
  },

  async updateItemQuantity(id: number, quantity: number, _userId: string): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as InventoryItem;
  },

  async deleteItem(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateItem(id: number, item: Partial<InventoryItemInsert>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as InventoryItem;
  },

  async getCategoryBreakdown() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('category');

    if (error) throw error;

    const counts: Record<string, number> = {};
    data.forEach((item: any) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) throw error;
    
    return (data as InventoryItem[]).filter(item => item.quantity <= item.min_stock);
  },

  async getRecentUsage(limit = 5) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async fetchTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
  },

  async logTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>, userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWeeklyUsage() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('transactions')
      .select('created_at, quantity')
      .eq('type', 'USE')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) throw error;

    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap[d.toISOString().split('T')[0]] = 0;
    }

    data.forEach((t: any) => {
        const d = t.created_at.split('T')[0];
        if (dailyMap[d] !== undefined) {
            dailyMap[d] += t.quantity;
        }
    });

    return Object.entries(dailyMap)
        .map(([date, count]) => ({ 
            date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            count 
        }))
        .reverse();
  },

  async getTopUsage(limit = 5) {
    const { data, error } = await supabase
      .from('transactions')
      .select('item_name, quantity')
      .eq('type', 'USE');

    if (error) throw error;

    const totals: Record<string, number> = {};
    data.forEach((t: any) => {
        totals[t.item_name] = (totals[t.item_name] || 0) + t.quantity;
    });

    return Object.entries(totals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
  },

  async getCategoryVolume() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('category, quantity');

    if (error) throw error;

    const volumes: Record<string, number> = {};
    data.forEach((item: any) => {
        volumes[item.category] = (volumes[item.category] || 0) + item.quantity;
    });

    return Object.entries(volumes).map(([category, volume]) => ({ category, volume }));
  },

  async logUsage(itemId: number, quantity: number, user: string, userId: string) {
    const { data, error } = await supabase.rpc('handle_usage', {
      target_item_id: itemId,
      usage_quantity: quantity,
      user_name: user,
      target_user_id: userId 
    });

    if (error) throw error;
    return data;
  },
};
