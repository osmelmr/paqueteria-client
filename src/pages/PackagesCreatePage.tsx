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
    content: '', arrivalDate: '', statusId: '', locationId: '', isOrphan: false,
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
        isOrphan: form.isOrphan ? true : undefined,
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
    <div className="page">
      <div className="panel">
        <h2 style={{ margin: 0, marginBottom: 16 }}>Nuevo paquete</h2>
        {localError && <div className="error-box">{localError}</div>}
        <form onSubmit={handleSubmit} className="simple-form grid-form">
          <label>
            Guia
            <select value={form.guideId} onChange={(e) => setForm((prev) => ({ ...prev, guideId: e.target.value }))}>
              <option value="">Sin guia</option>
              {guides.map((g) => <option key={g.id} value={g.id}>{g.externalRef || g.agency?.name}</option>)}
            </select>
          </label>
          <label>
            Destinatario
            <select value={form.recipientId} onChange={(e) => setForm((prev) => ({ ...prev, recipientId: e.target.value }))}>
              <option value="">Seleccionar</option>
              {recipients.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
            </select>
          </label>
          <label>
            Provincia
            <select value={form.provinceId} onChange={(e) => setForm((prev) => ({ ...prev, provinceId: e.target.value }))}>
              <option value="">Seleccionar</option>
              {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>
            Direccion
            <input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          </label>
          <label>
            Peso
            <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))} />
          </label>
          <label>
            Contenido
            <input value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
          </label>
          <label>
            Fecha llegada
            <input type="date" value={form.arrivalDate} onChange={(e) => setForm((prev) => ({ ...prev, arrivalDate: e.target.value }))} />
          </label>
          <label>
            Estado
            <select value={form.statusId} onChange={(e) => setForm((prev) => ({ ...prev, statusId: e.target.value }))} required>
              <option value="">Seleccionar</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>
            Ubicacion
            <select value={form.locationId} onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}>
              <option value="">Sin ubicacion</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
          <label className="full-width">
            Anotaciones
            <textarea value={form.anotations} onChange={(e) => setForm((prev) => ({ ...prev, anotations: e.target.value }))} rows={2} />
          </label>
          <label className="full-width checkbox-label">
            <input type="checkbox" checked={form.alert} onChange={(e) => setForm((prev) => ({ ...prev, alert: e.target.checked }))} />
            Alerta
          </label>
          {form.alert && (
            <label className="full-width">
              Descripcion de alerta
              <textarea value={form.alertDescription} onChange={(e) => setForm((prev) => ({ ...prev, alertDescription: e.target.value }))} rows={2} />
            </label>
          )}
          <label className="full-width">
            HBLs
            <textarea value={form.hbls} onChange={(e) => setForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
          </label>
          <label className="full-width checkbox-label">
            <input type="checkbox" checked={form.isOrphan} onChange={(e) => setForm((prev) => ({ ...prev, isOrphan: e.target.checked }))} />
            Hu erfano
          </label>
          <div className="button-group" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={createPackage.isPending}>Crear paquete</button>
            <button type="button" className="secondary" onClick={() => navigate('/packages')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
