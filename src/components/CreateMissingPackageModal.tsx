import { useState, type FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreatePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useRecipients } from '../hooks/useRecipients';
import { useProvinces } from '../hooks/useProvinces';
import { useMunicipes } from '../hooks/useMunicipes';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import type { CreatePackageDto } from '../api/packages.api';
import { CustomSelect } from '../components/CustomSelect';
import { RecipientsCustomSelect } from '../components/RecipientsCustomSelect';

interface CreateMissingPackageModalProps {
  isOpen: boolean;
  hbl: string;
  onClose: () => void;
  onCreated: (hbl: string) => void;
}

export function CreateMissingPackageModal({ isOpen, hbl, onClose, onCreated }: CreateMissingPackageModalProps) {
  const createPackage = useCreatePackage();
  const { data: guides = [] } = useGuides();
  const { data: recipients = [] } = useRecipients();
  const { data: provinces = [] } = useProvinces();
  const { data: municipes = [] } = useMunicipes();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();

  const [form, setForm] = useState({
    guideId: '',
    recipientId: '',
    provinceId: '',
    municipeId: '',
    address: '',
    weight: '',
    content: '',
    statusId: '',
    locationId: '',
    anotations: '',
    alert: false,
    alertDescription: '',
    hbls: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);
    setForm({
      guideId: '',
      recipientId: '',
      provinceId: '',
      municipeId: '',
      address: '',
      weight: '',
      content: '',
      statusId: statuses[0]?.id ?? '',
      locationId: '',
      anotations: '',
      alert: false,
      alertDescription: '',
      hbls: hbl,
    });
  }, [isOpen, hbl, statuses]);

  if (!isOpen || !hbl) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (!form.statusId) {
      setLocalError('Debes seleccionar un estado');
      return;
    }
    if (!form.locationId) {
      setLocalError('Debes seleccionar una ubicacion');
      return;
    }
    try {
      const dto: CreatePackageDto = {
        guideId: form.guideId || undefined,
        recipientId: form.recipientId || undefined,
        provinceId: form.provinceId || undefined,
        municipeId: form.municipeId || undefined,
        address: form.address || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        content: form.content || undefined,
        statusId: form.statusId,
        locationId: form.locationId,
        anotations: form.anotations || undefined,
        alert: form.alert ? true : undefined,
        alertDescription: form.alertDescription || undefined,
        hbls: form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
      };
      await createPackage.mutateAsync(dto);
      onCreated(hbl);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Registrar paquete faltante</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crear el paquete para el HBL {hbl}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1.5 font-medium">
              Guia
              <CustomSelect value={form.guideId} onChange={(id) => setForm((prev) => ({ ...prev, guideId: id }))} options={guides.map((g) => ({ id: g.id, name: g.name || g.agency?.name || 'Sin nombre' }))} placeholder="Sin guia" />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Destinatario
              <RecipientsCustomSelect value={form.recipientId} onChange={(id) => setForm((prev) => ({ ...prev, recipientId: id }))} recipients={recipients} placeholder="Seleccionar" />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Provincia
              <CustomSelect value={form.provinceId} onChange={(id) => setForm((prev) => ({ ...prev, provinceId: id }))} options={provinces} placeholder="Seleccionar" />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Municipio
              <CustomSelect value={form.municipeId} onChange={(id) => setForm((prev) => ({ ...prev, municipeId: id }))} options={municipes} placeholder="Seleccionar" />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Direccion
              <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Peso
              <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" type="number" step="0.1" value={form.weight} onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Contenido
              <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Estado *
              <CustomSelect value={form.statusId} onChange={(id) => setForm((prev) => ({ ...prev, statusId: id }))} options={statuses} placeholder="Seleccionar" />
            </label>
            <label className="flex flex-col gap-1.5 font-medium">
              Ubicacion *
              <CustomSelect value={form.locationId} onChange={(id) => setForm((prev) => ({ ...prev, locationId: id }))} options={locations} placeholder="Seleccionar" />
            </label>
            <label className="col-span-full">
              Anotaciones
              <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.anotations} onChange={(e) => setForm((prev) => ({ ...prev, anotations: e.target.value }))} rows={2} />
            </label>
            <label className="col-span-full flex items-center gap-2.5 flex-row">
              <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" type="checkbox" checked={form.alert} onChange={(e) => setForm((prev) => ({ ...prev, alert: e.target.checked }))} />
              Alerta
            </label>
            {form.alert && (
              <label className="col-span-full">
                Descripcion de alerta
                <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.alertDescription} onChange={(e) => setForm((prev) => ({ ...prev, alertDescription: e.target.value }))} rows={2} />
              </label>
            )}
            <label className="col-span-full">
              HBLs
              <textarea className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.hbls} onChange={(e) => setForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
            </label>

            <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="bg-rose-500 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-rose-600 transition-colors disabled:opacity-50" disabled={createPackage.isPending}>
                {createPackage.isPending ? 'Registrando...' : 'Registrar paquete'}
              </button>
              <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}