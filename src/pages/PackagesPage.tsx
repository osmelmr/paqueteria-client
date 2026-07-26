import { useEffect, useState, type FormEvent } from 'react';
import type { Guide, Location, PackageItem, Province, Recipient, Status } from '../types';
import { api } from '../api';

type PackageCreateForm = {
  guideId: string;
  recipientId: string;
  provinceId: string;
  addressDetail: string;
  weight: string;
  contentDescription: string;
  arrivalDate: string;
  statusId: string;
  locationId: string;
  isOrphan: boolean;
  anotations: string;
  alert: boolean;
  alertDescription: string;
  hbls: string;
};

const normalizeBody = (f: PackageCreateForm) => ({
  guideId: f.guideId || undefined,
  recipientId: f.recipientId || undefined,
  provinceId: f.provinceId || undefined,
  addressDetail: f.addressDetail || undefined,
  weight: f.weight ? Number(f.weight) : undefined,
  contentDescription: f.contentDescription || undefined,
  arrivalDate: f.arrivalDate || undefined,
  statusId: f.statusId || undefined,
  locationId: f.locationId || undefined,
  isOrphan: f.isOrphan ? true : undefined,
  anotations: f.anotations || undefined,
  alert: f.alert ? true : undefined,
  alertDescription: f.alertDescription || undefined,
  hbls: f.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
});

function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({ guideId: '', statusId: '', provinceId: '', recipientId: '', hbl: '', search: '' });
  const [form, setForm] = useState<PackageCreateForm>({
    guideId: '', recipientId: '', provinceId: '', addressDetail: '', weight: '',
    contentDescription: '', arrivalDate: '', statusId: '', locationId: '', isOrphan: false,
    anotations: '', alert: false, alertDescription: '', hbls: '',
  });

  const loadRefs = async () => {
    const [gData, rData, pData, sData, lData] = await Promise.all([
      api<Guide[]>('/guides'), api<Recipient[]>('/recipients'), api<Province[]>('/provinces'),
      api<Status[]>('/statuses'), api<Location[]>('/locations'),
    ]);
    setGuides(Array.isArray(gData) ? gData : (gData as unknown as { data: Guide[] }).data || []);
    setRecipients(Array.isArray(rData) ? rData : (rData as unknown as { data: Recipient[] }).data || []);
    setProvinces(Array.isArray(pData) ? pData : (pData as unknown as { data: Province[] }).data || []);
    setStatuses(Array.isArray(sData) ? sData : (sData as unknown as { data: Status[] }).data || []);
    setLocations(Array.isArray(lData) ? lData : (lData as unknown as { data: Location[] }).data || []);
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (!value) return;
        params.set(key === 'statusId' ? 'status' : key, value);
      });
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api<PackageItem[]>(`/packages${qs}`);
      setPackages(Array.isArray(data) ? data : (data as unknown as { data: PackageItem[] }).data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRefs(); fetchPackages(); }, []);

  useEffect(() => {
    if (statuses.length > 0 && !form.statusId) {
      setForm((prev) => ({ ...prev, statusId: statuses[0].id }));
    }
  }, [statuses]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api('/packages', 'POST', normalizeBody(form));
      setForm((prev) => ({ ...prev, addressDetail: '', weight: '', contentDescription: '', arrivalDate: '', anotations: '', alert: false, alertDescription: '', hbls: '' }));
      await fetchPackages();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (pkg: PackageItem, statusId: string, locationId: string) => {
    if (!pkg.id) return;
    setLoading(true);
    try {
      await api(`/packages/${pkg.id}/status`, 'PATCH', { statusId, locationId: locationId || undefined });
      await fetchPackages();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este paquete?')) return;
    setLoading(true);
    try {
      await api(`/packages/${id}`, 'DELETE');
      await fetchPackages();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>Paquetes</h2>
      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando...</div>}

      <div className="panel-row">
        <form onSubmit={(e) => { e.preventDefault(); fetchPackages(); }} className="simple-form filter-form">
          <div className="filter-grid">
            <label>
              Guía
              <select value={filter.guideId} onChange={(e) => setFilter((prev) => ({ ...prev, guideId: e.target.value }))}>
                <option value="">Todas</option>
                {guides.map((g) => <option key={g.id} value={g.id}>{g.externalRef || g.agency?.name}</option>)}
              </select>
            </label>
            <label>
              Estado
              <select value={filter.statusId} onChange={(e) => setFilter((prev) => ({ ...prev, statusId: e.target.value }))}>
                <option value="">Todos</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>
              Provincia
              <select value={filter.provinceId} onChange={(e) => setFilter((prev) => ({ ...prev, provinceId: e.target.value }))}>
                <option value="">Todas</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Destinatario
              <select value={filter.recipientId} onChange={(e) => setFilter((prev) => ({ ...prev, recipientId: e.target.value }))}>
                <option value="">Todos</option>
                {recipients.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
              </select>
            </label>
            <label>
              HBL
              <input value={filter.hbl} onChange={(e) => setFilter((prev) => ({ ...prev, hbl: e.target.value }))} placeholder="Buscar por HBL" />
            </label>
            <label>
              Búsqueda
              <input value={filter.search} onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))} placeholder="Dirección, contenido..." />
            </label>
          </div>
          <button type="submit">Filtrar</button>
        </form>

        <form onSubmit={handleCreate} className="simple-form grid-form">
          <h3 className="full-width">Crear paquete</h3>
          <label>
            Guía
            <select value={form.guideId} onChange={(e) => setForm((prev) => ({ ...prev, guideId: e.target.value }))}>
              <option value="">Sin guía</option>
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
            Dirección
            <input value={form.addressDetail} onChange={(e) => setForm((prev) => ({ ...prev, addressDetail: e.target.value }))} />
          </label>
          <label>
            Peso
            <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))} />
          </label>
          <label>
            Contenido
            <input value={form.contentDescription} onChange={(e) => setForm((prev) => ({ ...prev, contentDescription: e.target.value }))} />
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
            Ubicación
            <select value={form.locationId} onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}>
              <option value="">Sin ubicación</option>
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
            Huérfano
          </label>
          <button type="submit" className="full-width">Crear paquete</button>
        </form>
      </div>

      <div className="list-card">
        <h3>Paquetes ({packages.length})</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>HBLs</th><th>Destinatario</th><th>Provincia</th>
              <th>Estado</th><th>Ubicación</th><th>Alerta</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.id}</td>
                <td>{pkg.hbls ? pkg.hbls.map((h) => h.hblCode).join(', ') : ''}</td>
                <td>{pkg.recipient?.fullName || '—'}</td>
                <td>{pkg.province?.name || '—'}</td>
                <td>{pkg.status?.name || '—'}</td>
                <td>{pkg.location?.name || '—'}</td>
                <td>{pkg.alert ? <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>⚠ {pkg.alertDescription || 'Si'}</span> : '—'}</td>
                <td>
                  <div className="inline-actions">
                    <select value={pkg.status?.id || ''} onChange={(e) => handleUpdateStatus(pkg, e.target.value, pkg.location?.id || '')}>
                      <option value="">Estado</option>
                      {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={pkg.location?.id || ''} onChange={(e) => handleUpdateStatus(pkg, pkg.status?.id || '', e.target.value)}>
                      <option value="">Ubicación</option>
                      {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <button type="button" className="small secondary" onClick={() => handleDelete(pkg.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PackagesPage;
