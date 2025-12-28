
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings, MenuPackage } from '../types';
import { MENUS as INITIAL_MENUS } from '../constants';
import DataManagement from './settings/DataManagement';
import { WALLPAPER_PRESETS } from './ui/Background4K';
import { 
  Cpu, 
  ChevronDown, 
  ShieldAlert, 
  Zap, 
  Settings as SettingsIcon, 
  Database, 
  Sparkles, 
  Globe, 
  Trash2,
  Monitor,
  CheckCircle2,
  Palette,
  Layers,
  Coins,
  Percent,
  Menu,
  Activity,
  Box,
  Wind,
  Plus,
  Edit3,
  Archive,
  Save,
  Undo2,
  BrainCircuit,
  Image as ImageIcon,
  Grid,
  Move,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from './ui/Toast';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  appState: {
    wealth: any;
    customTabs: any;
  };
  onRestore: (data: any) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  aiThinkingMode: true,
  autoRecordConfidence: 0.85,
  aiModelPreference: 'flash',
  compactSidebar: false,
  glassIntensity: 'medium',
  themeAccent: 'teal',
  activeWallpaper: 'default',
  animationsEnabled: true,
  motionEffects: true,
  autoSync: true,
  bgOverlayOpacity: 0.7,
  enableTechGrid: true,
  enableNoise: true,
  techGridPosition: 'back',
  defaultCurrency: 'SAR',
  enableNotifications: true,
  language: 'en',
  paulCommissionRate: 15,
  targetProfitMargin: 20,
};

const ExpandableSection = ({ 
  title, 
  icon: Icon, 
  description, 
  isOpen, 
  onToggle, 
  children 
}: any) => {
  return (
    <motion.div 
      layout 
      className={`
        group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500
        ${isOpen 
          ? "bg-black/60 border-white/20 shadow-4xl shadow-black/50" 
          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"}
      `}
    >
      <div 
        onClick={onToggle}
        className="p-8 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-6">
          <div className={`
            p-4 rounded-2xl transition-all duration-500
            ${isOpen ? "bg-white text-slate-900 shadow-lg scale-110" : "bg-white/5 text-slate-500"}
          `}>
            <Icon size={28} />
          </div>
          <div className="text-left">
            <h3 className={`text-xl font-black tracking-tight transition-colors ${isOpen ? "text-white" : "text-slate-300"}`}>
              {title}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight mt-1">
              {description}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-full border border-white/5 transition-colors ${isOpen ? "bg-white/10 text-white" : "text-slate-500"}`}>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
            <div className="px-8 pb-8 pt-2 border-t border-white/5">
               {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ToggleRow = ({ label, desc, active, onClick, icon: Icon, impact }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/5 last:border-0 group/row gap-4">
    <div className="flex items-start gap-4 flex-1">
      {Icon && <Icon size={18} className={`mt-1 transition-colors ${active ? 'text-blue-400' : 'text-slate-600'}`} />}
      <div className="space-y-1">
        <span className="text-slate-200 font-black text-sm uppercase tracking-widest block">{label}</span>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{desc}</p>
        {impact && (
          <div className="flex items-center gap-2 mt-2 py-1 px-3 bg-white/5 rounded-lg inline-flex">
            <CheckCircle2 size={10} className="theme-accent-text" />
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{impact}</p>
          </div>
        )}
      </div>
    </div>
    <button onClick={onClick} className={`relative w-14 h-8 rounded-full transition-colors duration-300 shrink-0 ${active ? "bg-blue-600 shadow-blue-900/20" : "bg-slate-800"}`}>
      <motion.div layout className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md" animate={{ x: active ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </button>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, appState, onRestore }) => {
  const [openSection, setOpenSection] = useState<string | null>("THEME");
  const [menus, setMenus] = useState<MenuPackage[]>(INITIAL_MENUS);
  const { showToast } = useToast();

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleReset = () => {
    if (confirm('Critical: Factory reset will purge all custom environmental variables. Proceed?')) {
      setSettings(DEFAULT_SETTINGS);
      showToast("System logic reverted to factory defaults.", "SUCCESS");
    }
  };

  const accentColors: Array<{id: AppSettings['themeAccent'], color: string, label: string}> = [
    { id: 'teal', color: '#14b8a6', label: 'Emerald Teal' },
    { id: 'blue', color: '#3b82f6', label: 'Corporate Blue' },
    { id: 'purple', color: '#a855f7', label: 'Neon Purple' },
    { id: 'gold', color: '#eab308', label: 'Royal Gold' }
  ];

  const glassLevels: Array<{id: AppSettings['glassIntensity'], label: string}> = [
    { id: 'low', label: 'Performance' },
    { id: 'medium', label: 'Balanced' },
    { id: 'high', label: 'Immersive' }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-32 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <section className="relative p-12 rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-4xl shadow-4xl overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] theme-accent-bg blur-[120px] rounded-full opacity-10 -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-400 rounded-[2rem] shadow-2xl shadow-blue-900/40 theme-accent-bg">
              <SettingsIcon className="text-white" size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">Control Center</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <Sparkles size={14} className="theme-accent-text" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none">Neural Core v4.1.0 Optimized</p>
              </div>
            </div>
          </div>
          <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">Configure the operational logic streams and aesthetic parameters of your multi-entity enterprise workspace.</p>
        </div>
      </section>

      <div className="space-y-6">
        {/* UI & THEME ENGINE */}
        <ExpandableSection 
          title="UI & Theme Engine" 
          icon={Palette} 
          description="Global accents, glass intensity, and motion effects." 
          isOpen={openSection === "THEME"} 
          onToggle={() => setOpenSection(openSection === "THEME" ? null : "THEME")}
        >
          <div className="py-6 space-y-12">
            
            {/* Background Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pl-1">
                <ImageIcon size={14} className="text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Canvas Ambience (Wallpaper)</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(WALLPAPER_PRESETS).map(([key, url]) => (
                  <button
                    key={key}
                    onClick={() => updateSetting('activeWallpaper', key)}
                    className={`
                      relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300
                      ${settings.activeWallpaper === key ? 'border-white ring-2 ring-white/20 scale-105 z-10' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'}
                    `}
                  >
                    <img src={url} alt={key} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase text-white tracking-wider drop-shadow-md">
                      {key}
                    </span>
                    {settings.activeWallpaper === key && (
                      <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-0.5">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* NEW: VISUAL LAYERS & COMPOSITION */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 pl-1">
                <Layers size={14} className="text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Visual Layers & Composition</label>
              </div>
              
              <div className="bg-white/5 rounded-[2rem] p-6 space-y-8 border border-white/5">
                {/* 1. Overlay Opacity Slider */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                       <Eye size={16} className="text-slate-400" />
                       <div>
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Backdrop Tint Transparency</p>
                         <p className="text-[9px] text-slate-500 font-medium">Control the darkness of the layer above the wallpaper.</p>
                       </div>
                     </div>
                     <span className="px-3 py-1 bg-white/10 text-white rounded-lg font-black text-xs font-mono">{(settings.bgOverlayOpacity * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                    type="range" min="0" max="1" step="0.05"
                    value={settings.bgOverlayOpacity}
                    onChange={(e) => updateSetting('bgOverlayOpacity', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-white"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* 2. Tech Grid Toggle & Position */}
                   <div className="space-y-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-2">
                            <Grid size={16} className="text-blue-400" />
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Tech Circuit Layer</p>
                         </div>
                         <button 
                           onClick={() => updateSetting('enableTechGrid', !settings.enableTechGrid)}
                           className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${settings.enableTechGrid ? "bg-blue-600" : "bg-slate-700"}`}
                         >
                           <motion.div layout className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md" animate={{ x: settings.enableTechGrid ? 16 : 0 }} />
                         </button>
                      </div>
                      
                      {settings.enableTechGrid && (
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => updateSetting('techGridPosition', 'back')}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${settings.techGridPosition === 'back' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                          >
                            <Move size={10} className="rotate-180" /> Backward (Subtle)
                          </button>
                          <button 
                            onClick={() => updateSetting('techGridPosition', 'front')}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${settings.techGridPosition === 'front' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500'}`}
                          >
                            Forward (Bold) <Move size={10} />
                          </button>
                        </div>
                      )}
                   </div>

                   {/* 3. Noise Grain Toggle */}
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                           <Activity size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Film Grain / Noise</p>
                            <p className="text-[9px] text-slate-500 font-medium">Adds texture to solid colors.</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => updateSetting('enableNoise', !settings.enableNoise)}
                         className={`p-2 rounded-xl border transition-all ${settings.enableNoise ? 'bg-white text-slate-900 border-white' : 'text-slate-500 border-white/10 hover:text-white'}`}
                      >
                         {settings.enableNoise ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                   </div>
                </div>
              </div>
            </div>

            {/* Theme Accent Selection */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 pl-1">
                <Box size={14} className="text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">System Accent Identity</label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accentColors.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      updateSetting('themeAccent', acc.id);
                      showToast(`Primary accent switched to ${acc.label}`, "INFO");
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative group
                      ${settings.themeAccent === acc.id ? 'border-white bg-white/10 shadow-2xl z-10' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'}
                    `}
                  >
                    <div className="w-10 h-10 rounded-full shadow-lg border border-white/20" style={{ backgroundColor: acc.color }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">{acc.label}</span>
                    {settings.themeAccent === acc.id && (
                      <motion.div layoutId="accent-check" className="absolute top-2 right-2 text-white bg-blue-600 p-1 rounded-full shadow-md">
                        <CheckCircle2 size={12} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Glass Intensity Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pl-1">
                <Wind size={14} className="text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Blur Refraction (Glass Depth)</label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {glassLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => updateSetting('glassIntensity', level.id)}
                    className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border
                      ${settings.glassIntensity === level.id 
                        ? 'bg-white text-slate-900 border-white shadow-xl scale-[1.02]' 
                        : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'}
                    `}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-600 italic px-2">Performance note: Higher intensity increases GPU utilization for backdrop filters.</p>
            </div>

            {/* Interface Geometry & Effects */}
            <div className="pt-6 border-t border-white/5 space-y-2">
              <ToggleRow 
                label="Compact Command Sidebar" 
                desc="Compress navigation to icons for maximum canvas availability." 
                active={settings.compactSidebar} 
                onClick={() => updateSetting("compactSidebar", !settings.compactSidebar)} 
                icon={Menu} 
              />
              <ToggleRow 
                label="High Fidelity Transitions" 
                desc="Enable spring-physics based morphing for layout changes." 
                active={settings.animationsEnabled} 
                onClick={() => updateSetting("animationsEnabled", !settings.animationsEnabled)} 
                icon={Monitor} 
              />
              <ToggleRow 
                label="Reactive Particle engine" 
                desc="Ambient background motion that reacts to cursor proximity." 
                active={settings.motionEffects} 
                onClick={() => updateSetting("motionEffects", !settings.motionEffects)} 
                icon={Sparkles} 
              />
            </div>
          </div>
        </ExpandableSection>

        {/* SYSTEM REPOSITORY EDITING */}
        <ExpandableSection 
          title="Logic Repositories" 
          icon={Layers} 
          description="Modify hardcoded Menu Packages and Client defaults." 
          isOpen={openSection === "REPOS"} 
          onToggle={() => setOpenSection(openSection === "REPOS" ? null : "REPOS")}
        >
          <div className="py-6 space-y-8">
             <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                   <div className="flex items-center gap-2">
                      <Archive size={14} className="text-slate-500" />
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Catering Menu Packages</label>
                   </div>
                   <button className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
                      <Plus size={12} /> Add New Template
                   </button>
                </div>
                
                <div className="space-y-3">
                   {menus.map((menu, idx) => (
                     <div key={menu.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/20 transition-all flex justify-between items-center">
                        <div>
                           <h4 className="text-sm font-bold text-white mb-1">{menu.name}</h4>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{menu.id}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-800" />
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SAR {menu.base_cost_per_pax}/Pax</span>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"><Edit3 size={14} /></button>
                           <button className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="pt-6 border-t border-white/5">
                <button 
                  onClick={() => showToast("Repository logic synced to local storage.", "SUCCESS")}
                  className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Commit Changes to Database
                </button>
             </div>
          </div>
        </ExpandableSection>

        {/* REGIONAL & BUSINESS LOGIC */}
        <ExpandableSection 
          title="Regional & Logic" 
          icon={Globe} 
          description="Currency, locale, and business profit thresholds." 
          isOpen={openSection === "REGION"} 
          onToggle={() => setOpenSection(openSection === "REGION" ? null : "REGION")}
        >
          <div className="py-6 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block pl-1">Primary Currency Node</label>
                <div className="relative group">
                  <Coins size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:theme-accent-text transition-colors" />
                  <input 
                    type="text"
                    value={settings.defaultCurrency}
                    onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 pl-14 pr-6 py-5 rounded-2xl text-white font-bold outline-none focus:ring-4 theme-accent-ring focus:border-white/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block pl-1">Display Locale</label>
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
                  <button 
                    onClick={() => updateSetting('language', 'en')}
                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all 
                      ${settings.language === 'en' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    English (EN)
                  </button>
                  <button 
                    onClick={() => updateSetting('language', 'ar')}
                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all 
                      ${settings.language === 'ar' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    Arabic (AR)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <Percent size={14} className="text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pricing Algorithm Parameters</label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Partner Commission</p>
                     <span className="px-3 py-1 bg-blue-600/10 text-blue-400 rounded-lg font-black text-xs theme-accent-text">{settings.paulCommissionRate}%</span>
                   </div>
                   <input 
                    type="range" min="0" max="40" step="1"
                    value={settings.paulCommissionRate}
                    onChange={(e) => updateSetting('paulCommissionRate', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                   />
                   <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Baseline referral rate for Paul's sourced events.</p>
                 </div>

                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Target Profit Margin</p>
                     <span className="px-3 py-1 bg-blue-600/10 text-blue-400 rounded-lg font-black text-xs theme-accent-text">{settings.targetProfitMargin}%</span>
                   </div>
                   <input 
                    type="range" min="5" max="75" step="1"
                    value={settings.targetProfitMargin}
                    onChange={(e) => updateSetting('targetProfitMargin', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                   />
                   <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">AI target for multi-entity quote generation engines.</p>
                 </div>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* NEURAL ENGINE CONFIG */}
        <ExpandableSection 
          title="Neural Modules" 
          icon={Cpu} 
          description="Configure Gemini core intelligence and sync protocols." 
          isOpen={openSection === "INTELLIGENCE"} 
          onToggle={() => setOpenSection(openSection === "INTELLIGENCE" ? null : "INTELLIGENCE")}
        >
          <div className="py-4 space-y-6">
            <ToggleRow 
              label="AI Reasoning Engine" 
              desc="Activate deep-thought visualization for complex valuations." 
              active={settings.aiThinkingMode} 
              onClick={() => updateSetting("aiThinkingMode", !settings.aiThinkingMode)} 
              icon={Zap} 
              impact="Increases reasoning precision"
            />
            <ToggleRow 
              label="Realtime Ledger Sync" 
              desc="Maintain transactional consistency across Paul and JAG nodes." 
              active={settings.autoSync} 
              onClick={() => updateSetting("autoSync", !settings.autoSync)} 
              icon={Activity} 
              impact="Automatic Cloud Updates"
            />

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 pl-1 mb-4">
                <BrainCircuit size={14} className="text-slate-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Model Architecture</label>
              </div>
              <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
                <button 
                  onClick={() => updateSetting('aiModelPreference', 'flash')}
                  className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all 
                    ${settings.aiModelPreference === 'flash' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  Gemini Flash (Fast)
                </button>
                <button 
                  onClick={() => updateSetting('aiModelPreference', 'pro')}
                  className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all 
                    ${settings.aiModelPreference === 'pro' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  Gemini Pro (Smart)
                </button>
              </div>
              <p className="text-[9px] text-slate-600 italic px-2 mt-3 font-medium">
                'Pro' enables deeper reasoning for complex quotes but has higher latency. 'Flash' is optimized for speed.
              </p>
            </div>
          </div>
        </ExpandableSection>

        {/* VAULT & RECOVERY */}
        <ExpandableSection 
          title="Vault & Recovery" 
          icon={Database} 
          description="Export encrypted snapshots and restore environments." 
          isOpen={openSection === "VAULT"} 
          onToggle={() => setOpenSection(openSection === "VAULT" ? null : "VAULT")}
        >
          <div className="space-y-12 pt-4">
            <DataManagement settings={settings} appState={appState} onRestore={onRestore} />
            
            <div className="mt-8 pt-10 border-t border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert size={16} className="text-red-500" />
                <h4 className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">Critical Operations Zone</h4>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-red-500/5 p-10 rounded-[3rem] border border-red-500/20">
                <div className="text-center md:text-left space-y-2">
                  <p className="text-sm font-black text-red-100 uppercase tracking-widest">Protocol Factory Reset</p>
                  <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest max-w-sm">Purge all local operational states and revert to default core parameters.</p>
                </div>
                <button 
                  onClick={handleReset} 
                  className="px-10 py-5 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-red-600/30 active:scale-95 flex items-center gap-2"
                >
                  <Undo2 size={14} /> Revert To Defaults
                </button>
              </div>
            </div>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
};

export default Settings;
