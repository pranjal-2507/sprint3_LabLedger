import React from 'react';
import { Search, Bell, User, MessageCircle } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  userRole?: string;
  onProfileClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  userName = 'Dr. Pranjal', 
  userRole = 'Lab Director', 
  onProfileClick,
  searchValue = '',
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 w-full px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm transition-all"
            placeholder="Search experiments, inventory..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative">
          <MessageCircle size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div 
          className="flex items-center gap-3 pl-2 group cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="text-right hidden sm:block font-medium">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{userName}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:bg-sky-200 dark:group-hover:bg-sky-800 transition-colors">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
