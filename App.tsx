
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
  Wallet,
  X,
  ChevronRight,
  BarChart3,
  PieChart as PieIcon
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

const StatCard = ({ id, title, value, sub, subType, icon: Icon, colorClass, isExpanded, onExpand, children }: any) => {
  const colorBase = colorClass.replace("text-", "").replace("-400", "");
  
  return (
    <motion.div 
      layoutId={`card-${id}`}
      onClick={onExpand}
      className={`
        relative overflow-hidden rounded-[2.5rem] bg-black/40 border backdrop-blur-md cursor-pointer
        ${isExpanded 
          ? `col-span-1 md:col-span-2 row-span-2 border-${colorBase}-500/50 bg-slate-900/90 z-40 shadow-2xl` 
          : `border-white/10 hover:border-${colorBase}-500/30 hover:shadow-xl`
        }
      `}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Background Pattern Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none bg-repeat"
        style={{ backgroundImage: TECH_PATTERN }}
      />
      
      {!isExpanded && (
        <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${colorBase}-500/20 rounded-full blur-3xl group-hover:bg-${colorBase}-500/30 transition-all duration-500 z-0`} />
      )}

      <div className="relative z-10 p-8 flex flex-col h-full">
        <motion.div layoutId={`card-header-${id}`} className="flex justify-between items-start mb-6">
          <div className={`p-3.5 w-fit rounded-xl flex items-center justify-center bg-${colorBase}-500/10 border border-${colorBase}-500/20 ${colorClass} shadow-inner`}>
            <Icon size={22} />
          </div>
          <div className={`text-slate-600 transition-colors duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
            <ArrowUpRight size={20} />
          </div>
          {isExpanded && (
            <button className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full backdrop-blur-sm">
               <X size={18} />
            </button>
          )}
        </motion.div>

        <div className="mt-auto">
          <motion.h3 layoutId={`card-title-${id}`} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</motion.h3>
          <motion.p layoutId={`card-value-${id}`} className="text-3xl font-bold text-white tracking-tight tabular-nums drop-shadow-sm">{value}</motion.p>
          {!isExpanded && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest ${subType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
               {subType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
               <span>{sub}</span>
             </motion.div>
          )}
        </div>

        {/* Expanded Content View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
              className="mt-8 pt-8 border-t border-white/5"
            >
               {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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

  // Card Expansion State
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

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
    setExpandedCardId(null); // Reset expansions on nav
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  if (hasError) {
    return <ErrorDisplay error={errorDetails || new Error("System Logic Mismatch")} reset={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen relative text-slate-100 font-sans overflow-hidden">
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
              <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
                 {/* Header Area - Compact */}
                 <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />
                         <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400">Executive Overview</p>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                        Financial <span className="text-blue-500">Summary</span>
                      </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="text-right hidden md:block">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Net Liquidity</p>
                          <p className="text-2xl font-black text-white tracking-tight tabular-nums">
                             <span className="text-sm font-normal opacity-30 mr-1">SAR</span>{netWorth.toLocaleString()}
                          </p>
                       </div>
                       <button onClick={() => handleNavigate('financials')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                          <Wallet size={20} className="text-slate-300" />
                       </button>
                    </div>
                 </div>

                 {/* Expandable Grid Layout */}
                 <LayoutGroup>
                   <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                     <StatCard 
                       id="revenue"
                       title="Pipeline Revenue" 
                       value={`SAR ${stats.revenue.toLocaleString()}`} 
                       sub="+12.4% Cycle Yield" 
                       subType="positive" 
                       icon={TrendingUp} 
                       colorClass="text-blue-400" 
                       isExpanded={expandedCardId === 'revenue'}
                       onExpand={() => toggleCardExpansion('revenue')}
                     >
                        <div className="h-48 w-full bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center justify-center relative overflow-hidden">
                           <BarChart3 size={48} className="text-blue-500/20" />
                           <p className="absolute bottom-4 text-[10px] text-blue-400 font-bold uppercase tracking-widest">Revenue Analytics Module</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleNavigate('financials'); }} className="w-full mt-4 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors">Open Financials</button>
                     </StatCard>

                     <StatCard 
                       id="quotes"
                       title="Pending Items" 
                       value={stats.pendingQuotes} 
                       sub="4 Requires Logic" 
                       subType="negative" 
                       icon={FileText} 
                       colorClass="text-amber-400" 
                       isExpanded={expandedCardId === 'quotes'}
                       onExpand={() => toggleCardExpansion('quotes')}
                     >
                        <div className="space-y-3">
                           {[1,2,3,4].map(i => (
                              <div key={i} className="flex justify-between items-center p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                                 <span className="text-xs font-bold text-slate-300">Quote #{8820+i}</span>
                                 <span className="text-[9px] font-black text-amber-500 uppercase">Action Req</span>
                              </div>
                           ))}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleNavigate('quotes', undefined, 'DRAFT'); }} className="w-full mt-6 py-3 bg-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-colors">Process Queue</button>
                     </StatCard>

                     <StatCard 
                       id="projects"
                       title="Active Projects" 
                       value={stats.activeJobs} 
                       sub="On Schedule" 
                       subType="positive" 
                       icon={FolderKanban} 
                       colorClass="text-indigo-400" 
                       isExpanded={expandedCardId === 'projects'}
                       onExpand={() => toggleCardExpansion('projects')}
                     >
                         <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-center">
                               <p className="text-2xl font-black text-indigo-400">3</p>
                               <p className="text-[9px] text-indigo-300/60 font-bold uppercase">Catering</p>
                            </div>
                            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                               <p className="text-2xl font-black text-purple-400">4</p>
                               <p className="text-[9px] text-purple-300/60 font-bold uppercase">Structures</p>
                            </div>
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); handleNavigate('projects', undefined, 'ACTIVE'); }} className="w-full mt-6 py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">Manage Workflow</button>
                     </StatCard>

                     <StatCard 
                       id="clients"
                       title="Managed Entities" 
                       value={stats.clientBase} 
                       sub="+3 Total Growth" 
                       subType="positive" 
                       icon={Users} 
                       colorClass="text-slate-400" 
                       isExpanded={expandedCardId === 'clients'}
                       onExpand={() => toggleCardExpansion('clients')}
                     >
                        <div className="h-40 flex items-center justify-center">
                           <PieIcon size={64} className="text-slate-700" />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleNavigate('contacts', 'CLIENT'); }} className="w-full mt-4 py-3 bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-600 transition-colors">CRM Directory</button>
                     </StatCard>
                   </motion.div>
                 </LayoutGroup>

                 {/* Activity & Shortcuts (Collapsible/Fit) */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                   <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden flex flex-col">
                      <div className="absolute -right-10 -top-10 opacity-5 rotate-12 pointer-events-none">
                         <Activity size={300} />
                      </div>
                      <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                          <Clock size={18} className="text-slate-500" /> Activity Log
                        </h3>
                        <button onClick={() => handleNavigate('projects')} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">Full Audit</button>
                      </div>
                      <div className="space-y-3 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                        {recentActivity.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 transition-all group hover:border-white/10 cursor-pointer hover:bg-white/10" onClick={() => handleNavigate('projects', undefined, item.status)}>
                            <div className="p-2 bg-black/40 rounded-lg text-slate-500 group-hover:text-blue-400 transition-all border border-white/5"><Activity size={16} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{item.client}</p>
                              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">{item.action}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[9px] font-mono font-medium text-slate-600 mb-1">{item.date}</p>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border border-blue-500/20 text-blue-400 bg-blue-500/5 uppercase tracking-widest`}>{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="flex flex-col gap-4">
                      <div className="flex-1 bg-blue-600/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group border border-white/10 flex flex-col justify-center">
                         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute -right-6 -bottom-6 text-blue-900/40 rotate-12">
                            <Plus size={140} />
                         </div>
                         <h3 className="text-xl font-bold tracking-tight mb-2 relative z-10">Quick Deploy</h3>
                         <p className="text-blue-100 text-[10px] font-medium uppercase tracking-widest mb-6 opacity-70 relative z-10">Initialize workflows</p>
                         <div className="space-y-3 relative z-10">
                            <button onClick={() => handleNavigate('quotes')} className="w-full py-3.5 bg-white text-blue-600 font-bold rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-50">
                              <Plus size={16} /> New Quotation
                            </button>
                            <button onClick={() => handleNavigate('expenses')} className="w-full py-3.5 bg-black/20 hover:bg-black/30 text-white font-bold rounded-xl text-xs uppercase tracking-widest border border-blue-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg">
                              <CreditCard size={16} /> Log Expense
                            </button>
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
