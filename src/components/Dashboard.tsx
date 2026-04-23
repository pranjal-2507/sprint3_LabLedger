import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Package, AlertTriangle, Clock, TrendingUp,
  FlaskConical,
  ArrowUpRight, ArrowDownRight, ShieldAlert, CalendarX2, Loader2,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import type { InventoryItem, UsageLog } from '../types/inventory';
import { useAuth } from '../contexts/AuthContext';

import { getDaysLeft, today } from '../utils/inventory';


const severityColors: Record<string, string> = {
  critical: 'bg-rose-50 border-rose-200 text-rose-700',
  warning: 'bg-orange-50 border-orange-200 text-orange-700',
  notice: 'bg-sky-50 border-sky-200 text-sky-700',
};

const severityBadges: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  warning: 'bg-orange-100 text-orange-700',
  notice: 'bg-sky-100 text-sky-700',
};

const SummaryCard = ({
  title, value, sub, trend, trendUp, icon: Icon, color, highlight,
}: {
  title: string; value: string | number; sub: string;
  trend?: string; trendUp?: boolean; icon: React.ElementType;
  color: string; highlight?: boolean;
}) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
    highlight ? 'border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5' : 'border-slate-100 dark:border-slate-800'
  }`}>
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${color} dark:bg-opacity-10`}>
        <Icon size={22} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
          trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        }`}>
          {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
    </div>
  </div>
);

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; count: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [allInventory, catBreakdown, logs, trends] = await Promise.all([
          inventoryService.fetchItems(),
          inventoryService.getCategoryBreakdown(),
          inventoryService.getRecentUsage(),
          inventoryService.getWeeklyUsage()
        ]);
        setItems(allInventory);
        setCategoryData(catBreakdown);
        setRecentLogs(logs);
        setWeeklyUsage(trends);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const lowStockItems = useMemo(() => 
    items.filter(i => i.quantity <= i.min_stock), [items]);

  const expiringSoon = useMemo(() => {
    return items
      .map(i => ({ 
          ...i, 
          daysLeft: getDaysLeft(i.expiry),
          severity: getDaysLeft(i.expiry) <= 7 ? 'critical' : getDaysLeft(i.expiry) <= 15 ? 'warning' : 'notice'
      }))
      .filter(i => i.daysLeft <= 30 && i.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [items]);

  const statsUsedToday = useMemo(() => {
    const startOfToday = new Date(today).getTime();
    return recentLogs.filter(log => new Date(log.created_at).getTime() >= startOfToday).length;
  }, [recentLogs]);

  const statsUsedThisMonth = useMemo(() => {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    return recentLogs.filter(log => new Date(log.created_at).getTime() >= startOfMonth).length;
  }, [recentLogs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="font-medium">Synthesizing Dashboard view...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Lab Inventory Dashboard</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Inventory Items"
          value={items.length}
          sub={`Across ${categoryData.length} categories`}
          trend="+ Live"
          trendUp
          icon={Package}
          color="bg-sky-50 text-sky-600"
        />
        <SummaryCard
          title="Low Stock Items"
          value={lowStockItems.length}
          sub="Require restocking soon"
          trend={lowStockItems.length > 5 ? 'High Alert' : 'Stable'}
          trendUp={lowStockItems.length <= 5}
          icon={AlertTriangle}
          color="bg-amber-50 text-amber-600"
          highlight={lowStockItems.length > 0}
        />
        <SummaryCard
          title="Items Used Today"
          value={statsUsedToday}
          sub="Latest activity logs"
          trend={statsUsedToday > 0 ? '+ Active' : 'No logs'}
          trendUp={statsUsedToday > 0}
          icon={Clock}
          color="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          title="Usage This Month"
          value={statsUsedThisMonth}
          sub="Total checkout logs"
          trend="+ All time"
          trendUp
          icon={TrendingUp}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg">Inventory Usage Trend</h2>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Daily consumption volume (last 7 days)</p>
            </div>
            <div className={`p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500`}>
              <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Usage"
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="font-bold text-slate-800 dark:text-white text-base">Stock by Category</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Current item count per category</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} className="opacity-10" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <ShieldAlert size={18} className="text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Low Stock Alerts</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">{lowStockItems.length} items need attention</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">All stock levels are healthy.</p>
            ) : lowStockItems.slice(0, 4).map((item) => {
              const pct = Math.round((item.quantity / item.min_stock) * 100);
              return (
                <div key={item.id} className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight truncate">{item.name}</p>
                    <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">
                      {item.quantity} / {item.min_stock} {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-500/20 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                <CalendarX2 size={18} className="text-rose-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Expiry Warnings</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">{expiringSoon.length} items expiring soon</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {expiringSoon.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No upcoming expirations in 30 days.</p>
            ) : expiringSoon.map((item) => {
              return (
                <div key={item.id} className={`p-3 rounded-xl border ${severityColors[item.severity]} dark:bg-opacity-5 dark:border-opacity-20`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight truncate">{item.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${severityBadges[item.severity]}`}>
                      {item.daysLeft}d left
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Expires: {new Date(item.expiry).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <Clock size={18} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Recently Used</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Latest item checkouts</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No usage activity recorded yet.</p>
            ) : recentLogs.map((log) => {
              return (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-500/20 transition-colors flex-shrink-0">
                    <FlaskConical size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{log.item_name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{log.user}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
