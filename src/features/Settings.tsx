
import React, { useState, useEffect, useContext } from 'react';
import { backendService } from '@/services/backendSimulator';
import { Language, CurrencyCode, CompanyInfo, AppView } from '@/lib/types';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onViewChange: (v: AppView) => void;
}

const PRESET_COLORS = [
  '#2563eb', // Apex Blue
  '#059669', // Emerald
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#475569', // Slate
];

const Settings: React.FC<SettingsProps> = (props) => {
  const { t, rates } = useContext(AppContext);
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo>({
    name: '', address: '', phone: '', email: '', ice: '', if: '', taxId: '', logo: '', primaryColor: '#2563eb'
  });
  const [currencySearch, setCurrencySearch] = useState('');

  useEffect(() => {
    const loadInfo = async () => {
      const info = await backendService.getCompanyInfo();
      setCurrentCompany(info);
    };
    loadInfo();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentCompany(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await backendService.saveCompanyInfo(currentCompany);
    alert("System kernel synchronized with new corporate identity.");
    window.location.reload(); // Refresh to propagate theme
  };

  const handleReset = async () => {
    if (confirm("DANGER: This will wipe all data on this node. Continue?")) {
      await backendService.factoryReset();
      window.location.reload();
    }
  };

  const filteredCurrencies = Object.keys(rates).filter(c => 
    c.toLowerCase().includes(currencySearch.toLowerCase())
  ).sort();

  return (
    <div className="p-12 max-w-7xl mx-auto h-full overflow-y-auto custom-scroll">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{t.settings}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{t.business_control}</p>
        </div>
        <button onClick={handleSave} className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl text-xs active:scale-95 transition-all" style={{ backgroundColor: currentCompany.primaryColor }}>
          Sync Master Data
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
         <div className="lg:col-span-2 space-y-12">
            {/* Corporate Identity Card */}
            <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-12" style={{ color: currentCompany.primaryColor }}>Corporate Master Record</h4>
               
               <div className="flex flex-col md:flex-row gap-12">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Master Brand Logo</p>
                     <div className="w-48 h-48 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center overflow-hidden relative group hover:border-blue-500 transition-all cursor-pointer shadow-inner">
                        {currentCompany.logo ? <img src={currentCompany.logo} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" /> : <Icons.Plus />}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
                     </div>
                     <p className="text-[9px] text-slate-400 text-center uppercase font-black">Click to Replace</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Legal Entity Name</label>
                        <input type="text" value={currentCompany.name} onChange={e => setCurrentCompany({...currentCompany, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold focus:bg-white focus:border-blue-600 outline-none transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Corporate Email</label>
                        <input type="email" value={currentCompany.email} onChange={e => setCurrentCompany({...currentCompany, email: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">ICE (Morocco ID)</label>
                        <input type="text" value={currentCompany.ice} onChange={e => setCurrentCompany({...currentCompany, ice: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold" placeholder="00XXXXXXXXXXXXX" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">IF (Fiscal ID)</label>
                        <input type="text" value={currentCompany.if} onChange={e => setCurrentCompany({...currentCompany, if: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold" />
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Operating Headquarters</label>
                        <textarea value={currentCompany.address} onChange={e => setCurrentCompany({...currentCompany, address: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold h-32 resize-none" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Aesthetic Engine Card */}
            <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 mb-12">Aesthetic Engine (Branding)</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Master Palette</p>
                     <div className="flex flex-wrap gap-4">
                        {PRESET_COLORS.map(color => (
                           <button 
                             key={color}
                             onClick={() => setCurrentCompany({...currentCompany, primaryColor: color})}
                             className={`w-12 h-12 rounded-2xl shadow-lg transition-transform hover:scale-110 active:scale-90 ${currentCompany.primaryColor === color ? 'ring-4 ring-offset-4 ring-slate-900' : ''}`}
                             style={{ backgroundColor: color }}
                           />
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Custom Signature Color</p>
                     <div className="flex gap-4">
                        <input 
                           type="color" 
                           value={currentCompany.primaryColor}
                           onChange={e => setCurrentCompany({...currentCompany, primaryColor: e.target.value})}
                           className="w-16 h-16 bg-transparent cursor-pointer rounded-2xl overflow-hidden"
                        />
                        <input 
                           type="text" 
                           value={currentCompany.primaryColor}
                           onChange={e => setCurrentCompany({...currentCompany, primaryColor: e.target.value})}
                           placeholder="#HEXCODE"
                           className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-bold uppercase tracking-widest focus:bg-white"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-12">
            {/* Global Treasury Selector */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-8">Treasury Node (Base Currency)</h4>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Filter Global Nodes..." 
                  value={currencySearch} 
                  onChange={e => setCurrencySearch(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-emerald-500"
                />
                <div className="h-64 overflow-y-auto custom-scroll pr-2 space-y-2">
                   {filteredCurrencies.map(code => (
                     <button 
                       key={code}
                       onClick={() => props.setCurrency(code as CurrencyCode)}
                       className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-between ${props.currency === code ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                     >
                       <span>{code}</span>
                       {props.currency === code && <span className="text-[8px] bg-white/20 px-2 py-1 rounded-md uppercase">Selected</span>}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            {/* Language Hub */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-8">Kernel Language</h4>
              <div className="grid grid-cols-3 gap-3">
                {(['EN', 'FR', 'AR'] as Language[]).map(l => (
                  <button 
                    key={l}
                    onClick={() => props.setLang(l)}
                    className={`py-5 rounded-2xl font-black text-xs transition-all ${props.lang === l ? 'bg-slate-900 text-white shadow-2xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleReset} className="w-full py-8 bg-rose-50 text-rose-600 rounded-[2.5rem] font-black uppercase tracking-[0.4em] border-2 border-dashed border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
              Purge System Node
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;
