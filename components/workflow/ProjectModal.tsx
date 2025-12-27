
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Calendar, DollarSign, User, Loader2, PieChart, TrendingUp } from "lucide-react";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { UserRole } from "../../types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  projectToEdit?: any; 
  userRole?: UserRole;
}

export default function ProjectModal({ isOpen, onClose, onSave, projectToEdit, userRole = UserRole.ADMIN }: ProjectModalProps) {
  const { execute, isLoading } = useAsyncAction();
  const isAdmin = userRole === UserRole.ADMIN;
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    deadline: "",
    total_amount: "",
    cost: "",
    paul_share: "",
    status: "ACTIVE"
  });

  // Load Data if Editing
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setFormData({
          title: projectToEdit.title || "",
          client_name: projectToEdit.client_name || "",
          deadline: projectToEdit.deadline || "",
          total_amount: projectToEdit.total_amount ? projectToEdit.total_amount.toString() : "0",
          cost: projectToEdit.cost ? projectToEdit.cost.toString() : "0",
          paul_share: projectToEdit.paul_share ? projectToEdit.paul_share.toString() : "0",
          status: projectToEdit.status || "ACTIVE"
        });
      } else {
        // Reset if Creating New
        setFormData({ title: "", client_name: "", deadline: "", total_amount: "", cost: "", paul_share: "", status: "ACTIVE" });
      }
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await execute(async () => {
      // 1. Validation
      if (!formData.title.trim() || !formData.client_name.trim()) throw new Error("Title and Client are required.");

      const payload = {
        id: projectToEdit?.id, // Pass ID if editing
        title: formData.title,
        client_name: formData.client_name,
        deadline: formData.deadline,
        total_amount: Number(formData.total_amount) || 0,
        cost: Number(formData.cost) || 0,
        paul_share: Number(formData.paul_share) || 0,
        status: formData.status
      };

      await onSave(payload);
      onClose();
    }, projectToEdit ? "Project updated successfully" : "New project created");
  };

  const revenue = Number(formData.total_amount) || 0;
  const cost = Number(formData.cost) || 0;
  const commission = Number(formData.paul_share) || 0;
  const netProfit = revenue - cost - commission;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal Panel */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950/80 backdrop-blur-2xl border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">
                {projectToEdit ? "Edit Project Logic" : "Initialize Project"}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Title</label>
                  <input 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-colors"
                    placeholder="e.g. Q1 Marketing Campaign"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      value={formData.client_name}
                      onChange={e => setFormData({...formData, client_name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-colors"
                      placeholder="Client Company Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Core */}
              <div className="pt-6 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <PieChart size={16} className="text-teal-500" />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Financial Matrix</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                    <span>Total Revenue</span>
                    {isAdmin && <span className="text-teal-400">Input Total Value</span>}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="number"
                      value={formData.total_amount}
                      onChange={e => setFormData({...formData, total_amount: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold focus:border-teal-500/50 focus:bg-teal-500/5 outline-none transition-colors"
                      placeholder="0.00"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cost Basis</label>
                      <input 
                        type="number"
                        value={formData.cost}
                        onChange={e => setFormData({...formData, cost: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-rose-200 font-bold focus:border-rose-500/50 focus:bg-rose-500/5 outline-none transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Partner Comm.</label>
                      <input 
                        type="number"
                        value={formData.paul_share}
                        onChange={e => setFormData({...formData, paul_share: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-amber-200 font-bold focus:border-amber-500/50 focus:bg-amber-500/5 outline-none transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Profit Calculator Visualization */}
                {isAdmin && (
                  <div className={`p-5 rounded-2xl border ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} flex items-center justify-between`}>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Profit Forecast</p>
                      <p className={`text-2xl font-black tracking-tighter ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        SAR {netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margin</p>
                      <div className={`flex items-center justify-end gap-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp size={16} />
                        <span className="text-xl font-black">{margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isAdmin && (
                   <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Your Commission Share</p>
                      <p className="text-2xl font-black text-amber-300 tracking-tighter">SAR {commission.toLocaleString()}</p>
                   </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workflow State</label>
                <div className="grid grid-cols-3 gap-2">
                  {['ACTIVE', 'PENDING', 'COMPLETED'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setFormData({...formData, status})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.status === status 
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                          : "bg-black/20 border-white/10 text-slate-500 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-900/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Configuration</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
