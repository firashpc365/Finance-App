
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  Briefcase,
  Wallet,
  Calculator,
  Percent,
  TrendingUp,
  ArrowRight,
  DollarSign
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const MOCK_QUOTES = [
  { id: 1, project: "Aramco Maintenance", status: "PENDING", date: "2024-05-25", items: "100x Chicken Mandi", value: 15000 },
  { id: 2, project: "Site B Construction", status: "READY", date: "2024-05-24", value: 12500 },
];

const PaulDashboard: React.FC = () => {
  const { settings } = useSettings();
  const [rfqText, setRfqText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Simulator State
  const [simProjectValue, setSimProjectValue] = useState<number>(50000);

  const handleSendRFQ = () => {
    if (!rfqText.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setRfqText("");
      setIsSending(false);
      alert("RFQ Submitted to ElitePro Engine.");
    }, 1500);
  };

  // Calculate earnings based on the global rate setting
  const rate = settings.paulCommissionRate;
  const totalEarnings = MOCK_QUOTES.reduce((acc, q) => acc + (q.value * (rate / 100)), 0);
  const simCommission = simProjectValue * (rate / 100);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Partner Portal: Paul</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Submit Requests & Track Live Quotations</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                 <Wallet size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Projected Pipeline</p>
                 <p className="text-xl font-black text-white">SAR {totalEarnings.toLocaleString()}</p>
              </div>
           </div>
           <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
             <Briefcase size={28} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Actions & Simulator */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* RFQ Input */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tighter mb-8 flex items-center gap-3">
                <PlusCircle className="text-blue-400" /> New Service Request
              </h3>
              
              <div className="space-y-6">
                <textarea
                  value={rfqText}
                  onChange={(e) => setRfqText(e.target.value)}
                  placeholder="Tell us what you need... e.g., 'Catering for 80 pax at Site 14, standard menu, delivery at 12:00 PM next Tuesday.'"
                  className="w-full px-8 py-8 bg-black/30 border border-white/5 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/20 text-white font-medium min-h-[180px] resize-none placeholder:opacity-20 backdrop-blur-sm"
                />
                
                <button
                  onClick={handleSendRFQ}
                  disabled={isSending || !rfqText.trim()}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] uppercase tracking-widest"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Send size={18} /> Transmit RFQ</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Commission Simulator */}
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-[3rem] p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Calculator size={120} className="text-emerald-500" />
             </div>
             
             <div className="relative z-10">
                <h3 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
                   <TrendingUp className="text-emerald-400" size={24} /> Profit Simulator
                </h3>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Deal Value (SAR)</label>
                      <input 
                         type="number" 
                         value={simProjectValue}
                         onChange={(e) => setSimProjectValue(Number(e.target.value))}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-white outline-none focus:border-emerald-500/50"
                      />
                   </div>

                   <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 flex flex-col gap-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                         <span>Logic Breakdown</span>
                      </div>
                      <div className="flex items-center justify-between">
                          <div className="text-center">
                            <span className="block text-xl font-black text-white">{simProjectValue.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Deal Value</span>
                          </div>
                          <span className="text-emerald-500 font-black">×</span>
                          <div className="text-center">
                            <span className="block text-xl font-black text-emerald-400">{rate}%</span>
                            <span className="text-[9px] text-emerald-500/70 font-bold uppercase">Rate</span>
                          </div>
                          <span className="text-emerald-500 font-black">=</span>
                          <div className="text-center">
                            <span className="block text-2xl font-black text-white tracking-tighter shadow-emerald-500/50 drop-shadow-sm">{simCommission.toLocaleString()}</span>
                            <span className="text-[9px] text-emerald-400 font-bold uppercase">Your Share</span>
                          </div>
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium italic text-center">
                      *Calculated based on current agreed commission rate of {rate}%.
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Active List */}
        <div className="xl:col-span-7">
          <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl min-h-[600px] relative overflow-hidden">
            <div className="absolute -right-20 top-20 opacity-5 rotate-90">
               <Briefcase size={300} />
            </div>

            <h3 className="text-xl font-black text-white tracking-tight mb-8 relative z-10 flex items-center gap-3">
              <MessageSquare size={20} className="text-blue-400" /> Active Negotiations
            </h3>

            <div className="space-y-4 relative z-10">
              {MOCK_QUOTES.map((q) => {
                 const qComm = q.value * (rate/100);
                 return (
                  <div key={q.id} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white">{q.project}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-400">
                             <Clock size={12} /> {q.date}
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        q.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                       <p className="text-sm text-slate-300 font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                         {q.items}
                       </p>
                       
                       {/* Calculation Breakdown Box */}
                       <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/50 border border-white/5 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Value</span>
                             <span className="text-lg font-bold text-slate-200">SAR {q.value.toLocaleString()}</span>
                          </div>
                          
                          <div className="h-8 w-px bg-white/10 mx-2"></div>
                          
                          <div className="flex flex-col items-center">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rate</span>
                             <span className="text-lg font-bold text-blue-400">{rate}%</span>
                          </div>

                          <div className="h-8 w-px bg-white/10 mx-2"></div>

                          <div className="flex flex-col text-right">
                             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Your Share</span>
                             <span className="text-xl font-black text-emerald-400 tracking-tight">SAR {qComm.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaulDashboard;
