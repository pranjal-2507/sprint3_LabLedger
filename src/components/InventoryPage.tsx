import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Search, X, ChevronUp, ChevronDown, ChevronsUpDown,
  Package, AlertTriangle, XCircle, Filter, FlaskConical, Loader2, Trash2, Edit2, RotateCw,
} from 'lucide-react';
import type { InventoryItem, Status, InventoryItemInsert } from '../types/inventory';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../contexts/AuthContext';

import { 
  getStatus, 
  STATUS_STYLE, 
  STATUS_DOT, 
  INVENTORY_CATEGORIES, 
  INVENTORY_UNITS 
} from '../utils/inventory';

const SortIcon = ({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) => {
  if (sortKey !== col) return <ChevronsUpDown size={14} className="text-slate-300" />;
  if (sortDir === 'asc') return <ChevronUp size={14} className="text-sky-500" />;
  return <ChevronDown size={14} className="text-sky-500" />;
};

interface ModalProps {
  onClose: () => void;
  onSave: (item: InventoryItemInsert) => Promise<void>;
  initialData?: InventoryItem;
}

const UNITS = INVENTORY_UNITS;
const CATEGORIES = INVENTORY_CATEGORIES;

const InventoryModal: React.FC<ModalProps> = ({ onClose, onSave, initialData }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || '',
    quantity: initialData?.quantity?.toString() || '',
    min_stock: initialData?.min_stock?.toString() || '10',
    unit: initialData?.unit || 'pcs',
    expiry: initialData?.expiry || '',
    category: initialData?.category || 'Chemicals'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Item name is required';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0)
      e.quantity = 'Enter a valid quantity';
    if (!form.expiry) e.expiry = 'Expiry date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSave({ 
        name: form.name.trim(), 
        quantity: Number(form.quantity),
        min_stock: Number(form.min_stock),
        unit: form.unit, 
        expiry: form.expiry, 
        category: form.category 
      });
      onClose();
    } catch {
      setErrors({ submit: 'Failed to save item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 shadow-2xl" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isEdit ? 'bg-amber-50 text-amber-500' : 'bg-sky-50 text-sky-500'}`}>
              {isEdit ? <Edit2 size={20} /> : <FlaskConical size={20} />}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-none">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? 'Update inventory details' : 'Fill in the details below'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {errors.submit && <p className="text-sm text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100">{errors.submit}</p>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Taq DNA Polymerase"
              className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.name ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-sky-200 focus:border-sky-400'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity <span className="text-rose-400">*</span></label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                placeholder="0"
                className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.quantity ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-sky-200 focus:border-sky-400'
                }`}
              />
              {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min Stock (Alert)</label>
              <input
                type="number"
                min="0"
                value={form.min_stock}
                onChange={e => set('min_stock', e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 focus:bg-white transition-all"
              >
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 focus:bg-white transition-all"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date <span className="text-rose-400">*</span></label>
            <input
              type="date"
              value={form.expiry}
              onChange={e => set('expiry', e.target.value)}
              className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.expiry ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-sky-200 focus:border-sky-400'
              }`}
            />
            {errors.expiry && <p className="text-xs text-rose-500 mt-1">{errors.expiry}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-colors disabled:opacity-50 ${
                isEdit ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-200'
            }`}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

type SortKey = keyof Omit<InventoryItem, 'id'> | 'status';
type SortDir = 'asc' | 'desc' | null;

const InventoryPage: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.fetchItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory. Check your network or Supabase connection.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [user, loadData]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category))).sort()], [items]);

  const processed = useMemo(() => {
    let list = items.map(item => ({ ...item, status: getStatus(item) }));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.unit.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') list = list.filter(i => i.status === statusFilter);
    if (categoryFilter !== 'All') list = list.filter(i => i.category === categoryFilter);

    if (sortKey && sortDir) {
      list.sort((a, b) => {
        let av: string | number = sortKey === 'status' ? a.status : (a as Record<string, unknown>)[sortKey] as string | number;
        let bv: string | number = sortKey === 'status' ? b.status : (b as Record<string, unknown>)[sortKey] as string | number;
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [items, search, statusFilter, categoryFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
  };

  const handleSaveItem = async (itemInsert: InventoryItemInsert) => {
    if (!user || !isAdmin) return;
    try {
      if (editingItem) {
          const updated = await inventoryService.updateItem(editingItem.id, itemInsert);
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          
          await inventoryService.logTransaction({
            item_id: updated.id,
            item_name: updated.name,
            type: 'UPDATE',
            quantity: updated.quantity,
            user: profile?.full_name || 'Admin',
            category: updated.category
          }, user.id);

          setEditingItem(null);
      } else {
          const newItem = await inventoryService.addItem(itemInsert, user.id);
          setItems(prev => [newItem, ...prev]);

          await inventoryService.logTransaction({
            item_id: newItem.id,
            item_name: newItem.name,
            type: 'ADD',
            quantity: newItem.quantity,
            user: profile?.full_name || 'Admin',
            category: newItem.category
          }, user.id);
          
          setShowModal(false);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save changes to the database.');
    }
  };

  const deleteItem = async (id: number) => {
    if (!user || !isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventoryService.deleteItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      alert('Failed to delete item.');
    }
  };

  const inStock = items.filter(i => getStatus(i) === 'In Stock').length;
  const low = items.filter(i => getStatus(i) === 'Low').length;
  const expired = items.filter(i => getStatus(i) === 'Expired').length;

  const cols: { key: SortKey; label: string; width?: string }[] = [
    { key: 'name', label: 'Item Name' },
    { key: 'category', label: 'Category', width: 'w-32' },
    { key: 'quantity', label: 'Quantity', width: 'w-28' },
    { key: 'unit', label: 'Unit', width: 'w-24' },
    { key: 'expiry', label: 'Expiry Date', width: 'w-36' },
    { key: 'status', label: 'Status', width: 'w-28' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Inventory</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{items.length} items total · synced with Supabase</p>
        </div>
        <div className="flex gap-2">
            <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
            >
            <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {isAdmin && (
              <button
              id="add-item-btn"
              onClick={() => { setEditingItem(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md shadow-sky-200 transition-colors"
              >
              <Plus size={16} />
              Add Item
              </button>
            )}
        </div>
      </div>

      {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
              <AlertTriangle size={18} />
              <p className="font-medium">{error}</p>
              <button 
                onClick={loadData}
                className="ml-auto underline decoration-rose-300 dark:decoration-rose-500/50 underline-offset-4 font-bold hover:text-rose-900 dark:hover:text-rose-200"
              >
                  Retry
              </button>
          </div>
      )}

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: items.length, icon: Package, cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' },
          { label: 'In Stock', value: inStock, icon: Package, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
          { label: 'Low Stock', value: low, icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
          { label: 'Expired', value: expired, icon: XCircle, cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${cls}`}>
            <Icon size={15} />
            <span>{value} {label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row gap-3 transition-colors">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="inventory-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search details..."
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/20 focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as Status | 'All')}
            className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/20"
          >
            <option value="All">All Status</option>
            <option>In Stock</option>
            <option>Low</option>
            <option>Expired</option>
          </select>
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/20"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {cols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`text-left px-4 py-3 font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700 transition-colors ${col.width ?? ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                    </div>
                  </th>
                ))}
                {isAdmin && <th className="px-4 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 w-28 uppercase tracking-wider text-[10px]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 text-slate-400">
                        <Loader2 size={32} className="mx-auto mb-3 animate-spin text-sky-500 opacity-60" />
                        <p className="font-medium animate-pulse text-slate-500">Syncing with database...</p>
                    </td>
                  </tr>
              ) : processed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <Package size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No items found</p>
                  </td>
                </tr>
              ) : (
                processed.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-50 dark:border-slate-800 hover:bg-sky-50/40 dark:hover:bg-sky-500/5 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/10'}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{item.unit}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 tabular-nums lowercase">
                      {new Date(item.expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[item.status]} dark:bg-opacity-10`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status]}`} />
                        {item.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setEditingItem(item); setShowModal(true); }}
                            className="p-2 text-slate-300 dark:text-slate-600 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-all"
                            title="Edit item"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && processed.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-medium">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{processed.length}</span> of <span className="font-semibold text-slate-600 dark:text-slate-300">{items.length}</span> items
            </p>
          </div>
        )}
      </div>

      {(showModal || editingItem) && (
        <InventoryModal 
            initialData={editingItem || undefined}
            onClose={() => { setShowModal(false); setEditingItem(null); }} 
            onSave={handleSaveItem} 
        />
      )}
    </div>
  );
};

export default InventoryPage;
