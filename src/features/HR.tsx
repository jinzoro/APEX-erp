import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '@/lib/types';
import { backendService } from '@/services/backendSimulator';
import { currencyService } from '@/services/currencyService';
import { employeeSchema } from '@/lib/validators';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppToast } from '@/components/ui/ToastProvider';
import { Icons } from '@/lib/constants';
import { z } from 'zod';

type EmployeeFormData = z.infer<typeof employeeSchema>;

const HR: React.FC = () => {
  const { currency } = useContext(AppContext);
  const toast = useAppToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      department: 'General Operations',
      status: 'ACTIVE',
      grossSalary: 0,
    },
  });

  const fetchEmployees = async () => {
    const data = await backendService.getEmployees();
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await backendService.addItem('employees', {
        ...data,
        salary: data.grossSalary, // legacy net field
        joinDate: new Date().toISOString().split('T')[0],
      });
      toast.success({ title: 'Success', description: 'Employee onboarded successfully' });
      setIsModalOpen(false);
      reset();
      fetchEmployees();
    } catch (e) {
      toast.error({ title: 'Error', description: 'Failed to onboard employee' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Capital"
        description="Employee onboardings and personnel records"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            Onboard Talent
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role & Department</TableHead>
              <TableHead>CIN</TableHead>
              <TableHead>Gross Compensation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No personnel records found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-semibold text-slate-900">
                    {emp.firstName} {emp.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-medium text-slate-900">{emp.role}</p>
                      <p className="text-slate-500">{emp.department}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{emp.cin}</TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {currencyService.format(emp.grossSalary || emp.salary || 0, currency)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Attestation
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Employee"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">First Name</label>
              <Input {...register('firstName')} error={errors.firstName?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Last Name</label>
              <Input {...register('lastName')} error={errors.lastName?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">CIN (Moroccan ID)</label>
              <Input {...register('cin')} error={errors.cin?.message} placeholder="e.g. AB123456" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">CNSS Number</label>
              <Input {...register('cnssNumber')} error={errors.cnssNumber?.message} placeholder="9 digits" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Role</label>
              <Input {...register('role')} error={errors.role?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Department</label>
              <Input {...register('department')} error={errors.department?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <Input {...register('email')} error={errors.email?.message} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <Input {...register('phone')} error={errors.phone?.message} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Gross Monthly Salary ({currency})</label>
            <Input
              type="number"
              step="0.01"
              {...register('grossSalary', { valueAsNumber: true })}
              error={errors.grossSalary?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Onboard Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HR;
