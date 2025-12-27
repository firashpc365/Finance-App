
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, Users, Save, X, Target } from "lucide-react";
import { ClientItem } from "../types";
import { useAsyncAction } from "../hooks/useAsyncAction";

interface CRMManagementProps {
  initialTab?: "CLIENT";
}

const CRMManagement: React.FC<CRMManagementProps> = () => {
  const { execute } = useAsyncAction();
  const [clients, setClients] = useState<ClientItem[]>([
    { id: 1, name: "Aramco Systems", contact: "+966 50 123 4567", vat: "3000123456789", email: "procure@aramco.com" },
    { id: 2, name: "Red Sea Global", contact: "+966 55 999 8888", vat: "3000987654321", email: "contracts@redsea.com" }
  ]);

  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this record permanently?")) return;
    
    await execute(async () => {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 600));
      setClients(prev => prev.filter(i => i.id !== id));
    }, "Client record deleted.");
  };

  const handleSave = () => {
    if (!formData.name) return alert("Name is required!");

    const newItem: ClientItem = { 
      id: formData.id || Date.now(),
      name: formData.name,
      contact: formData.contact || "",
      vat: formData.vat || "",
      email: formData.email || ""
    };
    if(isEditing && isEditing !== 0) setClients(prev => prev.map(i => i.id === isEditing ? newItem : i));
    else setClients([...clients, newItem]);
    
    closeForm();
  };

  const openForm = (item?: any) => {
    setFormData(item || {});
    setIsEditing(item ? item.id : 0);
  };

  const closeForm = () => {
    setIsEditing(null);
    setFormData({});
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Client Relations</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage Entity Profiles & Contract Data</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button 
            className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all bg-blue-600 text-white shadow-lg"
          >
            <Users size={14}/> Clients Directory
          </button>
        </div>
      </div>

      <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl relative group">
        <div className="absolute -right-20 -bottom-20 opacity-5 rotate-12 transition-transform group-hover:scale-105 pointer-events-none">
           <Users size={300} />
        </div>

        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10">
           <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
             <Target size={16} className="text-teal-400" /> 
             Entity Directory
           </h3>
           <button 
            onClick={() => openForm()} 
            className="bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-teal-900/40 transition-all active:scale-95"
           >
             <Plus size={16}/> New Entry
           </button>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white/5 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em]">
              <tr>
                <th className="p-8">Identification</th>
                <th className="p-8">Communication Vector</th>
                <th className="p-8">Governance (VAT)</th>
                <th className="p-8 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((item: any) => (
                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-8">
                    <p className="font-black text-white text-lg tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{item.email}</p>
                  </td>
                  <td className="p-8">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400">
                      {item.contact}
                    </span>
                  </td>
                  <td className="p-8">
                    <span className="font-mono text-slate-400 font-bold">{item.vat}</span>
                  </td>
                  <td className="p-8 text-right flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openForm(item)} className="p-3 bg-white/5 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isEditing !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-lg shadow-4xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {isEditing === 0 ? "Entry Initialization" : "Logic Revision"}
                </h3>
                <button onClick={closeForm} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Corporate Name</label>
                  <input 
                    autoFocus
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-2 ring-teal-500/30"
                    value={formData.name || ""}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Cloud Identity (Email)</label>
                    <input type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" 
                      value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Mobile</label>
                      <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" 
                        value={formData.contact || ""} onChange={e => setFormData({...formData, contact: e.target.value})} />
                      </div>
                      <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Tax ID / VAT</label>
                      <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold" 
                        value={formData.vat || ""} onChange={e => setFormData({...formData, vat: e.target.value})} />
                      </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-12 pt-8 border-t border-white/5">
                  <button onClick={closeForm} className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 transition-all">Abortion Protocol</button>
                  <button onClick={handleSave} className="flex-1 py-5 bg-teal-500 hover:bg-teal-400 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white flex justify-center items-center gap-2 shadow-xl shadow-teal-900/40 transition-all active:scale-95">
                    <Save size={18}/> Commit to Ledger
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMManagement;
