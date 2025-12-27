
import React, { useState, useEffect, useContext } from 'react';
import { backendService } from '../services/backendSimulator';
import { Language, CurrencyCode, CompanyInfo, AppView } from '../types';
import { Icons } from '../constants';
import { AppContext } from '../context';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onViewChange: (v: AppView) => void;
}

const Settings: React.FC<SettingsProps> = (props) => {
  const { t } = useContext(AppContext);
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo>({
    name: '', address: '', phone: '', email: '', ice: '', if: '', taxId: ''
  });

  useEffect(() => {
    const loadInfo = async () => {
      const info = await backendService.getCompanyInfo();
      setCurrentCompany(info);
    };
    loadInfo();
  }, []);

  const handleSave = async () => {
    await backendService.saveCompanyInfo(currentCompany);
    alert("Settings Persisted");
  };

  const handleReset = async () => {
    if (confirm("DANGER: WIPE ALL DATA?")) {
      await backendService.factoryReset();
      window.location.reload();
    }
  };

  return (
    <div className="p-12 max-w-7xl h-full overflow-y-auto custom-scroll">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{t.settings}</h2>
          <p className="text-slate-500 font-medium">Business architecture configuration.</p>
        </div>
        <button onClick={handleSave} className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl text-xs">
          Save Engine Data
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="bg-white p-12 rounded-[4.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-10">Corporate Identity</h4>
            <div className="space-y-6">
               <input 
                type="text" 
                value={currentCompany.name} 
                onChange={e => setCurrentCompany({...currentCompany, name: e.target.value})} 
                className="w-full p-5 bg-slate-50 border rounded-[2rem] font-bold" 
                placeholder="Company Name" 
               />
               <textarea 
                value={currentCompany.address} 
                onChange={e => setCurrentCompany({...currentCompany, address: e.target.value})} 
                className="w-full p-5 bg-slate-50 border rounded-[2rem] font-bold h-32" 
                placeholder="Physical Address" 
               />
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8">Localization</h4>
              <div className="flex gap-3">
                {(['EN', 'FR', 'AR'] as Language[]).map(l => (
                  <button 
                    key={l}
                    onClick={() => props.setLang(l)}
                    className={`flex-1 py-5 rounded-3xl font-black text-xs transition-all ${props.lang === l ? 'bg-slate-900 text-white shadow-2xl' : 'bg-slate-50 text-slate-400'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleReset} className="w-full py-8 bg-rose-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl text-xs">
              Factory Reset Node
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;
