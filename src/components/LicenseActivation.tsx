
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { backendService } from '@/services/backendSimulator';

interface Props {
  onActivated: () => void;
}

const LicenseActivation: React.FC<Props> = ({ onActivated }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [machineId, setMachineId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const status = await backendService.checkLicense();
      setMachineId(status.machineId);
    };
    init();
  }, []);

  const copyId = () => {
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    if (!key) return;
    setLoading(true);
    setError('');
    
    const success = await backendService.activateLicense(key);
    if (success) {
      onActivated();
    } else {
      setError('Checksum Error: Invalid Serial Signature.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200"
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-16 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-black/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h2 className="text-4xl font-black mb-3 tracking-tighter">Apex Enterprise</h2>
            <p className="text-blue-100 text-xs font-black uppercase tracking-[0.4em] opacity-80">Kernel Activation Wizard</p>
          </div>
        </div>
        
        <div className="p-16">
          <div className="mb-12">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Workstation Identifier (HWID)</label>
            <button 
              onClick={copyId}
              className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-200 font-mono text-xs text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-all active:scale-[0.98] group"
            >
              <span className="flex-1 text-center font-black tracking-widest">{machineId}</span>
              <span className="text-[10px] font-black uppercase text-blue-600 ml-4">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
          </div>

          <div className="mb-12">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Master License Key</label>
            <input 
              type="text"
              placeholder="APEX-XXXX-XXXX-XXX"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none text-xl font-mono tracking-[0.3em] text-center shadow-inner transition-all placeholder:text-slate-200"
            />
            {error && <p className="mt-4 text-[10px] font-black text-rose-600 text-center uppercase tracking-widest">{error}</p>}
          </div>

          <button 
            onClick={handleActivate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-3xl shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 text-[12px] uppercase tracking-[0.3em]"
          >
            {loading ? 'Validating Serial...' : 'Authorize perpetual access'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LicenseActivation;
