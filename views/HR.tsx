
import React, { useEffect, useState, useContext } from 'react';
import { Employee, CompanyInfo } from '../types';
import { backendService } from '../services/backendSimulator';
import { currencyService } from '../services/currencyService';
import { Icons } from '../constants';
import { AppContext } from '../context';
import { motion, AnimatePresence } from 'framer-motion';

const HR: React.FC = () => {
  const { currency, t } = useContext(AppContext);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    firstName: '', lastName: '', cin: '', role: '', department: 'General Operations', salary: 0, status: 'ACTIVE', email: '', phone: '', address: '', joinDate: new Date().toISOString().split('T')[0]
  });

  const fetch = async () => {
    const [e_data, c_info] = await Promise.all([
      backendService.getEmployees(),
      backendService.getCompanyInfo()
    ]);
    setEmployees(e_data);
    setCompany(c_info);
  };

  useEffect(() => { fetch(); }, []);

  const handleOnboard = async () => {
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.cin) return;
    await backendService.addItem('employees', newEmp);
    setShowAddModal(false);
    setNewEmp({ firstName: '', lastName: '', cin: '', role: '', department: 'General Operations', salary: 0, status: 'ACTIVE', email: '', phone: '', address: '', joinDate: new Date().toISOString().split('T')[0] });
    fetch();
  };

  const generateDocument = (emp: Employee, type: 'TRAVAIL' | 'SALAIRE') => {
    const win = window.open('', '_blank');
    if (!win) return;

    const todayFr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Premium HR Doc Template
    const content = `
      <html>
        <head>
          <title>${type === 'TRAVAIL' ? 'Attestation de Travail' : 'Attestation de Salaire'} - ${emp.firstName} ${emp.lastName}</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              color: #1e293b; 
              margin: 0; 
              padding: 0; 
              background: #fff;
              line-height: 1.8;
            }
            .document-container {
              padding: 80px 100px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 80px;
              border-bottom: 3px solid #f1f5f9;
              padding-bottom: 30px;
            }
            .company-info h2 { margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; }
            .company-info p { margin: 4px 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .date-place { text-align: right; font-size: 13px; font-weight: 500; color: #475569; }

            .doc-title {
              text-align: center;
              margin-bottom: 70px;
              font-size: 26px;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 2px;
              position: relative;
            }
            .doc-title::after {
              content: '';
              position: absolute;
              bottom: -15px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 4px;
              background: #2563eb;
              border-radius: 2px;
            }

            .main-text { font-size: 15px; text-align: justify; color: #334155; }
            .details-box {
              margin: 40px 0;
              padding: 30px 40px;
              background: #f8fafc;
              border-radius: 25px;
              border: 1px solid #f1f5f9;
            }
            .details-box p { margin: 8px 0; }
            .details-box strong { color: #0f172a; font-weight: 800; }

            .salary-card {
              background: #eff6ff;
              border: 1px solid #dbeafe;
              padding: 30px;
              border-radius: 20px;
              margin: 40px 0;
              font-size: 18px;
            }
            .salary-line { display: flex; justify-content: space-between; border-bottom: 1px dashed #bfdbfe; padding: 10px 0; }
            .salary-total { font-weight: 900; color: #2563eb; font-size: 24px; padding-top: 20px; border-bottom: none; }

            .footer-signature {
              margin-top: 100px;
              display: flex;
              justify-content: flex-end;
            }
            .sig-block { text-align: center; width: 280px; }
            .sig-title { font-weight: 800; margin-bottom: 80px; text-transform: uppercase; font-size: 13px; }
            .sig-note { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="header-bar">
              <div class="company-info">
                ${company?.logo ? `<img src="${company.logo}" style="max-height: 50px; margin-bottom: 10px;">` : `<h2>${company?.name || 'APEX'}</h2>`}
                <p>${company?.address || 'Maroc'}</p>
                <p>ICE: ${company?.ice || '-'} | IF: ${company?.if || '-'}</p>
              </div>
              <div class="date-place">Fait à Casablanca, le ${todayFr}</div>
            </div>

            <h1 class="doc-title">${type === 'TRAVAIL' ? 'Attestation de Travail' : 'Attestation de Salaire'}</h1>
            
            <div class="main-text">
              <p>Nous soussignés, la société <strong>${company?.name || 'Apex Business'}</strong>, agissant en qualité d'employeur, certifions par la présente que :</p>
              
              <div class="details-box">
                <p>M./Mme : <strong>${emp.firstName.toUpperCase()} ${emp.lastName.toUpperCase()}</strong></p>
                <p>Titulaire de la CIN n° : <strong>${emp.cin}</strong></p>
                <p>Demeurant à : <strong>${emp.address || 'Non renseigné'}</strong></p>
              </div>

              ${type === 'TRAVAIL' ? `
                <p>Est employé(e) au sein de notre établissement depuis le <strong>${new Date(emp.joinDate).toLocaleDateString('fr-FR')}</strong> en qualité de <strong>${emp.role}</strong>.</p>
                <p>L’intéressé(e) est toujours en poste à ce jour et cette attestation lui est délivrée sur sa demande pour servir et valoir ce que de droit.</p>
              ` : `
                <p>Perçoit une rémunération mensuelle nette détaillée comme suit :</p>
                <div class="salary-card">
                  <div class="salary-line"><span>Salaire de Base Net :</span> <span>${currencyService.format(emp.salary, 'MAD')}</span></div>
                  <div class="salary-line"><span>Indemnités :</span> <span>MAD 0,00</span></div>
                  <div class="salary-line salary-total"><span>TOTAL NET À PAYER :</span> <span>${currencyService.format(emp.salary, 'MAD')}</span></div>
                </div>
                <p>Cette attestation est délivrée à l'intéressé(e) pour faire valoir ses droits.</p>
              `}
            </div>

            <div class="footer-signature">
              <div class="sig-block">
                <div class="sig-title">La Direction Générale</div>
                <div class="sig-note">(Cachet et Signature autorisée)</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `;

    win.document.write(content);
    win.document.close();
  };

  return (
    <div className="p-10 h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-12 shrink-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Human Capital Center</h2>
          <p className="text-slate-500 font-medium mt-1">Personnel management & Moroccan labor compliance factory.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-3xl hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20 text-xs font-black uppercase tracking-widest active:scale-95"><Icons.Plus /> Onboard Talent</button>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 relative">
        <div className="flex-1 overflow-y-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaborateur</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifiant / Poste</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compensation</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Documents Juridiques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.length === 0 ? (
                <tr><td colSpan={4} className="py-32 text-center text-slate-200 font-black uppercase tracking-[0.4em] text-xs">Engine Database: Empty Staff File</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group cursor-default">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg shadow-sm">{emp.firstName[0]}{emp.lastName[0]}</div>
                      <div>
                        <p className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <p className="text-sm font-black text-slate-800 tracking-tight">{emp.role}</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase mt-1">CIN: {emp.cin}</p>
                  </td>
                  <td className="px-10 py-7 font-black text-slate-900 text-lg tracking-tighter">{currencyService.format(emp.salary, currency)}</td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex justify-end gap-3">
                       <button onClick={() => generateDocument(emp, 'TRAVAIL')} className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">A. Travail</button>
                       <button onClick={() => generateDocument(emp, 'SALAIRE')} className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">A. Salaire</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
              className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
                <div className="bg-slate-900 p-12 text-white relative">
                   <h3 className="text-4xl font-black tracking-tight relative z-10">Staff Enrollment</h3>
                   <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-2 relative z-10">Moroccan Legal Onboarding Node</p>
                   <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/20 blur-[80px]" />
                </div>
                <div className="p-12 grid grid-cols-2 gap-8 overflow-y-auto max-h-[60vh] custom-scroll">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Prénom</p>
                      <input type="text" placeholder="First Name" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, firstName: e.target.value})}/>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Nom de Famille</p>
                      <input type="text" placeholder="Last Name" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, lastName: e.target.value})}/>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">ID National (CIN)</p>
                      <input type="text" placeholder="e.g. BE123456" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-mono text-sm uppercase focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, cin: e.target.value})}/>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Contact Mobile</p>
                      <input type="text" placeholder="+212 ..." className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, phone: e.target.value})}/>
                   </div>
                   <div className="space-y-2 col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Email Professionnel</p>
                      <input type="email" placeholder="staff@company.ma" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, email: e.target.value})}/>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Poste / Fonction</p>
                      <input type="text" placeholder="Job Title" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, role: e.target.value})}/>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Salaire Net Mensuel</p>
                      <input type="number" placeholder="Net MAD" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-black text-sm text-blue-600 focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, salary: Number(e.target.value)})}/>
                   </div>
                   <div className="space-y-2 col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-2">Adresse de Résidence</p>
                      <textarea placeholder="Physical Address in Morocco" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-bold text-sm h-24 resize-none focus:bg-white focus:border-rose-500 transition-all" onChange={e => setNewEmp({...newEmp, address: e.target.value})}/>
                   </div>
                   <div className="flex gap-6 pt-10 col-span-2">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Abort Entry</button>
                      <button onClick={handleOnboard} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 active:scale-95 transition-transform">Commit to Hub</button>
                   </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HR;
