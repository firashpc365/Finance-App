
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  DollarSign, 
  ArrowRightLeft, 
  AlertCircle,
  X,
  Loader2,
  Check,
  ExternalLink,
  History,
  Building2
} from "lucide-react";

interface JagDashboardProps {
  wealth: {
    bank: number;
    cash: number;
    jag_pending: number;
    paul_debt: number;
    credit_card: number;
  };
  setWealth: React.Dispatch<React.SetStateAction<{
    bank: number;
    cash: number;
    jag_pending: number;
    paul_debt: number;
    credit_card: number;
  }>>;
  onAddTransaction: (tx: any) => void;
}

const MOCK_INVOICE_REQUESTS = [
  { id: 1, date: "2024-05-20", client: "Paul (Aramco Site)", amount: 15000, status: "PENDING_ISSUE", description: "Catering Services - May Batch", pdfUrl: null },
  { id: 2, date: "2024-05-22", client: "Red Sea Global", amount: 4500, status: "ISSUED", description: "Logistics Support", pdfUrl: "invoice_102.pdf" },
];

const MOCK_HOLDINGS = [
  { id: 101, client: "Paul (Aramco Site)", amount: 12000, received_date: "2024-05-18", status: "HELD_BY_JAG" },
];

const JagDashboard: React.FC<JagDashboardProps> = ({ wealth, setWealth, onAddTransaction }) => {
  const [activeTab, setActiveTab] = useState<"REQUESTS" | "SETTLEMENTS">("REQUESTS");
  const [isLoading, setIsLoading] = useState(true);
  
  // Local Data State
  const [requests, setRequests] = useState(MOCK_INVOICE_REQUESTS);
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);

  // Upload Logic State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Transfer Modal State
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean, holdingId: number | null, amount: number }>({ isOpen: false, holdingId: null, amount: 0 });
  const [transferRef, setTransferRef] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- Upload Handlers ---
  const triggerUpload = (id: number) => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadId === null) return;

    setUploadingId(activeUploadId);
    
    // Simulate Supabase Storage Upload
    console.log(`[Supabase] Initiating secure upload to 'invoices' bucket: ${file.name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update Request State
    setRequests(prev => prev.map(req => {
      if (req.id === activeUploadId) {
        return { ...req, status: "ISSUED", pdfUrl: `supa_storage/v1/invoices/${file.name}` };
      }
      return req;
    }));

    setUploadingId(null);
    setActiveUploadId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Transfer Handlers ---
  const openTransferModal = (holding: typeof MOCK_HOLDINGS[0]) => {
    setTransferModal({ isOpen: true, holdingId: holding.id, amount: holding.amount });
    setTransferRef(`TRX-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
  };

  const confirmTransfer = async () => {
    if (!transferRef.trim()) {
      alert("Please enter a bank transfer reference.");
      return;
    }

    setIsTransferring(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate Bank API logic

    // 1. Update Global Wealth
    setWealth(prev => ({
      ...prev,
      jag_pending: prev.jag_pending - transferModal.amount,
      bank: prev.bank + transferModal.amount
    }));

    // 2. Record Transaction
    onAddTransaction({
      desc: `Settlement from JAG (${transferRef})`,
      amt: `+${transferModal.amount}`,
      cat: "JAG Settlement",
      scope: "BUSINESS",
      date: new Date().toLocaleDateString()
    });

    // 3. Update Local Holdings List
    setHoldings(prev => prev.filter(h => h.id !== transferModal.holdingId));

    setIsTransferring(false);
    setTransferModal({ isOpen: false, holdingId: null, amount: 0 });
  };

  const totalHeld = holdings.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="application/pdf" 
      />

      {/* Header Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">JAG Arabia Portal</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage Invoice Issuance & Fund Transfers</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl flex items-center gap-6 shadow-3xl ring-1 ring-white/5">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Held Balance</p>
            <p className="text-3xl font-black text-emerald-400 tracking-tighter">
              {totalHeld.toLocaleString()} <span className="text-sm font-normal opacity-50">SAR</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden min-h-[600px] shadow-3xl relative group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12 transition-transform group-hover:scale-110">
           <Building2 size={500} />
        </div>

        <div className="flex border-b border-white/5 bg-white/5 relative z-10">
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex-1 p-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative
              ${activeTab === "REQUESTS" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"}
            `}
          >
            <FileText size={18} /> Invoice Requests
            {activeTab === "REQUESTS" && <motion.div layoutId="jagTabLine" className="absolute bottom-0 left-0 w-full h-1 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,1)]" />}
          </button>
          <button
            onClick={() => setActiveTab("SETTLEMENTS")}
            className={`flex-1 p-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative
              ${activeTab === "SETTLEMENTS" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}
            `}
          >
            <ArrowRightLeft size={18} /> Fund Settlements
            {activeTab === "SETTLEMENTS" && <motion.div layoutId="jagTabLine" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />}
          </button>
        </div>

        <div className="p-10 relative z-10">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-3xl w-full" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "REQUESTS" ? (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {requests.map((req) => (
                    <div key={req.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 transition-all rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-sm">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center shadow-inner">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white tracking-tight">{req.client}</h3>
                          <p className="text-sm text-slate-400 font-medium mb-3">{req.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{req.date}</span>
                            <span className="text-[10px] font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full uppercase tracking-widest">SAR {req.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto">
                         {req.status === "PENDING_ISSUE" ? (
                           <button 
                             onClick={() => triggerUpload(req.id)}
                             disabled={uploadingId === req.id}
                             className="w-full md:w-auto flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-teal-500/20 disabled:opacity-50"
                           >
                             {uploadingId === req.id ? (
                               <><Loader2 className="animate-spin" size={16} /> Uploading...</>
                             ) : (
                               <><Upload size={16} /> Link Official PDF</>
                             )}
                           </button>
                         ) : (
                           <div className="flex flex-col gap-2 items-end">
                             <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                               <CheckCircle size={16} /> Issued & Archived
                             </div>
                             <a 
                               href="#" 
                               onClick={(e) => e.preventDefault()} 
                               className="text-[9px] font-bold text-slate-500 flex items-center gap-1 hover:text-teal-400 transition-colors"
                             >
                               <ExternalLink size={10} /> View in Supabase
                             </a>
                           </div>
                         )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="settlements"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-start gap-5 mb-10 backdrop-blur-sm">
                     <AlertCircle className="text-amber-500 shrink-0" size={24} />
                     <p className="text-sm text-amber-200 font-medium leading-relaxed">
                       You are currently holding <strong className="text-white">SAR {totalHeld.toLocaleString()}</strong> in trust. Please initiate a settlement transfer to your main bank account and input the bank reference below.
                     </p>
                  </div>

                  {holdings.length === 0 && (
                     <div className="p-20 text-center text-slate-500 font-medium border border-dashed border-white/10 rounded-[3rem]">
                       All funds settled. No pending transfers.
                     </div>
                  )}

                  {holdings.map((item) => (
                    <div key={item.id} className="bg-white/5 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 backdrop-blur-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                          <DollarSign size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white tracking-tight">Receipt from {item.client}</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Acquired on {item.received_date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Liquid Amount</p>
                          <p className="text-3xl font-black text-white tracking-tighter">{item.amount.toLocaleString()} <span className="text-sm font-normal opacity-30">SAR</span></p>
                        </div>
                        <button 
                          onClick={() => openTransferModal(item)}
                          className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/30 transition-all hover:translate-y-[-4px] active:scale-[0.98]"
                        >
                          Confirm Transfer <ArrowRightLeft size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-10 pt-10 border-t border-white/5">
                    <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                      <History size={14} /> View Settlement History
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Transfer Confirmation Modal */}
      <AnimatePresence>
        {transferModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-lg shadow-4xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-white tracking-tight">Settlement Protocol</h3>
                 <button onClick={() => setTransferModal({ ...transferModal, isOpen: false })} className="text-slate-500 hover:text-white">
                   <X size={24} />
                 </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Transfer Amount</p>
                  <p className="text-4xl font-black text-white tracking-tighter">SAR {transferModal.amount.toLocaleString()}</p>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Bank Reference ID</label>
                   <input 
                      autoFocus
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-mono outline-none focus:ring-2 ring-emerald-500/30"
                      placeholder="e.g. 98210332..."
                   />
                   <p className="text-[9px] text-slate-500 mt-2 italic px-2">Ensure this matches the reference provided in your mobile banking app.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTransferModal({ ...transferModal, isOpen: false })}
                    className="py-5 bg-white/5 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmTransfer}
                    disabled={isTransferring}
                    className="py-5 bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isTransferring ? (
                      <><Loader2 className="animate-spin" size={16} /> Ledgering...</>
                    ) : (
                      <><Check size={16} /> Execute Payout</>
                    )}
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

export default JagDashboard;
