
import React, { useState, useRef } from 'react';
import { analyzeRFQ } from '../services/geminiService';
import { RFQResult } from '../types';
import { MENUS } from '../constants';
import { FileText, Paperclip, X, Send, AlertCircle, Clock, MapPin, Users, Share2 } from 'lucide-react';

interface RFQAnalyzerProps {
  isBusiness: boolean;
}

const RFQAnalyzer: React.FC<RFQAnalyzerProps> = ({ isBusiness }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RFQResult | null>(null);
  const [stagedFile, setStagedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setStagedFile({ name: file.name, data: base64, mimeType: file.type || 'application/pdf' });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!input.trim() && !stagedFile) return;
    setLoading(true);
    setResult(null);
    try {
      const payload = stagedFile ? { data: stagedFile.data, mimeType: stagedFile.mimeType } : input;
      const data = await analyzeRFQ(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Analysis error.');
    } finally {
      setLoading(false);
    }
  };

  const matchedMenu = MENUS.find(m => m.id === result?.suggested_package_id);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 opacity-5 rotate-12 transition-transform group-hover:scale-105 pointer-events-none">
           <Share2 size={300} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">Partner RFQ Hub</h3>
                <p className="text-sm opacity-50 font-medium text-slate-300">Extract logistics and intent from Paul's requests.</p>
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-teal-400 hover:bg-white/10 transition-all"
            >
              <Paperclip size={14} /> Attach RFQ Document
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf,text/plain,image/*" />
          </div>
          
          {stagedFile && (
            <div className="mb-6 flex items-center justify-between p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <FileText className="text-teal-400" size={20} />
                <span className="text-xs font-black text-white">{stagedFile.name}</span>
              </div>
              <button onClick={() => setStagedFile(null)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            disabled={!!stagedFile}
            placeholder={stagedFile ? "Analyzing document contents..." : "Paste partner text or attach a file..."}
            className="w-full px-8 py-8 bg-black/20 border border-white/5 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all resize-none mb-8 text-lg font-medium placeholder:opacity-20 text-white backdrop-blur-sm"
          />
          
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-30 text-white">
                <span>Multi-modal Sync Ready</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
             </div>
             <button
              onClick={handleAnalyze}
              disabled={loading || (!input.trim() && !stagedFile)}
              className={`flex items-center gap-4 px-10 py-4 bg-teal-500 text-white font-black rounded-2xl hover:bg-teal-400 disabled:opacity-50 transition-all shadow-xl shadow-teal-500/20 active:scale-95`}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Reasoning...</>
              ) : 'Process Intelligence'}
            </button>
          </div>
        </div>
      </div>

      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-700">
          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 backdrop-blur-3xl flex flex-col hover:bg-white/10 transition-colors relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 opacity-5 rotate-12">
               <Clock size={120} />
            </div>
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-8 relative z-10">Logistics Vector</h4>
            <div className="space-y-8 flex-1 relative z-10">
              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-widest text-white">Date</p>
                  <p className="text-lg font-black tracking-tight text-white">{result.logistics.date || 'TBD'}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-widest text-white">Location</p>
                  <p className="text-lg font-black tracking-tight text-white">{result.logistics.location || 'Pending Detection'}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-widest text-white">Volume (Pax)</p>
                  <p className="text-lg font-black tracking-tight text-white">{result.logistics.pax || '0'} People</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 backdrop-blur-3xl flex flex-col hover:bg-white/10 transition-colors relative overflow-hidden">
             <div className="absolute -right-10 -top-10 opacity-5 rotate-[-12deg]">
               <FileText size={140} />
            </div>
            <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-8 relative z-10">Package Recommendation</h4>
            <div className="flex-1 relative z-10">
              {matchedMenu ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-xl font-black text-white">{matchedMenu.name}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">Suggested from System Menus</p>
                  </div>
                  <ul className="space-y-2">
                    {matchedMenu.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-300">
                        <div className="w-1 h-1 bg-teal-500 rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
                  <AlertCircle size={40} className="mb-4 text-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">No Direct Match</p>
                  <p className="text-[9px] mt-1 text-slate-300">Custom estimation required</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 backdrop-blur-3xl flex flex-col hover:bg-white/10 transition-colors relative overflow-hidden">
             <div className="absolute -right-5 -bottom-5 opacity-5 rotate-[5deg]">
               <Send size={140} />
            </div>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-8 relative z-10">Draft Response</h4>
            <div className="flex-1 flex flex-col relative z-10">
              <div className="flex-1 bg-black/20 p-6 rounded-2xl border border-white/5 mb-6 backdrop-blur-sm">
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic line-clamp-6">
                  "{result.draft_reply_to_paul}"
                </p>
              </div>
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                <Send size={14} /> Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {result && result.missing_info.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 animate-in slide-in-from-left-4 backdrop-blur-md">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Information Gaps Detected</p>
            <p className="text-xs text-amber-200/70 font-medium">The following details were not identified in the source input: {result.missing_info.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQAnalyzer;
