
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Mail,
  ArrowRight,
  Loader2,
  ChevronDown,
  UserCircle,
  Zap,
  Globe,
  ShieldCheck,
  LayoutGrid,
  Cpu
} from 'lucide-react';
import { UserRole, AppMode } from '../types';
import { useToast } from './ui/Toast';
import MotionParticles from './ui/MotionParticles';

interface LoginProps {
  onLogin: (role: UserRole, startMode?: AppMode) => void;
}

const IS_DEV_MODE = true; 

const DEV_USERS = [
  { name: "Firash (Admin)", email: "admin@financeflow.com", role: UserRole.ADMIN, desc: "Full System Access" },
  { name: "Paul (Partner)", email: "paul@financeflow.com", role: UserRole.PAUL, desc: "RFQ & Project Portal" },
  { name: "JAG (Proxy)", email: "jag@financeflow.com", role: UserRole.JAG, desc: "Settlement & Holding" },
];

const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="text-white font-bold text-sm">{title}</h4>
      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState(DEV_USERS[0]);
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    showToast(IS_DEV_MODE ? `Authenticating ${selectedUser.name.split(' ')[0]}...` : "Verifying credentials...", "INFO");
    
    // Simulate complex handshake
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showToast("Session secured. Decrypting workspace...", "SUCCESS");
    
    setTimeout(() => {
      onLogin(IS_DEV_MODE ? selectedUser.role : UserRole.ADMIN);
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-blue-500/30">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <MotionParticles />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#020617] to-slate-950 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-screen">
        
        {/* Left Column: Brand Hero */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">System Operational v4.2</span>
            </div>
            
            <h1 className="text-6xl font-black text-white tracking-tighter leading-[1.1]">
              The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Modern Capital</span>
            </h1>
            
            <p className="text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
              Orchestrate multi-entity finances, automate procurement logic, and leverage neural AI for predictive estimation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <FeatureItem icon={Cpu} title="Neural Core" desc="Gemini-powered transaction categorization and OCR." />
            <FeatureItem icon={Globe} title="Multi-Entity" desc="Seamlessly manage Personal, JAG, and Partner ledgers." />
            <FeatureItem icon={ShieldCheck} title="Zero-Trust Vault" desc="Encrypted local-first snapshots with cloud redundancy." />
            <FeatureItem icon={LayoutGrid} title="Adaptive UI" desc="Context-aware interfaces for Admin, Partner, and Proxy." />
          </div>
        </motion.div>

        {/* Right Column: Auth Module */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-4xl relative overflow-hidden">
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-2xl shadow-blue-900/40 border border-white/10">
                  F
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Identify to Access Terminal</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {IS_DEV_MODE ? (
                  <div className="space-y-4">
                     <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Developer Bypass</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active</span>
                        </div>
                        <div className="space-y-3">
                           {DEV_USERS.map((u) => (
                             <button
                               key={u.email}
                               type="button"
                               onClick={() => setSelectedUser(u)}
                               className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                 selectedUser.email === u.email 
                                   ? "bg-blue-600 text-white border-blue-500 shadow-lg" 
                                   : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/5"
                               }`}
                             >
                               <div className="p-1.5 rounded-lg bg-white/10">
                                  <UserCircle size={16} />
                               </div>
                               <div className="text-left flex-1">
                                  <p className="text-xs font-bold leading-none">{u.name}</p>
                                  <p className="text-[9px] font-medium opacity-70 mt-1">{u.desc}</p>
                               </div>
                               {selectedUser.email === u.email && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Identity</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          type="email" 
                          placeholder="user@enterprise.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Security Key</label>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          type="password" 
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold shadow-inner"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/30 transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-[0.2em] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> establishing uplink...</>
                  ) : (
                    <><Zap size={16} className="fill-white" /> Initialize Session</>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          <p className="text-center text-slate-600 text-[9px] font-bold mt-8 uppercase tracking-[0.3em] opacity-60">
            Encrypted End-to-End • 256-bit SSL
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
