
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  FileText, 
  CheckSquare, 
  Truck, 
  TrendingDown, 
  Clock, 
  Search, 
  ExternalLink, 
  PackageCheck, 
  X, 
  Plus, 
  DollarSign, 
  Package, 
  History, 
  Utensils, 
  Wrench, 
  Layers, 
  Hash,
  Tag,
  Star,
  Edit3,
  Trash2,
  ChevronRight,
  Phone,
  Mail,
  Contact,
  MoreVertical,
  Save
} from "lucide-react";
import { SupplierItem, PurchaseOrder, POStatus } from "../types";
import { useAsyncAction } from "../hooks/useAsyncAction";

const INITIAL_SUPPLIERS: SupplierItem[] = [
  { id: 1, name: "Almarai Wholesale", category: "Food & Bev", rating: "4.8", contact: "+966 11 470 0005" },
  { id: 2, name: "Saco Hardware", category: "Equipment", rating: "4.5", contact: "800 124 0900" },
  { id: 3, name: "Bin Zagr Co", category: "Logistics", rating: "4.2", contact: "+966 12 647 1111" },
  { id: 4, name: "Naizak Global", category: "Equipment", rating: "4.0", contact: "+966 13 882 1111" },
];

const INITIAL_POS: PurchaseOrder[] = [
  { id: "PO-8821", supplier: "Almarai Wholesale", items: "Milk, Laban, Yogurt (Bulk)", amount: 4500, status: "DELIVERED", date: "2024-10-25" },
  { id: "PO-9002", supplier: "Saco Hardware", items: "Generators, Cables", amount: 12500, status: "IN_TRANSIT", date: "2024-10-28" },
  { id: "PO-9115", supplier: "Bin Zagr Co", items: "Frozen Meat Pallets", amount: 28000, status: "SENT", date: "2024-11-01" },
];

interface ProcurementProps {
  initialTab?: 'PO' | 'SUPPLIERS';
}

const Procurement: React.FC<ProcurementProps> = ({ initialTab }) => {
  const { execute } = useAsyncAction();
  const [activeTab, setActiveTab] = useState<'PO' | 'SUPPLIERS'>('PO');
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  
  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Partial<SupplierItem>>({});

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Supplier CRUD
  const handleEditSupplier = (supplier: SupplierItem) => {
    setEditingSupplier(supplier);
    setSupplierFormData({ ...supplier });
    setIsSupplierModalOpen(true);
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormData({ category: "Food & Bev", rating: "4.0" });
    setIsSupplierModalOpen(true);
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm("Are you sure you want to remove this supplier?")) return;
    
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }, "Supplier removed.");
  };

  const saveSupplier = () => {
    if (!supplierFormData.name) return alert("Name is required");
    
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...supplierFormData } as SupplierItem : s));
    } else {
      const newSupplier: SupplierItem = {
        id: Date.now(),
        name: supplierFormData.name || "",
        category: supplierFormData.category || "General",
        rating: supplierFormData.rating || "0.0",
        contact: supplierFormData.contact || ""
      };
      setSuppliers(prev => [newSupplier, ...prev]);
    }
    setIsSupplierModalOpen(false);
  };

  const getStatusColor = (status: POStatus) => {
    switch(status) {
      case 'DRAFT': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'SENT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_TRANSIT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PAID': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
             <ShoppingCart className="text-blue-500" size={32} /> Procurement
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage Supply Chain & Vendor Relations</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab("PO")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === "PO" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            <FileText size={14}/> Purchase Orders
          </button>
          <button 
            onClick={() => setActiveTab("SUPPLIERS")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === "SUPPLIERS" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >
            <Truck size={14}/> Supplier Directory
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === "PO" ? (
         <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
               <Package size={200} />
            </div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div className="relative group w-full max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                  <input 
                    placeholder="Search PO ID, Supplier..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                  />
               </div>
               <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95">
                 <Plus size={16} /> New PO
               </button>
            </div>

            <div className="space-y-3 relative z-10">
               {purchaseOrders.map((po) => (
                 <div key={po.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all cursor-pointer">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                       <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                          <FileText size={20} />
                       </div>
                       <div>
                          <p className="font-bold text-white text-base">{po.supplier}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{po.items}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</p>
                          <p className="text-sm font-bold text-white">SAR {po.amount.toLocaleString()}</p>
                       </div>
                       
                       <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(po.status)}`}>
                          {po.status.replace('_', ' ')}
                       </div>
                       
                       <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={18} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           <div 
             onClick={handleCreateSupplier}
             className="bg-slate-900/50 border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group min-h-[280px]"
           >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Plus size={32} />
              </div>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Register New Supplier</p>
           </div>

           {suppliers.map(supplier => (
             <div key={supplier.id} className="bg-slate-900/80 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 duration-500">
                   <Truck size={120} />
                </div>

                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                        {supplier.category}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEditSupplier(supplier)} className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors">
                           <Edit3 size={14} />
                         </button>
                         <button onClick={() => handleDeleteSupplier(supplier.id)} className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors">
                           <Trash2 size={14} />
                         </button>
                      </div>
                   </div>

                   <h3 className="text-xl font-black text-white tracking-tight mb-2">{supplier.name}</h3>
                   
                   <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3 text-slate-400">
                         <Star size={14} className="text-amber-500" />
                         <span className="text-xs font-bold">{supplier.rating} / 5.0 Rating</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                         <Contact size={14} className="text-emerald-500" />
                         <span className="text-xs font-bold">{supplier.contact || "No Contact Info"}</span>
                      </div>
                   </div>
                   
                   <button className="w-full mt-8 py-3 bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      View Catalog
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Supplier Modal */}
      <AnimatePresence>
        {isSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
             >
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-white tracking-tight">{editingSupplier ? 'Edit Supplier' : 'New Supplier'}</h3>
                   <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier Name</label>
                      <input 
                        value={supplierFormData.name || ''}
                        onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-emerald-500"
                        placeholder="e.g. Acme Supplies"
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                        <select 
                          value={supplierFormData.category || 'General'}
                          onChange={e => setSupplierFormData({...supplierFormData, category: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-emerald-500 appearance-none"
                        >
                           <option value="Food & Bev">Food & Bev</option>
                           <option value="Equipment">Equipment</option>
                           <option value="Logistics">Logistics</option>
                           <option value="Labor">Labor</option>
                           <option value="General">General</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rating (0-5)</label>
                        <input 
                          type="number"
                          step="0.1"
                          max="5"
                          value={supplierFormData.rating || ''}
                          onChange={e => setSupplierFormData({...supplierFormData, rating: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-emerald-500"
                          placeholder="4.5"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Details</label>
                      <input 
                        value={supplierFormData.contact || ''}
                        onChange={e => setSupplierFormData({...supplierFormData, contact: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-emerald-500"
                        placeholder="Phone or Email"
                      />
                   </div>

                   <button 
                     onClick={saveSupplier}
                     className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 mt-4"
                   >
                     <Save size={16} /> Save Record
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Procurement;
