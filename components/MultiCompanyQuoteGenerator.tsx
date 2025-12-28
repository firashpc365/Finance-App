
import React, { useState, useRef, useMemo, useEffect, Suspense, lazy } from 'react';
import { COMPANY_CONFIG, CompanyId } from '../lib/companyConfig';
import { QuoteCard } from './quotes/QuoteCard';
import SearchForm from './quotes/SearchForm';
import { 
  Plus, 
  ChevronLeft, 
  CloudUpload, 
  Loader2, 
  Printer, 
  Layers, 
  Trash2,
  Search,
  Check
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { SEED_CLIENTS, SEED_SERVICES } from '../constants';
import { ServiceItem } from '../types';

// LAZY LOAD: The heavy PDF template engine is deferred until the user initiates creation/editing.
const QuotationTemplateLazy = lazy(() => import('./quotes/QuotationTemplate').then(mod => ({ default: mod.QuotationTemplate })));

interface QuotationRecord {
  id: string;
  companyId: CompanyId;
  clientName: string;
  amount: number;
  date: string;
  validity?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  clientAddress: string;
  items: any[];
}

const INITIAL_RECORDS: QuotationRecord[] = [
  { id: 'QT-2024-882', companyId: 'ELITE', clientName: 'Aramco Logistics Hub', amount: 12500, date: '2024-05-20', validity: '15 Days', status: 'SENT', clientAddress: 'Dammam Industrial Area 2', items: [{id: 1, description: 'Catering Services', qty: 100, price: 125}] },
  { id: 'QT-2024-102', companyId: 'JAG', clientName: 'Red Sea Global', amount: 4500, date: '2024-05-22', validity: '30 Days', status: 'APPROVED', clientAddress: 'Tabuk, KSA', items: [{id: 1, description: 'Consultancy', qty: 1, price: 4500}] },
  { id: 'QT-2024-441', companyId: 'TSS', clientName: 'SABIC Procurement', amount: 28000, date: '2024-05-24', validity: '7 Days', status: 'DRAFT', clientAddress: 'Jubail Industrial City', items: [{id: 1, description: 'Event Setup', qty: 1, price: 28000}] },
];

const LedgerSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2rem] h-[340px] animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[flow-loader_2s_infinite]" />
      </div>
    ))}
  </div>
);

interface MultiCompanyQuoteGeneratorProps {
  initialFilter?: string;
}

const MultiCompanyQuoteGenerator: React.FC<MultiCompanyQuoteGeneratorProps> = ({ initialFilter }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [quotes, setQuotes] = useState<QuotationRecord[]>(INITIAL_RECORDS);
  const [selectedCompany, setSelectedCompany] = useState<CompanyId>('ELITE');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Suggestion States
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  
  const quotationRef = useRef<HTMLDivElement>(null);
  const { isLoading: isSaving, execute } = useAsyncAction();

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter);
    }
  }, [initialFilter]);

  const [formData, setFormData] = useState({
    id: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    date: new Date().toISOString().split('T')[0],
    validity: '15 Days',
    clientName: '',
    clientAddress: '',
    items: [{ id: 1, description: '', qty: 1, price: 0 }]
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const total = useMemo(() => {
    const subtotal = formData.items.reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0);
    return subtotal * 1.15;
  }, [formData.items]);

  const handleCreateNew = () => {
    setEditId(null);
    setFormData({
      id: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
      date: new Date().toISOString().split('T')[0],
      validity: '15 Days',
      clientName: '',
      clientAddress: '',
      items: [{ id: 1, description: '', qty: 1, price: 0 }]
    });
    setView('CREATE');
  };

  const handleEdit = (id: string) => {
    const target = quotes.find(q => q.id === id);
    if (!target) return;
    setEditId(id);
    setSelectedCompany(target.companyId);
    setFormData({
      id: target.id,
      date: target.date,
      validity: target.validity || '15 Days',
      clientName: target.clientName,
      clientAddress: target.clientAddress,
      items: target.items.length > 0 ? target.items : [{ id: 1, description: '', qty: 1, price: 0 }]
    });
    setView('CREATE');
  };

  const handleDelete = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveToCloud = async () => {
    await execute(async () => {
      if (!formData.clientName.trim()) throw new Error("Validation: Client Identity required.");
      if (!formData.validity.trim()) throw new Error("Validation: Quote Validity required (e.g., 15 Days).");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecord: QuotationRecord = {
        id: formData.id,
        companyId: selectedCompany,
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        amount: total,
        date: formData.date,
        validity: formData.validity,
        status: editId ? (quotes.find(q => q.id === editId)?.status || 'DRAFT') : 'DRAFT',
        items: formData.items
      };

      if (editId) {
        setQuotes(prev => prev.map(q => q.id === editId ? newRecord : q));
      } else {
        setQuotes(prev => [newRecord, ...prev]);
      }
      setView('LIST');
    }, `Quote ${editId ? 'updated' : 'archived'} successfully.`);
  };

  const handleExport = async () => {
    if (!quotationRef.current) return;
    setIsExporting(true);
    try {
      const element = quotationRef.current;
      const opt = {
        margin: 0,
        filename: `${selectedCompany}_Quote_${formData.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Autocomplete Logic
  const filteredClients = useMemo(() => {
    if (!formData.clientName) return SEED_CLIENTS;
    return SEED_CLIENTS.filter(c => c.name.toLowerCase().includes(formData.clientName.toLowerCase()));
  }, [formData.clientName]);

  const selectClient = (client: any) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientAddress: `${client.email}\n${client.contact || ''}\nVAT: ${client.vat || 'N/A'}`
    }));
    setShowClientSuggestions(false);
  };

  const selectService = (service: ServiceItem, idx: number) => {
    const newItems = [...formData.items];
    newItems[idx].description = service.title;
    newItems[idx].price = service.selling_price;
    setFormData({ ...formData, items: newItems });
    setActiveItemIndex(null);
  };

  const filteredServices = (query: string) => {
    if (!query) return SEED_SERVICES;
    return SEED_SERVICES.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           q.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, quotes, statusFilter]);

  const company = COMPANY_CONFIG[selectedCompany];

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-20">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {view === 'LIST' ? 'Quotation Ledger' : editId ? 'Modify Quote' : 'New Quote Architect'}
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">
            {view === 'LIST' ? 'Manage multi-entity corporate estimates.' : `Creating estimate for ${company.name}`}
          </p>
        </div>
        <div className="flex gap-4">
          {view === 'CREATE' ? (
            <button 
              onClick={() => setView('LIST')} 
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 border border-slate-800 transition-all"
            >
              <ChevronLeft size={18} /> Exit Architect
            </button>
          ) : (
            <button 
              onClick={handleCreateNew} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              <Plus size={18} /> Create New Quote
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg gpu-accelerated">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total Exposure</p>
                <p className="text-3xl font-bold text-white tracking-tight">
                  SAR {quotes.reduce((acc, q) => acc + q.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg gpu-accelerated">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Active Count</p>
                <p className="text-3xl font-bold text-blue-400 tracking-tight">{quotes.length} Quotes</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-lg gpu-accelerated">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Cycle Yield</p>
                <p className="text-3xl font-bold text-emerald-400 tracking-tight">
                  SAR {quotes.filter(q => q.status === 'APPROVED').reduce((acc, q) => acc + q.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <SearchForm onSearch={setSearchQuery} />
              <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shrink-0 overflow-x-auto custom-scrollbar">
                {['ALL', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === status 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            {isInitialLoading ? (
              <LedgerSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredQuotes.map((quote) => (
                  <QuoteCard 
                    key={quote.id} 
                    quote={quote} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    onPrint={(id) => { handleEdit(id); setTimeout(handleExport, 600); }}
                  />
                ))}
                {filteredQuotes.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/50">
                    <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-xs">No records found matching criteria.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="create" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                  <Layers size={20} className="text-blue-500" /> Identity Engine
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(COMPANY_CONFIG) as CompanyId[]).map((id) => (
                      <button 
                        key={id} 
                        onClick={() => setSelectedCompany(id)} 
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedCompany === id ? 'border-blue-600 bg-blue-600/10' : 'border-slate-800 bg-slate-950 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white">{COMPANY_CONFIG[id].name.split(' ')[0]}</p>
                        <p className="text-[8px] text-slate-500 uppercase mt-0.5">{id} Core</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <div className="relative">
                      <input 
                        placeholder="Client Entity Name" 
                        className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all" 
                        value={formData.clientName} 
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                        onFocus={() => setShowClientSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                      />
                      <AnimatePresence>
                        {showClientSuggestions && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50">Suggested Entities</p>
                            {filteredClients.map(c => (
                              <button 
                                key={c.id} 
                                onMouseDown={() => selectClient(c)} // onMouseDown fires before blur
                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex justify-between items-center group"
                              >
                                <span className="text-sm font-bold text-white">{c.name}</span>
                                <Check size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                            {filteredClients.length === 0 && (
                              <div className="px-4 py-3 text-xs text-slate-500 italic">No existing clients found.</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                          type="date"
                          placeholder="Date"
                          className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all" 
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})} 
                       />
                       <input 
                          placeholder="Validity (e.g. 15 Days)" 
                          className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all" 
                          value={formData.validity} 
                          onChange={(e) => setFormData({...formData, validity: e.target.value})} 
                       />
                    </div>

                    <textarea 
                      placeholder="Billing Address" 
                      rows={2} 
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all resize-none" 
                      value={formData.clientAddress} 
                      onChange={(e) => setFormData({...formData, clientAddress: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Line Items</label>
                      <button 
                        onClick={() => setFormData({...formData, items: [...formData.items, {id: Date.now(), description: '', qty: 1, price: 0}]})} 
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-400"
                      >
                        + Add Line
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {formData.items.map((item, idx) => (
                        <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative group">
                          <button 
                            onClick={() => formData.items.length > 1 && setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} 
                            className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <div className="relative mb-2">
                            <input 
                              placeholder="Description" 
                              className="w-full bg-transparent border-b border-slate-800 py-1 text-sm text-white outline-none focus:border-blue-500" 
                              value={item.description} 
                              onFocus={() => setActiveItemIndex(idx)}
                              onBlur={() => setTimeout(() => setActiveItemIndex(null), 200)}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[idx].description = e.target.value;
                                setFormData({...formData, items: newItems});
                              }} 
                            />
                            {activeItemIndex === idx && (
                              <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto custom-scrollbar">
                                {filteredServices(item.description).map(s => (
                                  <button
                                    key={s.id}
                                    onMouseDown={() => selectService(s, idx)}
                                    className="w-full text-left px-3 py-2 hover:bg-white/5 text-xs text-slate-300 flex justify-between"
                                  >
                                    <span>{s.title}</span>
                                    <span className="font-mono opacity-50">{s.selling_price}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Qty" className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white" value={item.qty} onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].qty = parseInt(e.target.value) || 0;
                              setFormData({...formData, items: newItems});
                            }} />
                            <input type="number" placeholder="Price" className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white" value={item.price} onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].price = parseFloat(e.target.value) || 0;
                              setFormData({...formData, items: newItems});
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-6">
                    <button 
                      onClick={handleSaveToCloud} 
                      disabled={isSaving} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />} 
                      Commit to Cloud
                    </button>
                    <button 
                      onClick={handleExport} 
                      disabled={isExporting} 
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />} 
                      Generate PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-8 flex justify-center items-start overflow-hidden">
                <div className="scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.85] origin-top shadow-2xl">
                  <Suspense fallback={
                    <div className="w-[210mm] h-[297mm] bg-white flex flex-col items-center justify-center gap-4 text-slate-300">
                      <Loader2 className="animate-spin text-blue-500" size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">Assembling Template...</p>
                    </div>
                  }>
                    <QuotationTemplateLazy ref={quotationRef} company={company} data={formData} />
                  </Suspense>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiCompanyQuoteGenerator;
