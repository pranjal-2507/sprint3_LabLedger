import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database, 
  Monitor,
  Globe,
  Mail,
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { settingsService, type UserProfile } from '../services/settingsService';
import { useAuth } from '../contexts/AuthContext';

interface SettingsPageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onProfileUpdate?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isDarkMode, onToggleDarkMode, onProfileUpdate }) => {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    role: '' as any
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const data = await settingsService.getProfile(user.id);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await settingsService.updateProfile(profile, user.id);
      await refreshProfile();
      setShowToast(true);
      if (onProfileUpdate) onProfileUpdate();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Save failed: ${err.message || 'Unknown error'}. \n\nCheck if profiles table exists and RLS is disabled or correctly set.`);
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    ...(authProfile?.role === 'admin' ? [{ id: 'data', label: 'Inventory Data', icon: Database }] : []),
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="animate-spin text-sky-500" size={32} />
        <p className="text-slate-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 relative">
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
          <span className="font-bold">Settings saved successfully!</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="text-sky-500" size={24} />
          Account Settings
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Manage your lab profile, security, and interface preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
           {navItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                 activeTab === item.id 
                 ? 'bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-none' 
                 : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400'
               }`}
             >
               <item.icon size={18} />
               {item.label}
             </button>
           ))}
        </div>

        <div className="md:col-span-2">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Profile Information</h3>
                    <p className="text-xs text-slate-400">Your public lab identity</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
                      <input 
                        type="text" 
                        value={profile.role}
                        readOnly
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="email" 
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm"
                        />
                     </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-200 dark:shadow-none hover:bg-sky-600 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="animate-spin" size={18} />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                     <Monitor size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800 dark:text-white">Interface Appearance</h3>
                     <p className="text-xs text-slate-400">Customize how LabLedger looks on your screen</p>
                   </div>
                 </div>

                 <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-amber-400' : 'bg-white text-sky-500 shadow-sm'}`}>
                        {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-slate-400">Switch between light and dark themes</p>
                      </div>
                   </div>
                   
                   <button 
                     onClick={onToggleDarkMode}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                       isDarkMode ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
                     }`}
                   >
                     <span
                       className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                         isDarkMode ? 'translate-x-6' : 'translate-x-1'
                       }`}
                     />
                   </button>
                 </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Notification Settings</h3>
                      <p className="text-xs text-slate-400">Choose what alerts you want to receive</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {[
                      { title: 'Email Alerts', desc: 'Critical stock levels and expiry warnings' },
                      { title: 'System Notifications', desc: 'In-app alerts for daily team activity' },
                      { title: 'Weekly Reports', desc: 'Summary of lab usage and trends' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.title}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                        <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 dark:bg-slate-700">
                          <span className="inline-block h-3 w-3 translate-x-1 rounded-full bg-white" />
                        </button>
                      </div>
                    ))}
                 </div>
               </section>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'data') && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 shadow-sm text-center">
                 <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                   <Lock size={32} />
                 </div>
                 <h3 className="font-bold text-slate-800 dark:text-white text-lg">Under Maintenance</h3>
                 <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                   The {activeTab} section is currently being updated to support lab-wide encryption. 
                 </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default SettingsPage;
