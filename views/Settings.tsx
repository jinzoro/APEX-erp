
import React, { useState, useEffect, useContext } from 'react';
import { backendService } from '../services/backendSimulator';
import { LicenseStatus, Language, CurrencyCode, CompanyInfo, AppView } from '../types';
import { AppContext } from '../context';
import { Icons } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onViewChange: (v: AppView) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, setLang, currency, setCurrency, onViewChange }) => {
  const { t, rates } = useContext(AppContext);
  const [license, setLicense] = useState<LicenseStatus | null>(null);
  const [originalCompany, setOriginalCompany] = useState<CompanyInfo | null>(null);
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo>({
    name: '', address: '', phone: '', email: '', ice: '', if: '', taxId: ''
  });
  const [showReview, setShowReview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    backendService.checkLicense().then(setLicense);
    backendService.getCompanyInfo().then(info => {
      setOriginalCompany(info);
      setCurrentCompany(info);
    });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCurrentCompany(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(originalCompany) !== JSON.stringify(currentCompany);
  };

  const getChangedFields = () => {
    if (!originalCompany) return [];
    const fields: { label: string; old: string; new: string }[] = [];
    const mapping: Record<string, string> = {
      name: 'Company Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      ice: 'ICE Number',
      if: 'IF Number',
      logo: 'Company Logo'
    };

    Object.keys(currentCompany).forEach((key) => {
      const k = key as keyof CompanyInfo;
      if (currentCompany[k] !== originalCompany[k]) {
        fields.push({
          label: mapping[k] || k,
          old: k === 'logo' ? (originalCompany[k] ? 'Image Set' : 'Empty') : String(originalCompany[k] || 'N/A'),
          new: k === 'logo' ? (currentCompany[k] ? 'New Image Set' : 'Empty') : String(currentCompany[k] || 'N/A')
        });
      }
    });
    return fields;
  };

  const commitChanges = async () => {
    await backendService.saveCompanyInfo(currentCompany);
    setOriginalCompany(currentCompany);
    setShowReview(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFactoryReset = async () => {
    setIsPurging(true);
    await backendService.factoryReset();
    
    // Smooth transition: 
    // 1. Give the user 1.5s to see the 'Purging' animation
    // 2. Navigate to Dashboard (Business Center)
    // 3. Perform a hard reload to reset all in-memory state
    setTimeout(() => {
      onViewChange(AppView.DASHBOARD);
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 500);
    }, 1500);
  };

  return (
    <div className="p-12 max-w-7xl h-full overflow-y-auto custom-scroll">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t.settings}</h2>
          <p className="text-slate-500 font-medium">Business architecture and master engine configuration.</p>
        </div>
        
        <div className="flex gap-4 items-center">
           <AnimatePresence>
             {saveSuccess && (
               <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Changes Persisted Successfully</motion.span>
             )}
           </AnimatePresence>
           <button 
             disabled={!hasChanges()}
             onClick={() => setShowReview(true)}
             className={`px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${hasChanges() ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-100 text-slate-300 shadow-none grayscale cursor-not-allowed'}`}
           >
             Save & Review Engine Data
           </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-10 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Corporate Identity & Invoicing Base
            </h4>
            
            <div className="flex gap-12 items-start">
               <div className="space-y-6">
                  <div className="w-40 h-40 rounded-[3rem] bg-slate-50 border-4 border-dashed border-slate-100 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-600 transition-colors shadow-inner">
                    {currentCompany.logo ? (
                      <img src={currentCompany.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                    ) : (
                      <div className="text-center p-6">
                         <div className="text-slate-200 mb-2"><Icons.Assets /></div>
                         <span className="text-slate-300 font-black text-[9px] uppercase tracking-widest">Logo Placeholder</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-[0.3em] opacity-60">Update Branding</p>
               </div>
               
               <div className="flex-1 grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Official Company Name</span>
                    <input type="text" value={currentCompany.name} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-bold text-base focus:bg-white focus:border-blue-600 transition-all" onChange={e => setCurrentCompany({...currentCompany, name: e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Identifiant Commun (ICE)</span>
                    <input type="text" value={currentCompany.ice} placeholder="Moroccan ICE" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-blue-600 transition-all" onChange={e => setCurrentCompany({...currentCompany, ice: e.target.value})}/>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Identifiant Fiscal (IF)</span>
                    <input type="text" value={currentCompany.if} placeholder="Moroccan IF" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm focus:bg-white focus:border-blue-600 transition-all" onChange={e => setCurrentCompany({...currentCompany, if: e.target.value})}/>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Physical Tax Address</span>
                    <textarea value={currentCompany.address} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-bold text-sm h-32 resize-none focus:bg-white focus:border-blue-600 transition-all" onChange={e => setCurrentCompany({...currentCompany, address: e.target.value})}/>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8">Localization Node</h4>
              <div className="flex gap-3">
                {(['EN', 'FR', 'AR'] as Language[]).map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`flex-1 py-5 rounded-3xl font-black text-xs tracking-widest transition-all ${lang === l ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>{l === 'EN' ? 'EN' : l === 'FR' ? 'FR' : 'AR'}</button>
                ))}
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-8">Master Reporting Currency</h4>
              <div className="grid grid-cols-3 gap-2 flex-1 max-h-48 overflow-y-auto pr-3 custom-scroll">
                {Object.keys(rates).sort().map(c => (
                  <button key={c} onClick={() => setCurrency(c)} className={`py-4 rounded-2xl font-black text-[10px] transition-all border ${currency === c ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <button 
            onClick={() => onViewChange(AppView.AUDIT_LOG)}
            className="w-full p-10 bg-white border border-slate-200 rounded-[3.5rem] shadow-sm flex items-center justify-between group hover:border-blue-600 transition-all"
          >
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                   <Icons.Finance />
                </div>
                <div className="text-left">
                   <h4 className="text-xl font-black text-slate-900 tracking-tight">{t.audit_log}</h4>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Review operational history</p>
                </div>
             </div>
             <div className="text-slate-200 group-hover:text-blue-600 transition-all transform translate-x-0 group-hover:translate-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
             </div>
          </button>

          <div className="bg-slate-950 p-12 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[80px] group-hover:bg-blue-600/40 transition-all duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl shadow-2xl shadow-blue-600/30">A</div>
                <h4 className="text-2xl font-black tracking-tighter">Apex Core v4.0</h4>
              </div>
              <div className="space-y-8">
                <div className="p-7 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Workstation ID Signature</p>
                  <p className="font-mono text-xs text-blue-400 break-all leading-relaxed tracking-tighter select-all">{license?.machineId}</p>
                </div>
                <div className="p-7 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20">
                  <p className="text-[9px] font-black text-emerald-500 uppercase mb-2">Node Licensing Status</p>
                  <p className="text-sm font-black text-white tracking-widest">AUTHORIZED • PERPETUAL ACCESS</p>
                </div>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-6 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-white transition-all shadow-inner"
                >
                  Factory Reset Local Node
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Save Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 100, scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-900 p-12 text-white">
                 <h3 className="text-4xl font-black tracking-tight">Review Engine Delta</h3>
                 <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Validation of local business profile updates</p>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-4 max-h-80 overflow-y-auto custom-scroll pr-4">
                    {getChangedFields().map((field, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-3">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{field.label}</span>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Old State</p>
                               <p className="text-xs font-bold text-slate-400 line-through truncate">{field.old}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">New State</p>
                               <p className="text-xs font-black text-slate-900 truncate">{field.new}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="flex gap-6 pt-6">
                    <button onClick={() => setShowReview(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Abort Changes</button>
                    <button onClick={commitChanges} className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-transform">Authorize & Persist</button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Danger Reset Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-rose-950/90 backdrop-blur-2xl z-[60] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -2, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="bg-white rounded-[5rem] w-full max-w-xl shadow-[0_50px_100px_rgba(225,29,72,0.4)] overflow-hidden border-[8px] border-rose-600/10"
            >
              {isPurging ? (
                <div className="p-20 text-center flex flex-col items-center justify-center min-h-[500px]">
                   <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                        borderRadius: ["20%", "50%", "20%"]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-24 h-24 bg-rose-600 mb-10 shadow-2xl shadow-rose-600/50"
                   />
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 animate-pulse">INCINERATING DATA</h3>
                   <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Returning node to factory state...</p>
                </div>
              ) : (
                <>
                  <div className="bg-rose-600 p-16 text-white text-center relative overflow-hidden">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-white rounded-full blur-[100px] -top-20 -right-20"
                    />
                    <div className="relative z-10 flex flex-col items-center">
                       <motion.div 
                         animate={{ y: [0, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                         className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl text-rose-600"
                       >
                          <Icons.Alert />
                       </motion.div>
                       <h3 className="text-5xl font-black tracking-tighter mb-4">PURGE NODE</h3>
                       <p className="text-rose-100 text-xs font-black uppercase tracking-[0.3em] opacity-80 leading-relaxed">System Data Incineration Authorized</p>
                    </div>
                  </div>
                  
                  <div className="p-16 text-center space-y-10">
                     <div className="space-y-4">
                        <p className="text-slate-900 font-black text-xl tracking-tight">Are you absolutely certain?</p>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                          All business records, personnel files, inventory logs, and transaction history will be <strong className="text-rose-600">permanently deleted</strong>. This action is irreversible. 
                          <br/><br/>
                          <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                             License status will be preserved
                          </span>
                        </p>
                     </div>

                     <div className="flex flex-col gap-4">
                        <button 
                          onClick={handleFactoryReset}
                          className="w-full py-8 bg-rose-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-[0.98]"
                        >
                          Confirm Incineration
                        </button>
                        <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="w-full py-6 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-900 transition-colors"
                        >
                          Abort Mission
                        </button>
                     </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
