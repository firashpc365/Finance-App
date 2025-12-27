
import React from 'react';
// @ts-ignore
import Barcode from 'react-barcode';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { CompanyProfile } from '../../lib/companyConfig';

interface InvoiceItem {
  id: number;
  description: string;
  qty: number;
  price: number;
}

interface QuotationProps {
  company: CompanyProfile;
  data: {
    id: string;
    date: string;
    validity: string;
    clientName: string;
    clientAddress: string;
    items: InvoiceItem[];
  };
}

export const QuotationTemplate = React.forwardRef<HTMLDivElement, QuotationProps>(
  ({ company, data }, ref) => {
    
    const subtotal = data.items.reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0);
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat;

    return (
      <div 
        ref={ref} 
        className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-10 mx-auto shadow-xl print:shadow-none print:w-full"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* 1. HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div className="w-1/2">
             <div className="relative h-20 w-48 mb-4">
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="object-contain h-full w-full" 
                />
             </div>

             <div className="text-[10px] space-y-1 text-slate-600 font-bold">
               <p className="flex items-center gap-2">
                 <Mail size={12} className={company.color.text}/> {company.contact.email}
               </p>
               {company.contact.website && (
                 <p className="flex items-center gap-2">
                   <Globe size={12} className={company.color.text}/> {company.contact.website}
                 </p>
               )}
               {company.contact.phones.map((phone, i) => (
                 <p key={i} className="flex items-center gap-2">
                   <Phone size={12} className={company.color.text}/> {phone}
                 </p>
               ))}
               <p className="flex items-center gap-2">
                 <MapPin size={12} className={company.color.text}/> {company.contact.address}
               </p>
             </div>
          </div>

          <div className="w-1/2 flex flex-col items-end">
            <Barcode value={data.id} width={1.2} height={40} fontSize={12} />
          </div>
        </div>

        {/* 2. BANNER */}
        <div className={`w-full py-3 px-6 mb-10 flex justify-between items-center text-white rounded-xl ${company.color.gradient}`}>
          <h2 className="text-xl font-black tracking-[0.2em] uppercase">Quotation</h2>
          <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">ElitePro Certified Ledger</span>
        </div>

        {/* 3. INFO GRID */}
        <div className="flex justify-between gap-10 mb-10">
          <div className="flex-1 border-l-4 pl-6 border-slate-200">
            <h3 className={`font-black text-[10px] mb-2 uppercase tracking-widest ${company.color.text}`}>Bill To</h3>
            <p className="font-black text-xl text-slate-900 mb-1">{data.clientName || 'Unnamed Client'}</p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium whitespace-pre-line">{data.clientAddress || 'Address not specified'}</p>
          </div>
          
          <div className="w-72">
            <div className="grid grid-cols-2 gap-y-3 text-[10px] border border-slate-200 p-6 rounded-2xl bg-slate-50/50">
               <span className="text-slate-500 font-black uppercase">Quote ID:</span>
               <span className="font-black text-right text-slate-900">{data.id}</span>
               
               <span className="text-slate-500 font-black uppercase">Date:</span>
               <span className="font-black text-right text-slate-900">{data.date}</span>
               
               <span className="text-slate-500 font-black uppercase">Valid For:</span>
               <span className="font-black text-right text-slate-900">{data.validity}</span>
            </div>
          </div>
        </div>

        {/* 4. ITEMS TABLE */}
        <div className="mb-10 rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${company.color.primary} text-white`}>
                <th className="py-4 px-6 text-left font-black uppercase tracking-widest text-[10px]">Description</th>
                <th className="py-4 px-6 text-center w-24 font-black uppercase tracking-widest text-[10px]">Qty</th>
                <th className="py-4 px-6 text-right w-32 font-black uppercase tracking-widest text-[10px]">Unit Price</th>
                <th className="py-4 px-6 text-right w-32 font-black uppercase tracking-widest text-[10px]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.length > 0 ? data.items.map((item, index) => (
                <tr key={index} className="odd:bg-slate-50">
                  <td className="py-4 px-6 font-bold text-slate-800">{item.description || 'Service/Item'}</td>
                  <td className="py-4 px-6 text-center text-slate-500 font-bold">{item.qty}</td>
                  <td className="py-4 px-6 text-right text-slate-500 font-bold">SAR {item.price?.toLocaleString() || '0'}</td>
                  <td className="py-4 px-6 text-right font-black text-slate-900">SAR { (item.qty * (item.price || 0)).toLocaleString() }</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 font-medium italic">No items added to this quotation.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. FOOTER TOTALS */}
        <div className="flex justify-end mb-16">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-xs text-slate-500 font-bold px-4 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>SAR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-bold px-4 uppercase tracking-widest">
              <span>VAT (15%)</span>
              <span>SAR {vat.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between text-xl font-black p-5 text-white rounded-2xl shadow-xl ${company.color.primary}`}>
              <span className="uppercase tracking-tighter">Total</span>
              <span className="tracking-tighter">SAR {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 6. TERMS & SIGNATURE */}
        <div className="flex justify-between items-end mt-auto pt-10 border-t border-slate-200">
          <div className="text-[10px] text-slate-400 max-w-sm font-medium">
            <p className="font-black text-slate-600 mb-2 uppercase tracking-widest">Terms & Conditions:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Validity of this quotation is {data.validity}.</li>
              <li>50% Advance payment required to confirm order execution.</li>
              <li>Remaining balance due upon final delivery or completion.</li>
              <li>ElitePro is not liable for external logistics delays.</li>
            </ol>
          </div>
          
          <div className="text-center w-64">
             <div className="h-20 w-full border-b border-slate-300 mb-3 flex items-center justify-center">
                <p className="text-[10px] text-slate-200 italic font-medium uppercase tracking-widest">Signatory Space</p>
             </div>
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Authorized Signature</p>
          </div>
        </div>
      </div>
    );
  }
);

QuotationTemplate.displayName = "QuotationTemplate";
