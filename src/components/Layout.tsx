import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  activeItem: string;
  onItemSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  activeItem, 
  onItemSelect, 
  searchQuery, 
  onSearchChange, 
  children 
}) => {
  const { profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-50 selection:bg-sky-100 dark:selection:bg-sky-500/30 transition-colors duration-300">
      <div className="print:hidden">
        <Sidebar activeItem={activeItem} onItemSelect={onItemSelect} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="print:hidden">
          <Navbar 
            userName={profile?.full_name} 
            userRole={profile?.role} 
            onProfileClick={() => onItemSelect('settings')}
            searchValue={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300 print:p-0 print:overflow-visible">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
