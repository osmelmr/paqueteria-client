import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePackage, useUpdatePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useRecipients } from '../hooks/useRecipients';
import { useProvinces } from '../hooks/useProvinces';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import type { CreatePackageDto } from '../api/packages.api';

export default function PackagesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading: pkgLoading, error: pkgError } = usePackage(id || '');
  const updatePackage = useUpdatePackage();
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
    if (pkg) {
      setForm({
        guideId: pkg.guide?.id || '',
        recipientId: pkg.recipient?.id || '',
        provinceId: pkg.province?.id || '',
        address: pkg.addressDetail || '',
        weight: pkg.weight != null ? String(pkg.weight) : '',
        content: pkg.contentDescription || '',
        arrivalDate: pkg.arrivalDate || '',
        statusId: pkg.status?.id || '',
        locationId: pkg.location?.id || '',
        isOrphan: pkg.isOrphan || false,
        anotations: pkg.anotations || '',
        alert: pkg.alert || false,
        alertDescription: pkg.alertDescription || '',
        hbls: pkg.hbls ? pkg.hbls.map((h: { hblCode: string }) => h.hblCode).join(', ') : '',
      });
    }
  }, [pkg]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
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
      await updatePackage.mutateAsync({ id, dto });
      navigate('/packages');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  if (pkgLoading) {
    return (
      <div className="page">
        <div className="panel">
          <div className="loading-banner">Cargando...</div>
        </div>
      </div>
    );
  }

  if (pkgError || !pkg) {
    return (
      <div className="page">
        <div className="panel">
          <div className="error-box">Paquete no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel">
        <h2 style={{ margin: 0, marginBottom: 16 }}>Editar paquete</h2>
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
            <button type="submit" disabled={updatePackage.isPending}>Actualizar paquete</button>
            <button type="button" className="secondary" onClick={() => navigate('/packages')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
