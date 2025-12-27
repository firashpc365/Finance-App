
import React, { useState, useRef } from 'react';
import { scanReceipt, categorizeTransaction } from '../services/geminiService';
import { OCRResult, Scope, TransactionResult } from '../types';
import { FileText, File, Upload, Trash2, CheckCircle, Search, ScanLine } from 'lucide-react';

interface ReceiptScannerProps {
  onAdd: (tx: { desc: string; amt: string; cat: string; scope: Scope; date: string }) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [classification, setClassification] = useState<TransactionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setError(null);
    setSaveSuccess(false);
    setResult(null);
    setClassification(null);
    setPreview(null);
    setFileName(null);
  };

  const processFile = (file: File) => {
    setError(null);
    setSaveSuccess(false);
    setResult(null);
    setClassification(null);
    setFileName(file.name);
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file. Please use JPG, PNG, PDF, or Plain Text.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const fullData = reader.result as string;
      setPreview(fullData);
      setLoading(true);
      try {
        const base64 = fullData.split(',')[1];
        const data = await scanReceipt(base64, file.type);
        if (!data || !data.vendor_name) {
          throw new Error('Structural mismatch in document analysis.');
        }
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError('Analysis failed. Ensure the document is legible and not encrypted.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleCreateTransaction = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const summary = `Vendor: ${result.vendor_name}, Total: ${result.total} ${result.currency}, Items: ${result.items.map(i => i.desc).join(', ')}`;
      const categoryData = await categorizeTransaction(summary);
      setClassification(categoryData);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      onAdd({
        desc: categoryData.description || result.vendor_name,
        amt: `-${result.total}`,
        cat: categoryData.category,
        scope: categoryData.scope,
        date: 'Today'
      });

      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Sync failed during ledger insertion.');
    } finally {
      setIsSaving(false);
    }
  };

  const isPDF = fileName?.toLowerCase().endsWith('.pdf');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-3xl relative overflow-hidden group">
          <div className="absolute -left-10 -bottom-10 opacity-5 rotate-12 transition-transform group-hover:scale-105 pointer-events-none">
             <ScanLine size={200} />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="text-teal-400 text-2xl">📑</span> Document Intelligence
            </h3>
            {preview && !loading && !saveSuccess && (
              <button onClick={resetAll} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
          
          {error && (
            <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 relative z-10">
              <p className="text-sm text-red-400 font-bold leading-relaxed">{error}</p>
            </div>
          )}

          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`aspect-square md:aspect-video border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative z-10 ${
              isDragging ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 hover:border-teal-500/50 hover:bg-white/5'
            }`}
          >
            {preview ? (
              <>
                {isPDF ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50">
                    <FileText size={80} className="text-teal-500 mb-4" />
                    <p className="text-white font-black text-sm px-6 text-center truncate w-full">{fileName}</p>
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                )}
                {loading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Deep OCR Scan...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-10">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                  <Upload className="text-teal-500" size={32} />
                </div>
                <p className="text-white font-black uppercase tracking-[0.2em] text-sm mb-2">Ingest File</p>
                <p className="text-slate-500 text-xs font-medium">Drop Images, PDFs or Text files</p>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/plain" />
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 relative">
            <div className="absolute top-10 right-10 opacity-5 rotate-[-10deg] pointer-events-none">
              <FileText size={180} />
            </div>

            <div className="p-8 bg-white/5 border-b border-white/5 flex justify-between items-center relative z-10">
              <span className="px-4 py-1.5 bg-teal-500/20 text-teal-400 text-[10px] font-black rounded-full uppercase tracking-widest">{result.document_type}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{result.date}</span>
            </div>
            
            <div className="p-10 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h4 className="text-3xl font-black text-white tracking-tighter mb-3">{result.vendor_name}</h4>
                  {result.is_catering_supply && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <CheckCircle size={12} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Catering Asset</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-teal-400 tracking-tighter">
                    {result.total.toLocaleString()} 
                    <span className="text-sm font-normal text-slate-500 ml-1">{result.currency}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-10 bg-black/20 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-white/5 pb-4 flex justify-between">
                  <span>Structured Items</span>
                  <span>Price</span>
                </div>
                <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {result.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">
                        <span className="font-black text-teal-500/50 mr-2">{item.qty}x</span> 
                        {item.desc}
                      </span>
                      <span className="font-mono text-slate-400 font-bold">{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-white/5 border-t border-white/5 relative z-10">
              {saveSuccess ? (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="bg-teal-500/20 text-teal-400 p-6 rounded-[2rem] border border-teal-500/30 flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest">
                    Entry Synchronized
                  </div>
                  <button onClick={resetAll} className="w-full py-5 bg-white text-slate-900 font-black rounded-[2rem] hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest">
                    Next Document
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCreateTransaction}
                  disabled={isSaving}
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-3xl flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSaving ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Classifying...</>
                  ) : (
                    <>
                      <Search size={20} /> 
                      <span className="uppercase tracking-[0.2em] text-xs">Execute Ledger Logic</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : !loading && (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center rounded-[3.5rem] border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
             <div className="relative z-10">
                <Search className="text-slate-700 mb-8 mx-auto" size={64} />
                <p className="font-black text-slate-500 uppercase text-xs tracking-[0.4em] mb-4">Neural Buffer Empty</p>
                <p className="text-[11px] text-slate-600 font-medium">Stage a document to trigger the reasoning core.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
