
import React, { useState, useEffect, useContext } from 'react';
import { Employee } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { Icons } from '@/lib/constants';
import { AppContext } from '@/lib/context';

const HR: React.FC = () => {
  const { currency } = useContext(AppContext);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    firstName: '', lastName: '', cin: '', role: '', department: 'General Operations', salary: 0, status: 'ACTIVE', email: '', phone: '', address: '', joinDate: new Date().toISOString().split('T')[0]
  });

  const fetch = async () => {
    const emps = await backendService.getEmployees();
    setEmployees(emps);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleOnboard = async () => {
    await backendService.addItem('employees', newEmp);
    setShowAddModal(false);
    fetch();
  };

  return (
    <div className="p-10 h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-12 shrink-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Human Capital Center</h2>
          <p className="text-slate-500 font-medium mt-1">Personnel management node.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-rose-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-2">
          <Icons.Plus /> Onboard Talent
        </button>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaborateur</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compensation</th>
              <th className="px-10 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900">{emp.firstName} {emp.lastName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7 font-black text-slate-900 text-lg tracking-tighter">
                  {currencyService.format(emp.salary, currency)}
                </td>
                <td className="px-10 py-7 text-right">
                  <button className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">Attestation</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden">
             <div className="bg-slate-900 p-12 text-white">
                <h3 className="text-4xl font-black tracking-tight">Staff Enrollment</h3>
             </div>
             <div className="p-12 space-y-6">
                <input type="text" placeholder="Prénom" value={newEmp.firstName} onChange={e => setNewEmp({...newEmp, firstName: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" />
                <input type="text" placeholder="Nom" value={newEmp.lastName} onChange={e => setNewEmp({...newEmp, lastName: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" />
                <input type="number" placeholder="Salary Net" value={newEmp.salary} onChange={e => setNewEmp({...newEmp, salary: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" />
                <div className="flex gap-6 pt-6">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 font-black text-slate-400 uppercase tracking-widest text-xs">Abort</button>
                    <button onClick={handleOnboard} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase shadow-2xl text-xs tracking-widest">Commit to Hub</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HR;
