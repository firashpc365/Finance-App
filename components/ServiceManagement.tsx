
import React, { useState, useEffect } from "react";
import { Plus, Tent, Coffee, Gift, Stamp, Package, Edit3, Trash2, Gamepad2, Layers } from "lucide-react";
import ServiceModal from "./services/ServiceModal";
import { ServiceItem, ServiceCategory } from "../types";
import { supabase } from "../lib/supabaseClient";
import FluidCard from "./ui/FluidCard";
import { CardSkeleton } from "./ui/Skeleton";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { SEED_SERVICES } from "../constants";

const TABS: { id: ServiceCategory | 'ALL', label: string, icon: any }[] = [
    { id: 'ALL', label: 'All Services', icon: Layers },
    { id: 'TENT', label: 'Tents', icon: Tent },
    { id: 'CATERING', label: 'Catering', icon: Coffee },
    { id: 'ENTERTAINMENT', label: 'Fun & Games', icon: Gamepad2 },
    { id: 'BRANDING', label: 'Branding', icon: Stamp },
    { id: 'GIFT', label: 'Gifts', icon: Gift },
];

interface ServiceManagementProps {
  initialCategory?: ServiceCategory | 'ALL';
}

export default function ServiceManagement({ initialCategory = 'ALL' }: ServiceManagementProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'ALL'>(initialCategory);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  
  const { execute } = useAsyncAction();

  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Simulate Fetching Data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setServices(SEED_SERVICES);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredServices = services.filter(s => activeCategory === 'ALL' || s.category === activeCategory);

  const handleSuccess = (item?: ServiceItem) => {
    if (!item) return;
    if (editingItem) {
      setServices(prev => prev.map(s => s.id === item.id ? item : s));
    } else {
      setServices(prev => [item, ...prev]);
    }
  };

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Permanently remove this service from the catalog?")) return;
    
    await execute(async () => {
      // Simulate API Delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setServices(prev => prev.filter(s => s.id !== id));
    }, "Service record purged from catalog.");
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  // Helper to determine icon based on category
  const getIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'TENT': return Tent;
      case 'CATERING': return Coffee;
      case 'ENTERTAINMENT': return Gamepad2;
      case 'GIFT': return Gift;
      case 'BRANDING': return Stamp;
      default: return Package;
    }
  };

  // Helper to determine color based on category
  const getColor = (category: ServiceCategory) => {
    switch (category) {
      case 'TENT': return 'text-amber-400';
      case 'CATERING': return 'text-rose-400';
      case 'ENTERTAINMENT': return 'text-purple-400';
      case 'GIFT': return 'text-emerald-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter mb-1">Services Catalog</h1>
           <p className="text-slate-400 font-medium text-sm">Manage packages, pricing logic, and profit margins.</p>
        </div>
        <button 
          onClick={handleCreate} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
           <Plus size={18} /> Add Service
        </button>
      </div>

      {/* CATEGORY TABS (Liquid Style) */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                ${isActive 
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                  : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"}
              `}
            >
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton Loading State
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <FluidCard
              key={service.id}
              title={service.title}
              icon={getIcon(service.category)}
              color={getColor(service.category)}
              value={`SAR ${service.selling_price.toLocaleString()}`}
              sub={
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block border border-emerald-500/20 uppercase tracking-wider">
                  Profit: +{service.profit?.toLocaleString()}
                </span>
              }
            >
               {/* Specs Display */}
               {service.specifications && (
                 <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(service.specifications).slice(0, 2).map(([key, val]: any) => (
                      <span key={key} className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest truncate max-w-[120px]">
                        {val}
                      </span>
                    ))}
                 </div>
               )}

               {/* Includes */}
               <div className="space-y-2 mb-6 min-h-[40px]">
                 {service.includes && Array.isArray(service.includes) && service.includes.slice(0, 2).map((item: string, i: number) => (
                   <div key={i} className="flex items-center gap-3 text-xs font-medium text-slate-400 truncate">
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.8)] shrink-0" /> {item}
                   </div>
                 ))}
               </div>

               {/* Action Buttons */}
               <div className="flex items-center gap-3 pt-4 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); handleEdit(service); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Edit3 size={14} /> Modify Logic
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }} className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-colors border border-white/5 hover:border-red-500/20">
                    <Trash2 size={16}/>
                 </button>
               </div>
            </FluidCard>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/5 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
               <Package size={32} className="text-slate-600" />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">No services found</h3>
            <p className="text-xs text-slate-500">Create a new service entry for the {activeCategory} category.</p>
          </div>
        )}
      </div>

      <ServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleSuccess}
        existingItem={editingItem}
        initialCategory={activeCategory !== 'ALL' ? activeCategory : undefined}
      />
    </div>
  );
}
