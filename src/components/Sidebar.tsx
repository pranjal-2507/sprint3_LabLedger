import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Activity, 
  BookOpen, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  FlaskConical,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'usage', label: 'Usage', icon: Activity },
  { id: 'ledger', label: 'Ledger', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeItem: string;
  onItemSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemSelect }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const visibleMenuItems = menuItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        "relative flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300",
        "shadow-sm z-50"
      )}
    >
      <div className="flex items-center h-16 px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-xl text-white">
            <FlaskConical size={20} />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl text-slate-800 dark:text-white tracking-tight whitespace-nowrap"
              >
                LabLedger
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-left",
                isActive 
                  ? "bg-sky-50 text-sky-600 font-medium dark:bg-sky-500/10 dark:text-sky-400" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
              )}
              title={isCollapsed ? item.label : ""}
            >
              <div className={cn(
                "flex items-center justify-center min-w-[24px]",
                isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )}>
                <Icon size={20} />
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap overflow-hidden text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-sky-500 rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-2">
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <div className="flex items-center justify-center min-w-[24px]">
            <LogOut size={20} />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap overflow-hidden text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
