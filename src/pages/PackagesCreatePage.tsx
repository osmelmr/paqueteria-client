import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useRecipients } from '../hooks/useRecipients';
import { useProvinces } from '../hooks/useProvinces';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import type { CreatePackageDto } from '../api/packages.api';

export default function PackagesCreatePage() {
  const navigate = useNavigate();
  const createPackage = useCreatePackage();
  const { data: guides = [] } = useGuides();
  const { data: recipients = [] } = useRecipients();
  const { data: provinces = [] } = useProvinces();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();

  const [form, setForm] = useState({
    guideId: '', recipientId: '', provinceId: '', address: '', weight: '',
    content: '', arrivalDate: '', statusId: '', locationId: '',
    anotations: '', alert: false, alertDescription: '', hbls: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (statuses.length > 0 && !form.statusId) {
      setForm((prev) => ({ ...prev, statusId: statuses[0].id }));
    }
  }, [statuses]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      const dto: CreatePackageDto = {
        guideId: form.guideId || undefined,
        recipientId: form.recipientId || undefined,
        provinceId: form.provinceId || undefined,
        address: form.address || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        content: form.content || undefined,
        arrivalDate: form.arrivalDate || undefined,
        statusId: form.statusId,
        locationId: form.locationId || undefined,
        anotations: form.anotations || undefined,
        alert: form.alert ? true : undefined,
        alertDescription: form.alertDescription || undefined,
        hbls: form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
      };
      await createPackage.mutateAsync(dto);
      navigate('/packages');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-[#dbdbdb] dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nuevo paquete</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
           <label className="flex flex-col gap-1.5 font-medium">

            Guia
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.guideId} onChange={(e) => setForm((prev) => ({ ...prev, guideId: e.target.value }))}>
              <option value="">Sin guia</option>
              {guides.map((g) => <option key={g.id} value={g.id}>{g.externalRef || g.agency?.name}</option>)}
            </select>
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Destinatario
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.recipientId} onChange={(e) => setForm((prev) => ({ ...prev, recipientId: e.target.value }))}>
              <option value="">Seleccionar</option>
              {recipients.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
            </select>
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Provincia
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.provinceId} onChange={(e) => setForm((prev) => ({ ...prev, provinceId: e.target.value }))}>
              <option value="">Seleccionar</option>
              {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Direccion
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Peso
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" type="number" step="0.1" value={form.weight} onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))} />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Contenido
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Fecha llegada
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" type="date" value={form.arrivalDate} onChange={(e) => setForm((prev) => ({ ...prev, arrivalDate: e.target.value }))} />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Estado
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.statusId} onChange={(e) => setForm((prev) => ({ ...prev, statusId: e.target.value }))} required>
              <option value="">Seleccionar</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Ubicacion
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.locationId} onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}>
              <option value="">Sin ubicacion</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
          <label className="col-span-full">
            Anotaciones
            <textarea className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.anotations} onChange={(e) => setForm((prev) => ({ ...prev, anotations: e.target.value }))} rows={2} />
          </label>
          <label className="col-span-full flex items-center gap-2.5 flex-row">
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" type="checkbox" checked={form.alert} onChange={(e) => setForm((prev) => ({ ...prev, alert: e.target.checked }))} />
            Alerta
          </label>
          {form.alert && (
            <label className="col-span-full">
              Descripcion de alerta
              <textarea className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.alertDescription} onChange={(e) => setForm((prev) => ({ ...prev, alertDescription: e.target.value }))} rows={2} />
            </label>
          )}
          <label className="col-span-full">
            HBLs
            <textarea className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={form.hbls} onChange={(e) => setForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
          </label>

          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={createPackage.isPending}>Crear paquete</button>
            <button type="button" className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => navigate('/packages')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
