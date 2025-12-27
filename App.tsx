
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Activity, 
  TrendingUp, 
  FolderKanban,
  Users,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Wallet
} from 'lucide-react';
import Layout from './components/Layout';
import TransactionInput from './components/TransactionInput';
import ReceiptScanner from './components/ReceiptScanner';
import MultiCompanyQuoteGenerator from './components/MultiCompanyQuoteGenerator';
import RFQAnalyzer from './components/RFQAnalyzer';
import CRMManagement from './components/CRMManagement';
import Procurement from './components/Procurement';
import FinancialsView from './components/FinancialsView';
import Settings from './components/Settings';
import SmartBackground from './components/SmartBackground';
import JagDashboard from './components/JagDashboard';
import PaulDashboard from './components/PaulDashboard';
import WorkflowBoard from './components/WorkflowBoard';
import Login from './components/Login';
import UserManager from './components/UserManager';
import ServiceManagement from './components/ServiceManagement';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorDisplay from './components/ui/ErrorDisplay';
import { ToastProvider } from './components/ui/Toast';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { SidebarProvider } from './context/SidebarContext';
import { AppMode, UserRole } from './types';

// A subtle, high-tech circuit pattern (SVG Data URI)
const TECH_PATTERN = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23ffffff' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E")`;

const StatCard = ({ title, value, sub, subType, icon: Icon, colorClass, onClick }: any) => {
  // Extract color base for dynamic bg usage (e.g. 'blue' from 'text-blue-400')
  const colorBase = colorClass.replace("text-", "").replace("-400", "");

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group overflow-hidden rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-md cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-${colorBase}-900/20`}
    >
      {/* Background Pattern Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none bg-repeat"
        style={{ backgroundImage: TECH_PATTERN }}
      />

      {/* Liquid Background Overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-${colorBase}-500 z-0`} />

      {/* Glowing Blob */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${colorBase}-500/20 rounded-full blur-3xl group-hover:bg-${colorBase}-500/30 transition-all duration-500 group-hover:scale-150 z-0`} />
      
      <div className="relative z-10 p-8 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3.5 w-fit rounded-xl flex items-center justify-center bg-${colorBase}-500/10 border border-${colorBase}-500/20 ${colorClass} group-hover:text-white group-hover:bg-${colorBase}-500 group-hover:scale-110 transition-all duration-300 shadow-inner`}>
            <Icon size={22} />
          </div>
          <div className={`text-slate-600 group-hover:text-${colorBase}-400 transition-colors duration-300`}>
            <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </div>

        <div className="mt-auto">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-slate-300 transition-colors">{title}</h3>
          <p className="text-3xl font-bold text-white tracking-tight tabular-nums drop-shadow-sm">{value}</p>
          <div className={`flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest ${subType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {subType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{sub}</span>
          </div>
        </div>
      </div>

      {/* Shimmer Border Effect */}
      <div className="absolute inset-0 border border-white/10 rounded-[2rem] group-hover:border-white/20 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
};

const AppContent: React.FC = () => {
  const { settings, setSettings, appMode, setAppMode } = useSettings();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<Error | null>(null);

  // Core Financial State
  const [wealth, setWealth] = useState({
    bank: 45000,
    cash: 2300,
    jag_pending: 12000, 
    paul_debt: 2500,    
    credit_card: 1200
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: UserRole, startMode?: AppMode) => {
    setUserRole(role);
    setIsLoggedIn(true);
    if (startMode) setAppMode(startMode);
    
    if (role === UserRole.PAUL) setActiveTab('paul-portal');
    else if (role === UserRole.JAG) setActiveTab('dashboard');
    else setActiveTab('dashboard');
  };

  const isBusiness = appMode === AppMode.BUSINESS;
  const netWorth = (wealth.bank + wealth.cash + wealth.jag_pending) - (wealth.credit_card + wealth.paul_debt);

  const stats = {
    revenue: 68500,
    pendingQuotes: 4,
    activeJobs: 7,
    clientBase: 142
  };

  const recentActivity = [
    { client: 'Aramco Logistics', action: 'Quote Generated', date: '2h ago', status: 'SENT' },
    { client: 'Red Sea Global', action: 'Settlement Confirmed', date: '5h ago', status: 'PAID' },
    { client: 'SABIC Site B', action: 'Project Update', date: '1d ago', status: 'ACTIVE' },
  ];

  const handleNavigate = (tab: string, subTab?: string, filter?: string) => {
    setActiveTab(tab);
    setActiveSubTab(subTab);
    setActiveFilter(filter);
  };

  if (hasError) {
    return <ErrorDisplay error={errorDetails || new Error("System Logic Mismatch")} reset={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen relative text-slate-100 font-sans">
      <AnimatePresence>{isInitialLoad && <LoadingScreen />}</AnimatePresence>
      
      <div className="fixed inset-0 z-background">
        <SmartBackground mode={appMode} />
      </div>

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <Login key="login-portal" onLogin={handleLogin} />
        ) : (
          <Layout 
            key="dashboard-layout"
            activeTab={activeTab} setActiveTab={handleNavigate} 
            appMode={appMode} toggleAppMode={() => setAppMode(isBusiness ? AppMode.PERSONAL : AppMode.BUSINESS)}
            customTabs={[]} addCustomTab={() => {}}
            deleteCustomTab={() => {}}
            userRole={userRole} settings={settings}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-12 max-w-7xl mx-auto">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]" />
                         <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Executive Overview</p>
                      </div>
                      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                        Financial <span className="text-blue-500">Summary</span>
                      </h1>
                      <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
                        Orchestrating operational fiscal streams across <span className="text-white font-bold">{isBusiness ? 'Corporate Matrix' : 'Private Portfolio'}</span>.
                      </p>
                    </div>
                    
                    <div 
                      onClick={() => handleNavigate('financials')}
                      className="bg-black/40 border border-white/10 backdrop-blur-md p-10 rounded-2xl text-center min-w-[340px] shadow-xl relative overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                      <div className="absolute -left-10 -bottom-10 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                         <Wallet size={180} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 group-hover:text-blue-400 transition-colors relative z-10">Net Liquidity</p>
                      <p className="text-5xl font-bold text-white tracking-tight tabular-nums relative z-10">
                        <span className="text-xl font-normal opacity-30 mr-2">SAR</span>{netWorth.toLocaleString()}
                      </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatCard 
                     title="Pipeline Revenue" 
                     value={`SAR ${stats.revenue.toLocaleString()}`} 
                     sub="+12.4% Cycle Yield" 
                     subType="positive" 
                     icon={TrendingUp} 
                     colorClass="text-blue-400" 
                     onClick={() => handleNavigate('financials')}
                   />
                   <StatCard 
                     title="Pending Items" 
                     value={stats.pendingQuotes} 
                     sub="4 Requires Logic" 
                     subType="negative" 
                     icon={FileText} 
                     colorClass="text-amber-400" 
                     onClick={() => handleNavigate('quotes', undefined, 'DRAFT')}
                   />
                   <StatCard 
                     title="Active Projects" 
                     value={stats.activeJobs} 
                     sub="On Schedule" 
                     subType="positive" 
                     icon={FolderKanban} 
                     colorClass="text-indigo-400" 
                     onClick={() => handleNavigate('projects', undefined, 'ACTIVE')}
                   />
                   <StatCard 
                     title="Managed Entities" 
                     value={stats.clientBase} 
                     sub="+3 Total Growth" 
                     subType="positive" 
                     icon={Users} 
                     colorClass="text-slate-400" 
                     onClick={() => handleNavigate('contacts', 'CLIENT')}
                   />
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-lg relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 opacity-5 rotate-12 pointer-events-none">
                         <Activity size={300} />
                      </div>
                      <div className="flex justify-between items-center mb-12 relative z-10">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-4">
                          <Clock size={20} className="text-slate-600" /> Activity Log
                        </h3>
                        <button onClick={() => handleNavigate('projects')} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">Audit Projects</button>
                      </div>
                      <div className="space-y-4 relative z-10">
                        {recentActivity.map((item, i) => (
                          <div key={i} className="flex items-center gap-8 p-6 rounded-xl border border-white/5 bg-white/5 transition-all group hover:border-white/10 cursor-pointer" onClick={() => handleNavigate('projects', undefined, item.status)}>
                            <div className="p-3 bg-black/40 rounded-lg text-slate-500 group-hover:text-blue-400 transition-all border border-white/5"><Activity size={18} /></div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-white">{item.client}</p>
                              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">{item.action}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-mono font-medium text-slate-600 mb-1.5">{item.date}</p>
                              <span className={`text-[8px] font-bold px-3 py-1 rounded-md border border-blue-500/20 text-blue-400 bg-blue-500/5 uppercase tracking-widest`}>{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="bg-blue-600/90 backdrop-blur-md p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group border border-white/10">
                         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute -right-8 -bottom-8 text-blue-900/40 rotate-12">
                            <Plus size={180} />
                         </div>
                         <h3 className="text-2xl font-bold tracking-tight mb-4 relative z-10">Quick Deploy</h3>
                         <p className="text-blue-100 text-[10px] font-medium uppercase tracking-widest mb-10 opacity-70 relative z-10">Initialize standard workflows</p>
                         <div className="space-y-4 relative z-10">
                            <button onClick={() => handleNavigate('quotes')} className="w-full py-4.5 bg-white text-blue-600 font-bold rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                              <Plus size={18} /> New Quotation
                            </button>
                            <button onClick={() => handleNavigate('expenses')} className="w-full py-4.5 bg-black/20 hover:bg-black/30 text-white font-bold rounded-xl text-xs uppercase tracking-widest border border-blue-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg">
                              <CreditCard size={18} /> Log Expense
                            </button>
                         </div>
                      </div>

                      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-10 rounded-2xl relative overflow-hidden">
                         <div className="absolute -left-6 -top-6 opacity-5 rotate-45">
                            <Activity size={120} />
                         </div>
                         <h3 className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-8 relative z-10">System Health</h3>
                         <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                 <span className="text-slate-600">Ledger Sync</span>
                                 <span className="text-blue-400">99.8% Consistent</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} className="h-full bg-blue-500" />
                              </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            )}
            {activeTab === 'projects' && <WorkflowBoard userRole={userRole} initialFilter={activeFilter} />}
            {activeTab === 'quotes' && <MultiCompanyQuoteGenerator initialFilter={activeFilter} />}
            {activeTab === 'rfq' && <RFQAnalyzer isBusiness={isBusiness} />}
            {activeTab === 'services' && <ServiceManagement initialCategory={activeSubTab as any} />}
            {activeTab === 'contacts' && <CRMManagement initialTab={activeSubTab as any} />}
            {activeTab === 'expenses' && <Procurement initialTab={activeSubTab as any} />}
            {activeTab === 'financials' && <FinancialsView />}
            {activeTab === 'paul-portal' && <PaulDashboard />}
            {activeTab === 'admin-users' && <UserManager />}
            {activeTab === 'settings' && <Settings settings={settings} setSettings={setSettings} appState={{ wealth, customTabs: [] }} onRestore={() => {}} />}
          </Layout>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <SidebarProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SidebarProvider>
  </SettingsProvider>
);

export default App;
