import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePackage, useUpdatePackage, useDeletePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useRecipients, useUpdateRecipient, useCreateRecipient } from '../hooks/useRecipients';
import { useProvinces } from '../hooks/useProvinces';
import { useMunicipes } from '../hooks/useMunicipes';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import type { UpdatePackageDto } from '../api/packages.api';
import { toLocalDateInput, dateInputToIso, todayDateInput } from '../utils/date';
import { CustomSelect } from '../components/CustomSelect';
import { RecipientsCustomSelect } from '../components/RecipientsCustomSelect';
import { DatePicker } from '../components/DatePicker';

export default function PackagesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading: pkgLoading, error: pkgError } = usePackage(id || '');
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();
  const updateRecipient = useUpdateRecipient();
  const createRecipient = useCreateRecipient();
  const { data: guides = [] } = useGuides();
  const { data: recipients = [] } = useRecipients();
  const { data: provinces = [] } = useProvinces();
  const { data: municipes = [] } = useMunicipes();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();

  const [form, setForm] = useState({
    guideId: '', recipientId: '', recipientName: '', recipientIdCard: '', recipientPhone: '', provinceId: '', municipeId: '', address: '', weight: '',
    content: '', arrivalDate: '', statusDate: '', statusId: '', locationId: '',
    anotations: '', alert: false, alertDescription: '', hbls: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const initializedIdRef = useRef<string | null>(null);
  const [statusDateTouched, setStatusDateTouched] = useState(false);
  const minStatusDate = pkg?.statuses?.[0]?.createdAt
    ? toLocalDateInput(pkg.statuses[0].createdAt)
    : undefined;

  useEffect(() => {
    if (pkg && initializedIdRef.current !== id) {
      initializedIdRef.current = id ?? null;
      setStatusDateTouched(false);
      setForm({
        guideId: pkg.guide?.id || '',
        recipientId: pkg.recipient?.id || '',
        recipientName: pkg.recipient?.fullName || '',
        recipientIdCard: pkg.recipient?.idCard || '',
        recipientPhone: pkg.recipient?.phone || '',
        provinceId: pkg.province?.id || '',
        municipeId: pkg.municipe?.id || '',
        address: pkg.address || '',
        weight: pkg.weight != null ? String(pkg.weight) : '',
        content: pkg.content || '',
        arrivalDate: pkg.arrivalDate || '',
        statusDate: todayDateInput(),
        statusId: pkg.status?.id || '',
        locationId: pkg.location?.id || '',
        anotations: pkg.anotations || '',
        alert: pkg.alert || false,
        alertDescription: pkg.alertDescription || '',
        hbls: pkg.hbls ? pkg.hbls.map((h: { hblCode: string }) => h.hblCode).join(', ') : '',
      });
    }
  }, [pkg, id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setLocalError(null);
    try {
      let finalRecipientId = form.recipientId;
      const name = form.recipientName.trim();
      const idCard = form.recipientIdCard.trim();
      const phone = form.recipientPhone.trim() || undefined;
      const hasRecipientData = Boolean(name || idCard || phone);

      if (finalRecipientId) {
        const original = pkg?.recipient;
        const changed =
          name !== (original?.fullName ?? '') ||
          idCard !== (original?.idCard ?? '') ||
          phone !== (original?.phone ?? undefined);
        if (changed && hasRecipientData) {
          await updateRecipient.mutateAsync({
            id: finalRecipientId,
            dto: { fullName: name, idCard, phone },
          });
        }
      } else if (hasRecipientData) {
        const created = await createRecipient.mutateAsync({
          fullName: name,
          idCard,
          phone,
        });
        finalRecipientId = created.id;
      }

      const dto: UpdatePackageDto = {
        guideId: form.guideId || undefined,
        recipientId: finalRecipientId || undefined,
        provinceId: form.provinceId || undefined,
        municipeId: form.municipeId || undefined,
        address: form.address || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        content: form.content || undefined,
        arrivalDate: form.arrivalDate || undefined,
        statusDate: statusDateTouched ? dateInputToIso(form.statusDate) : undefined,
        statusId: form.statusId,
        locationId: form.locationId || undefined,
        anotations: form.anotations || undefined,
        alert: form.alert ? true : undefined,
        alertDescription: form.alertDescription || undefined,
        hbls: form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
      };
      await updatePackage.mutateAsync({ id, dto });
      navigate('/packages');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Eliminar este paquete? Esta acción no se puede deshacer.')) return;
    try {
      await deletePackage.mutateAsync(id);
      navigate('/packages');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  if (pkgLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>
        </div>
      </div>
    );
  }

  if (pkgError || !pkg) {
    return (
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">Paquete no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar paquete</h2>
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

            Nombre del cliente
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.recipientName} onChange={(e) => setForm((prev) => ({ ...prev, recipientName: e.target.value }))} />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Carnet del cliente
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.recipientIdCard} onChange={(e) => setForm((prev) => ({ ...prev, recipientIdCard: e.target.value }))} />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Telefono del cliente
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.recipientPhone} onChange={(e) => setForm((prev) => ({ ...prev, recipientPhone: e.target.value }))} />
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

            Fecha cambio de estado
            <DatePicker
              value={form.statusDate}
              min={minStatusDate}
              max={todayDateInput()}
              onChange={(v) => {
                setStatusDateTouched(true);
                setForm((prev) => ({ ...prev, statusDate: v }));
              }}
              className="w-full"
            />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Estado
            <CustomSelect
              value={form.statusId}
              onChange={(newStatusId) =>
                setForm((prev) => ({
                  ...prev,
                  statusId: newStatusId,
                  statusDate: !statusDateTouched && newStatusId !== (pkg?.status?.id || '')
                    ? toLocalDateInput(new Date().toISOString())
                    : prev.statusDate,
                }))
              }
              options={statuses}
              placeholder="Seleccionar"
            />
          </label>
           <label className="flex flex-col gap-1.5 font-medium">

            Ubicacion
            <CustomSelect value={form.locationId} onChange={(id) => setForm((prev) => ({ ...prev, locationId: id }))} options={locations} placeholder="Sin ubicacion" />
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
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updatePackage.isPending}>Actualizar paquete</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/packages')}>Cancelar</button>
            <button type="button" className="bg-rose-500 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-rose-600 transition-colors disabled:opacity-50" onClick={handleDelete} disabled={deletePackage.isPending}>{deletePackage.isPending ? 'Eliminando...' : 'Eliminar paquete'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
