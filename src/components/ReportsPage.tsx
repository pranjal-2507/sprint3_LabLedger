import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingDown, 
  AlertCircle, 
  Calendar, 
  Download,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import type { InventoryItem } from '../types/inventory';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; total: number }[]>([]);
  const [catVolume, setCatVolume] = useState<{ category: string; volume: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [allInventory, topUsage, volumeData] = await Promise.all([
          inventoryService.fetchItems(),
          inventoryService.getTopUsage(),
          inventoryService.getCategoryVolume()
        ]);
        setItems(allInventory);
        setTopItems(topUsage);
        setCatVolume(volumeData);
      } catch (err) {
        console.error('Reports load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleExportPDF = () => {
    window.print();
  };

  const expiryOutlook = useMemo(() => {
    const now = new Date();
    const outlook = {
      '30 Days': 0,
      '60 Days': 0,
      '90 Days': 0
    };

    items.forEach(item => {
      const exp = new Date(item.expiry);
      const diff = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (diff > 0 && diff <= 30) outlook['30 Days']++;
      else if (diff > 30 && diff <= 60) outlook['60 Days']++;
      else if (diff > 60 && diff <= 90) outlook['90 Days']++;
    });

    return Object.entries(outlook).map(([period, count]) => ({ period, count }));
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Generating analytics report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-sky-500" size={24} />
            Inventory Analytics
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">In-depth insights into lab consumption and asset distribution</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium shadow-sm active:scale-95"
           >
             <Download size={16} />
             Export PDF
           </button>
        </div>
      </div>

      <div className="space-y-8 print:p-8 print:bg-white" ref={reportContentRef}>
        <div className="hidden print:block mb-10 border-b pb-6">
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">LabLedger <span className="text-sky-600">Analytics</span></h2>
          <p className="text-sm text-slate-500 mt-2">Inventory Report Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden transition-colors print:shadow-none print:border print:border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500 print:bg-rose-50 print:text-rose-500">
                <TrendingDown size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white print:text-black">Top Consumption</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Items with highest usage volume (all-time)</p>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical" margin={{ left: 40, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden transition-colors print:shadow-none print:border print:border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500 print:bg-indigo-50 print:text-indigo-500">
                <PieChartIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white print:text-black">Stock Volume by Category</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Total quantity of items held per category</p>
              </div>
            </div>
            
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catVolume}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="volume"
                    nameKey="category"
                  >
                    {catVolume.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 lg:col-span-1 transition-colors print:shadow-none print:border print:border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500 print:bg-amber-50 print:text-amber-500">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white print:text-black">Expiry Outlook</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Projected item expirations in the coming months</p>
              </div>
            </div>
            
            <div className="space-y-4">
               {expiryOutlook.map((item, idx) => (
                 <div key={item.period} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md print:bg-slate-50 print:border-slate-200">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${idx === 0 ? 'bg-rose-400' : idx === 1 ? 'bg-amber-400' : 'bg-sky-400'}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 print:text-black">{item.period}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Expiring in this window</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-slate-800 dark:text-white print:text-black">{item.count}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Items</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group print:bg-sky-600 print:from-sky-600 print:to-sky-600 print:shadow-none">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform print:hidden text-white">
                  <Calendar size={80} />
                </div>
                <div className="relative">
                  <p className="text-sky-100 text-sm font-medium print:text-sky-50">Total Assets Tracked</p>
                  <h4 className="text-4xl font-black mt-2">
                    {items.reduce((acc, i) => acc + i.quantity, 0)}
                  </h4>
                  <p className="text-xs text-sky-100/70 mt-4 flex items-center gap-1 print:text-white/80">
                    Across all units <ChevronRight size={12} />
                  </p>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors print:shadow-none print:border-slate-200">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Active Categories</p>
                  <h4 className="text-4xl font-black text-slate-800 dark:text-white mt-2 print:text-black">{catVolume.length}</h4>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 print:border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Health Score</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full print:bg-emerald-50 print:text-emerald-600">Good</span>
                </div>
             </div>

             <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 text-white sm:col-span-2 border dark:border-slate-800 transition-colors print:bg-slate-50 print:text-black print:border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest print:text-slate-500">Report Insights</h4>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse print:bg-emerald-600 print:animate-none" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium print:text-slate-700">
                  Your lab is currently maintaining a <span className="text-sky-400 print:text-sky-600">healthy stock volume</span>. 
                  However, {expiryOutlook[0].count} items require immediate attention as they expire within 30 days. 
                  Usage of <span className="text-sky-400 print:text-sky-600">{topItems[0]?.name || 'N/A'}</span> is at its peak this period.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
