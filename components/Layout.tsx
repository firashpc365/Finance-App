
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, 
  PieChart, 
  FileText, 
  Settings, 
  Plus, 
  Menu, 
  User,
  LogOut,
  CreditCard,
  ChevronDown,
  LayoutDashboard,
  Users,
  List,
  Target,
  ShieldCheck,
  Search,
  ChevronLeft,
  X,
  PlusCircle,
  Package,
  Loader2,
  Tent,
  Coffee
} from 'lucide-react';
import { AppMode, UserRole, AppSettings } from '../types';
import { useToast } from './ui/Toast';
import { useSidebar } from '../context/SidebarContext';
import { useAsyncAction } from '../hooks/useAsyncAction';

interface NavItem {
  name: string;
  id: string;
  subTab?: string;
  icon: any;
  subItems?: { name: string; id: string; subTab?: string; icon: any }[];
  roles: UserRole[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string, subTab?: string) => void;
  appMode: AppMode;
  toggleAppMode: () => void;
  customTabs: any[];
  addCustomTab: () => void;
  deleteCustomTab: (id: string) => void;
  userRole: UserRole;
  settings: AppSettings;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  appMode, 
  toggleAppMode,
  userRole,
  settings
}) => {
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobileMenu, closeMobileMenu } = useSidebar();
  const [showLoader, setShowLoader] = useState(false);
  const { showToast } = useToast();
  const { execute, isLoading: isSidebarLoading } = useAsyncAction();
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  const isBusiness = appMode === AppMode.BUSINESS;

  const NAV_GROUPS: NavGroup[] = useMemo(() => [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", id: "dashboard", icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.JAG] },
      ]
    },
    {
      title: "Operations",
      items: [
        { 
          name: "Projects", 
          id: "projects",
          icon: FolderKanban,
          roles: [UserRole.ADMIN, UserRole.PAUL],
          subItems: [
            { name: "Active Projects", id: "projects", icon: Target },
            { name: "Partner Portal", id: "paul-portal", icon: User },
          ] 
        },
        {
          name: "Services Catalog",
          id: "services",
          icon: Package,
          roles: [UserRole.ADMIN],
          subItems: [
             { name: "Full Inventory", id: "services", icon: List },
             { name: "Tents & Structures", id: "services", subTab: "TENT", icon: Tent },
             { name: "Catering", id: "services", subTab: "CATERING", icon: Coffee }
          ]
        },
        { 
          name: "Quotations", 
          id: "quotes",
          icon: FileText,
          roles: [UserRole.ADMIN, UserRole.PAUL],
          subItems: [
            { name: "All Quotes", id: "quotes", icon: List },
            { name: "Create New", id: "quotes", icon: PlusCircle },
          ] 
        },
      ]
    },
    {
      title: "Management",
      items: [
        { 
          name: "Expenses", 
          id: "expenses",
          icon: CreditCard,
          roles: [UserRole.ADMIN],
          subItems: [
            { name: "Purchase Orders", id: "expenses", subTab: "PO", icon: Package },
            { name: "Financials", id: "financials", icon: PieChart },
          ] 
        },
        { 
          name: "Contacts", 
          id: "contacts",
          icon: Users,
          roles: [UserRole.ADMIN],
          subItems: [
            { name: "Clients", id: "contacts", subTab: "CLIENT", icon: Users },
            { name: "Suppliers", id: "expenses", subTab: "SUPPLIERS", icon: Target },
          ] 
        },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Access Control", id: "admin-users", icon: ShieldCheck, roles: [UserRole.ADMIN] },
        { name: "Settings", id: "settings", icon: Settings, roles: [UserRole.ADMIN, UserRole.JAG] },
      ]
    }
  ], []);

  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    if (['projects', 'paul-portal', 'quotes', 'services'].includes(activeTab)) return ["Operations"];
    if (['expenses', 'financials', 'contacts'].includes(activeTab)) return ["Management"];
    return ["Overview"];
  });

  const toggleGroup = (title: string) => {
    if (isCollapsed) toggleSidebar();
    setExpandedGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleLogout = async () => {
    // 1. Immediate Feedback
    showToast("Securely signing out...", "INFO");

    // 2. Execute Teardown (Mocking Supabase signOut and Router Refresh)
    await execute(async () => {
      // Simulate network teardown and cache invalidation
      await new Promise(r => setTimeout(r, 1200));
    });

    // 3. Safe Redirect
    window.location.reload();
  };

  useEffect(() => {
    setShowLoader(true);
    
    // Smooth scroll to top when active tab changes
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const timer = setTimeout(() => setShowLoader(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleNavClick = (id: string, subTab?: string) => {
    setActiveTab(id, subTab);
    closeMobileMenu();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex overflow-hidden bg-slate-950/30 backdrop-blur-sm">
      {/* PERFORMANCE: Optimized Progress Indicator */}
      <div className="fixed top-0 left-0 w-full z-loader h-[2px] pointer-events-none">
        {showLoader && (
          <div className="h-full flow-loader-active bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)]" />
        )}
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 h-full w-72 bg-slate-950/90 backdrop-blur-xl border-r border-white/10 z-[60] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                   <h2 className="font-bold text-white text-lg">FinanceFlow</h2>
                 </div>
                 <button onClick={closeMobileMenu} className="p-2 text-slate-400 hover:text-white transition-colors">
                   <X size={20}/>
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {NAV_GROUPS.map((group, idx) => {
                  const hasVisibleItems = group.items.some(item => item.roles.includes(userRole));
                  if (!hasVisibleItems) return null;
                  return (
                    <div key={idx} className="mb-6">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-2">{group.title}</h3>
                      <div className="space-y-1">
                        {group.items.filter(item => item.roles.includes(userRole)).map((item) => (
                           <div key={item.id}>
                             <button 
                               onClick={() => handleNavClick(item.id, item.subTab)}
                               className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                             >
                                <item.icon size={18} />
                                <span className="font-bold text-sm">{item.name}</span>
                             </button>
                             {item.subItems && (
                               <div className="mt-1 ml-6 pl-4 border-l border-white/5 space-y-1">
                                 {item.subItems.map(sub => (
                                   <button key={sub.name} onClick={() => handleNavClick(sub.id, sub.subTab)} className="w-full p-2 text-xs font-medium text-slate-500 hover:text-slate-300 text-left">
                                     {sub.name}
                                   </button>
                                 ))}
                               </div>
                             )}
                           </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR - COLLAPSIBLE GLASS */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className="hidden md:flex flex-col h-screen bg-slate-950/60 backdrop-blur-xl border-r border-white/5 z-sidebar relative shrink-0 transition-all duration-300 ease-in-out"
      >
        <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[32px] w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">F</div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-sm font-black text-slate-100 leading-none tracking-tight">FinanceFlow</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Enterprise Core</p>
                  {isSidebarLoading && (
                    <Loader2 size={10} className="animate-spin text-blue-400" />
                  )}
                </div>
              </motion.div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={toggleSidebar} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-3 space-y-7 mt-4">
          {NAV_GROUPS.map((group) => {
            const hasVisibleItems = group.items.some(item => item.roles.includes(userRole));
            if (!hasVisibleItems) return null;

            return (
              <div key={group.title}>
                {!isCollapsed && (
                  <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-3 truncate">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.filter(item => item.roles.includes(userRole)).map((item) => {
                    const isExpanded = expandedGroups.includes(item.name);
                    const isPathActive = activeTab === item.id || item.subItems?.some(s => s.id === activeTab);
                    const Icon = item.icon;

                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={() => item.subItems ? toggleGroup(item.name) : handleNavClick(item.id, item.subTab)}
                          className={`
                            w-full flex items-center rounded-xl text-sm font-bold transition-all group relative overflow-hidden
                            ${isCollapsed ? "justify-center px-0 py-3.5" : "justify-between px-4 py-2.5"}
                            ${isPathActive && !item.subItems 
                              ? "text-white shadow-lg shadow-blue-900/20 border border-blue-500/30" 
                              : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}
                          `}
                        >
                          {/* Liquid Background for Active State */}
                          {isPathActive && !item.subItems && (
                            <div className="absolute inset-0 bg-blue-600/20 blur-md rounded-xl pointer-events-none" />
                          )}

                          <div className="flex items-center gap-4 relative z-10">
                            <Icon size={18} className={isPathActive ? "text-white" : "opacity-40 group-hover:opacity-100"} />
                            {!isCollapsed && <span className="tracking-tight truncate">{item.name}</span>}
                          </div>
                          {!isCollapsed && item.subItems && (
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-300 opacity-40 group-hover:opacity-100 relative z-10 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          )}
                          {isCollapsed && (
                            <div className="absolute left-16 bg-slate-900 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 uppercase tracking-[0.2em] shadow-2xl">
                              {item.name}
                            </div>
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {item.subItems && isExpanded && !isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-6 pl-4 border-l border-white/5 space-y-1"
                            >
                              {item.subItems.map((sub) => {
                                const isSubActive = activeTab === sub.id && (!sub.subTab || sub.subTab === undefined); // Adjusted logic, but effectively usually controlled by parent component passing subTab down
                                return (
                                  <button
                                    key={sub.name}
                                    onClick={() => handleNavClick(sub.id, sub.subTab)}
                                    className={`
                                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors text-left relative overflow-hidden
                                      ${activeTab === sub.id ? "text-blue-400 bg-blue-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}
                                    `}
                                  >
                                    <sub.icon size={12} className="opacity-40" />
                                    {sub.name}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          {isCollapsed ? (
            <button onClick={toggleSidebar} className="w-full flex justify-center p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10 group relative">
               <ChevronLeft size={20} className="rotate-180" />
               <div className="absolute left-16 bg-slate-900 border border-white/10 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 uppercase tracking-[0.2em] shadow-2xl">
                  Expand Interface
               </div>
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              disabled={isSidebarLoading}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSidebarLoading ? (
                <Loader2 size={18} className="animate-spin text-red-400" />
              ) : (
                <LogOut size={18} className="group-hover:text-red-400" />
              )}
              <span className="text-sm font-medium">
                {isSidebarLoading ? "Signing out..." : "Log Out"}
              </span>
            </button>
          )}
        </div>
      </motion.aside>

      {/* MAIN CONTENT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative z-content transition-all duration-300">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 z-sticky-header sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white transition-all bg-white/5 border border-white/10"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block w-96 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search ledger, entities, or protocols..." 
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-400 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 focus:bg-white/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] font-black text-white leading-none">Firash Al-Qahtani</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase mt-1 tracking-widest">{userRole}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                </div>
             </div>
          </div>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
