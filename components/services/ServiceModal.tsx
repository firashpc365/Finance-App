
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Upload, FileText, Image as ImageIcon, Wand2, Loader2, DollarSign } from "lucide-react";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ServiceItem, ServiceCategory } from "../../types";
import { supabase } from "../../lib/supabaseClient";
import { GoogleGenAI, Type } from "@google/genai";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item?: ServiceItem) => void;
  existingItem?: ServiceItem | null;
}

export default function ServiceModal({ isOpen, onClose, onSuccess, existingItem }: ServiceModalProps) {
  const { execute, isLoading } = useAsyncAction();
  
  // Creation Mode: MANUAL or AI_IMPORT
  const [mode, setMode] = useState<'MANUAL' | 'AI'>('MANUAL');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "TENT",
    selling_price: 4500,
    cost_price: 3500,
    size: "6x12m",
    tent_type: "Beach Tent",
    includes: "Majlis seating, Basic rugs, Installation & Removal",
  });

  useEffect(() => {
    if (existingItem) {
      setFormData({
        title: existingItem.title,
        category: existingItem.category,
        selling_price: existingItem.selling_price,
        cost_price: existingItem.cost_price,
        size: existingItem.specifications?.size || "6x12m",
        tent_type: existingItem.specifications?.type || "Beach Tent",
        includes: existingItem.includes ? existingItem.includes.join(', ') : "",
      });
    } else {
      // Reset defaults
      setFormData({
        title: "",
        category: "TENT",
        selling_price: 4500,
        cost_price: 3500,
        size: "6x12m",
        tent_type: "Beach Tent",
        includes: "Majlis seating, Basic rugs, Installation & Removal",
      });
    }
  }, [existingItem, isOpen]);

  // INTELLIGENCE: Auto-calculate Profit for Display
  const profit = Number(formData.selling_price) - Number(formData.cost_price);
  const margin = Number(formData.selling_price) > 0 ? ((profit / Number(formData.selling_price)) * 100).toFixed(1) : "0.0";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', // High-fidelity vision model
          contents: {
            parts: [
              { inlineData: { mimeType: file.type, data: base64 } },
              { text: "Analyze this image/document. Extract service details for a catering/event company. If costs aren't visible, estimate reasonable values." }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["TENT", "CATERING", "BRANDING", "GIFT"] },
                selling_price: { type: Type.NUMBER },
                cost_price: { type: Type.NUMBER },
                size: { type: Type.STRING },
                tent_type: { type: Type.STRING },
                includes: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "category", "selling_price", "cost_price", "includes"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}");
        
        setFormData({
          title: data.title || "New Service",
          category: data.category || "TENT",
          selling_price: data.selling_price || 0,
          cost_price: data.cost_price || 0,
          size: data.size || "",
          tent_type: data.tent_type || "",
          includes: data.includes ? data.includes.join(', ') : ""
        });
        
        setMode('MANUAL'); // Switch to manual to show filled data
        setIsAiProcessing(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("AI Analysis failed", error);
      setIsAiProcessing(false);
      alert("Could not extract data from the file.");
    }
  };

  const handleSubmit = async () => {
    await execute(async () => {
      // Construct JSON based on category
      const specs: any = {};
      if (formData.category === 'TENT') {
        specs.size = formData.size;
        specs.type = formData.tent_type;
      }
      
      const includesArray = formData.includes.split(',').map(s => s.trim()).filter(s => s);

      const payload = {
        title: formData.title,
        category: formData.category,
        selling_price: Number(formData.selling_price),
        cost_price: Number(formData.cost_price),
        specifications: specs,
        includes: includesArray,
        status: 'AVAILABLE' as const
      };

      // Simulate API latency for Demo
      await new Promise(r => setTimeout(r, 800));

      onSuccess({
        id: existingItem?.id || Date.now(),
        ...payload,
        category: payload.category as ServiceCategory
      });
      onClose();
    }, existingItem ? "Service updated" : "Service added to catalog");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]" 
          />
          
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-950/90 backdrop-blur-2xl border-l border-white/10 z-[70] shadow-4xl flex flex-col"
          >
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {mode === 'AI' ? <Wand2 className="text-purple-400" size={20}/> : <Save className="text-blue-400" size={20}/>}
                {mode === 'AI' ? "AI Smart Import" : (existingItem ? "Edit Service" : "New Service")}
              </h2>
              <button onClick={onClose}><X className="text-slate-400 hover:text-white" size={20} /></button>
            </div>

            {/* Mode Switcher */}
            <div className="p-4 grid grid-cols-2 gap-2">
               <button onClick={() => setMode('MANUAL')} className={`p-2 text-xs font-bold rounded-lg border transition-colors ${mode === 'MANUAL' ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-slate-400'}`}>Manual Entry</button>
               <button onClick={() => setMode('AI')} className={`p-2 text-xs font-bold rounded-lg border transition-colors ${mode === 'AI' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/10 text-slate-400'}`}>Import from File</button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* --- AI MODE --- */}
              {mode === 'AI' && (
                <div className="space-y-6 text-center py-10 animate-in fade-in slide-in-from-right-4">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 transition-colors cursor-pointer group bg-white/5"
                   >
                      {isAiProcessing ? (
                        <div className="flex flex-col items-center">
                          <Loader2 size={40} className="text-purple-400 animate-spin mb-4" />
                          <h3 className="text-white font-bold animate-pulse">Analyzing Asset...</h3>
                          <p className="text-xs text-slate-400 mt-2">Extracting specs and pricing logic</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 text-purple-400 transition-colors">
                            <Upload size={32} />
                          </div>
                          <h3 className="text-white font-bold">Upload Spec Sheet or Image</h3>
                          <p className="text-xs text-slate-400 mt-2">Supports PDF, JPG, PNG. AI will extract pricing and dimensions.</p>
                        </>
                      )}
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileSelect} 
                     className="hidden" 
                     accept="image/*,application/pdf"
                   />
                   
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center gap-2 border border-white/5 transition-colors">
                        <ImageIcon size={24} className="text-emerald-400"/>
                        <span className="text-xs text-slate-300 font-bold">From Photo</span>
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center gap-2 border border-white/5 transition-colors">
                         <FileText size={24} className="text-blue-400"/>
                         <span className="text-xs text-slate-300 font-bold">Bulk CSV</span>
                      </button>
                   </div>
                </div>
              )}

              {/* --- MANUAL MODE --- */}
              {mode === 'MANUAL' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                  {/* Category Select */}
                  <div className="grid grid-cols-4 gap-2">
                    {['TENT', 'CATERING', 'BRANDING', 'GIFT'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`py-2 text-[9px] font-black rounded border transition-all ${formData.category === cat ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-white/10 text-slate-500 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Title</label>
                    <input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-blue-500 outline-none transition-colors"
                      placeholder={formData.category === 'TENT' ? "e.g. Beach Tent Package" : "e.g. Arabic Coffee Service"}
                    />
                  </div>

                  {/* Dynamic Fields based on Category */}
                  {formData.category === 'TENT' && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Size</label>
                          <input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white font-bold outline-none focus:border-blue-500"/>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                          <input value={formData.tent_type} onChange={e => setFormData({...formData, tent_type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white font-bold outline-none focus:border-blue-500"/>
                       </div>
                    </div>
                  )}

                  {/* Financial Intelligence Section */}
                  <div className="p-4 bg-gradient-to-br from-blue-900/10 to-purple-900/10 rounded-2xl border border-blue-500/20 space-y-4">
                     <h3 className="text-xs font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest"><FileText size={12}/> Pricing Structure</h3>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selling Price (SAR)</label>
                           <input type="number" value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono font-bold text-lg outline-none focus:border-blue-500"/>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Price (SAR)</label>
                           <input type="number" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono font-bold text-lg outline-none focus:border-blue-500"/>
                        </div>
                     </div>

                     <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</span>
                        <div className="text-right">
                           <span className="block text-xl font-black text-emerald-400 font-mono tracking-tighter">SAR {profit.toLocaleString()}</span>
                           <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider">{margin}% Margin</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Includes (Comma Separated)</label>
                    <textarea 
                      value={formData.includes} 
                      onChange={e => setFormData({...formData, includes: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm font-medium focus:border-blue-500 outline-none h-24 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
               {mode === 'MANUAL' ? (
                  <button onClick={handleSubmit} disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-50">
                    {isLoading ? <Loader2 className="animate-spin" size={16}/> : (existingItem ? "Update Logic" : "Add Service")}
                  </button>
               ) : (
                  <button disabled className="w-full py-4 bg-purple-600/20 text-purple-200/50 font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-purple-500/20">
                     {isAiProcessing ? "Processing..." : "Upload Asset to Begin"}
                  </button>
               )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
