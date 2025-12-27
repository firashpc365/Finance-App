
import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  History
} from 'lucide-react';

const FinancialsView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            <PieChart className="text-emerald-500" size={32} /> Financials
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Global cashflow, revenue tracking, and profit analysis.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl">
          <Download size={18} /> Generate Audit Report
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={100} /></div>
          <div className="flex items-start justify-between mb-8">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shadow-inner">
              <TrendingUp size={28} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              <ArrowUpRight size={12} /> +12.5%
            </div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Aggregate Revenue</p>
          <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
            <span className="text-lg font-normal opacity-30 mr-2">SAR</span>142,500
          </h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingDown size={100} /></div>
          <div className="flex items-start justify-between mb-8">
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shadow-inner">
              <TrendingDown size={28} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              CY-Q3
            </div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Direct Outlay</p>
          <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
            <span className="text-lg font-normal opacity-30 mr-2">SAR</span>48,200
          </h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={100} /></div>
          <div className="flex items-start justify-between mb-8">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 shadow-inner">
              <DollarSign size={28} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
              Yield: 66%
            </div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Net Fiscal Position</p>
          <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">
            <span className="text-lg font-normal opacity-30 mr-2">SAR</span>94,300
          </h3>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
           <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
             <History size={18} className="text-blue-500" /> Recent Ledger Ingress
           </h3>
           <button className="text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-widest transition-colors">
             View History Archive
           </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">Description</th>
                <th className="p-8">Timeline</th>
                <th className="p-8">Category</th>
                <th className="p-8 text-right">Net Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { desc: "Aramco Catering Service Payment", date: "Oct 24, 2024", cat: "Income", amt: 15000, type: "POS" },
                { desc: "JAG Arabia Proxy Settlement", date: "Oct 22, 2024", cat: "Settlement", amt: 8500, type: "POS" },
                { desc: "Almarai Wholesale Supply Purchase", date: "Oct 20, 2024", cat: "Expense", amt: 4200, type: "NEG" },
                { desc: "Paul Commission - Site B", date: "Oct 18, 2024", cat: "Commission", amt: 2250, type: "NEG" },
              ].map((i, idx) => (
                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                  <td className="p-8">
                    <p className="font-bold text-white text-sm">{i.desc}</p>
                  </td>
                  <td className="p-8 text-slate-500 text-xs">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="opacity-40" /> {i.date}
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-[9px] font-black bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest group-hover:border-blue-500/30 group-hover:text-slate-300 transition-all">
                      {i.cat}
                    </span>
                  </td>
                  <td className={`p-8 text-right font-mono font-black tracking-tighter text-base ${i.type === 'POS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {i.type === 'POS' ? '+' : '-'} SAR {i.amt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialsView;
