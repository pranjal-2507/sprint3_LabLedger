import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Download, 
  Loader2, 
  Package, 
  ArrowRightLeft 
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import type { Transaction } from '../types/inventory';
import { useAuth } from '../contexts/AuthContext';

const TYPE_STYLE: Record<string, string> = {
  'USE': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  'ADD': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  'UPDATE': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  'DEFAULT': 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const LedgerPage: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await inventoryService.fetchTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        (t.item_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        t.user.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      
      const tDate = new Date(t.created_at).setHours(0,0,0,0);
      const matchesStart = !dateFilter.start || tDate >= new Date(dateFilter.start).getTime();
      const matchesEnd = !dateFilter.end || tDate <= new Date(dateFilter.end).getTime();

      return matchesSearch && matchesType && matchesStart && matchesEnd;
    });
  }, [transactions, search, typeFilter, dateFilter]);

  const exportToCSV = () => {
    const headers = ['Date', 'Item', 'Type', 'Quantity', 'User'];
    const rows = filteredTransactions.map(t => [
      new Date(t.created_at).toLocaleString(),
      t.item_name || 'N/A',
      t.type,
      t.quantity,
      t.user
    ]);

    const content = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LabLedger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-sky-500" size={24} />
            Inventory Ledger
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Chronological audit trail of all stock movements</p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-95 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4 transition-colors">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search item or user..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
          />
        </div>

        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none font-medium"
          >
            <option value="All">All Types</option>
            <option value="USE">Usage (USE)</option>
            <option value="ADD">Restock (ADD)</option>
            <option value="UPDATE">Correction (UPDATE)</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
           <div className="relative flex-1">
             <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="date"
               value={dateFilter.start}
               onChange={e => setDateFilter(f => ({ ...f, start: e.target.value }))}
               className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
             />
           </div>
           <span className="text-slate-300 dark:text-slate-700">to</span>
           <div className="relative flex-1">
             <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="date"
               value={dateFilter.end}
               onChange={e => setDateFilter(f => ({ ...f, end: e.target.value }))}
               className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
             />
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Timestamp</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Item Name</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Type</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Quantity</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 size={32} className="mx-auto mb-3 animate-spin text-sky-500 opacity-60" />
                    <p className="font-semibold text-slate-400 dark:text-slate-500">Loading history...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="text-slate-300 dark:text-slate-600" size={24} />
                    </div>
                    <p className="font-semibold text-slate-400 dark:text-slate-500">No records found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-500/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(t.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
                          <Package size={14} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">{t.item_name || 'Unknown Item'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${TYPE_STYLE[t.type] || TYPE_STYLE.DEFAULT}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${t.type === 'USE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {t.type === 'USE' ? '-' : '+'}{t.quantity}
                        </span>
                        <ArrowRightLeft size={12} className="text-slate-300" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{t.user}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredTransactions.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-50 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Showing <span className="font-bold text-slate-600 dark:text-slate-300">{filteredTransactions.length}</span> audit logs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerPage;
