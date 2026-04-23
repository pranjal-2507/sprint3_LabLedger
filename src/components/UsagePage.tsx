import React, { useState, useEffect } from 'react';
import { 
  Activity,
  History, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Hash, 
  Box,
  Loader2
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import type { InventoryItem } from '../types/inventory';
import { useAuth } from '../contexts/AuthContext';

interface UsageForm {
  itemId: string;
  quantity: string;
  user: string;
}

const UsagePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<UsageForm>({
    itemId: '',
    quantity: '',
    user: profile?.full_name || ''
  });

  useEffect(() => {
    const fetchItemsData = async () => {
      if (!user) return;
      try {
        const data = await inventoryService.fetchItems();
        setItems(data);
        if (profile?.full_name) {
          setForm(prev => ({ ...prev, user: profile.full_name }));
        }
      } catch (err) {
        setError('Failed to load items. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchItemsData();
  }, [user, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!form.itemId || !form.quantity || !form.user) {
      setError('Please fill in all fields.');
      return;
    }

    const qty = parseInt(form.quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    const selectedItem = items.find(i => i.id.toString() === form.itemId);
    if (selectedItem && selectedItem.quantity < qty) {
      setError(`Insufficient stock. Current balance: ${selectedItem.quantity} ${selectedItem.unit}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await inventoryService.logUsage(parseInt(form.itemId), qty, form.user, user.id);
      
      setSuccess(`Successfully recorded ${qty} ${selectedItem?.unit || 'units'} used by ${form.user}`);
      setForm({ itemId: '', quantity: '', user: profile?.full_name || '' });
      
      const updatedItems = await inventoryService.fetchItems();
      setItems(updatedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to record usage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Record Inventory Usage</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Deduct stock and log activity in a single transaction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Box size={16} className="text-slate-400 dark:text-slate-500" />
                  Select Item
                </label>
                <select
                  name="itemId"
                  value={form.itemId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700"
                >
                  <option value="">Choose an item...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <Hash size={16} className="text-slate-400 dark:text-slate-500" />
                    Quantity Used
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <User size={16} className="text-slate-400 dark:text-slate-500" />
                    Used By
                  </label>
                  <input
                    type="text"
                    name="user"
                    value={form.user}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-500/20 text-sm animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={18} />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-sm animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 size={18} />
                  <p className="font-medium">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  submitting 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-sky-200 active:scale-[0.98]'
                }`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {submitting ? 'Updating Ledger...' : 'Submit Usage'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors">
            {form.itemId ? (
              <div className="space-y-4 w-full">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto mb-2">
                  <Activity size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                    {items.find(i => i.id.toString() === form.itemId)?.name}
                  </h3>
                  <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mt-1">
                    {items.find(i => i.id.toString() === form.itemId)?.category}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Current Stock</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      {items.find(i => i.id.toString() === form.itemId)?.quantity} 
                      <span className="text-sm font-normal text-slate-400"> {items.find(i => i.id.toString() === form.itemId)?.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Remaining</p>
                    <p className={`text-lg font-bold ${Number(items.find(i => i.id.toString() === form.itemId)?.quantity || 0) - Number(form.quantity || 0) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {Number(items.find(i => i.id.toString() === form.itemId)?.quantity || 0) - Number(form.quantity || 0)} 
                      <span className="text-sm font-normal opacity-60"> {items.find(i => i.id.toString() === form.itemId)?.unit}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Box size={28} />
                </div>
                <h3 className="text-slate-700 dark:text-slate-300 font-bold">Usage Preview</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                  Select an item to see real-time calculation.
                </p>
              </div>
            )}
          </div>

          <div className="bg-sky-50 dark:bg-sky-500/10 rounded-2xl p-6 border border-sky-100 dark:border-sky-500/20 transition-colors">
             <h4 className="font-bold text-sky-800 dark:text-sky-400 text-sm mb-2">Notice</h4>
             <p className="text-xs text-sky-600 dark:text-sky-500 leading-relaxed">
               This action cannot be undone manually through this UI. Any corrections must be made via the Inventory management page.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsagePage;
