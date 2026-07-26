import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackages, useUpdatePackageStatus, useDeletePackage } from '../hooks/usePackages';
import { useGuides } from '../hooks/useGuides';
import { useRecipients } from '../hooks/useRecipients';
import { useProvinces } from '../hooks/useProvinces';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import type { PackageFilters } from '../api/packages.api';

export default function PackagesListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PackageFilters>({});
  const { data: packages = [], isLoading, error: queryError } = usePackages(filters);
  const updateStatus = useUpdatePackageStatus();
  const deletePackage = useDeletePackage();

  const { data: guides = [] } = useGuides();
  const { data: recipients = [] } = useRecipients();
  const { data: provinces = [] } = useProvinces();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();

  const [filterForm, setFilterForm] = useState({ guideId: '', statusId: '', provinceId: '', recipientId: '', hbl: '', search: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const error = queryError ? (queryError as Error).message : localError;

  const applyFilters = () => {
    const f: PackageFilters = {};
    if (filterForm.guideId) f.guideId = filterForm.guideId;
    if (filterForm.statusId) f.status = filterForm.statusId;
    if (filterForm.provinceId) f.provinceId = filterForm.provinceId;
    if (filterForm.recipientId) f.recipientId = filterForm.recipientId;
    if (filterForm.hbl) f.hbl = filterForm.hbl;
    if (filterForm.search) f.search = filterForm.search;
    setFilters(f);
  };

  const handleUpdateStatus = async (pkgId: string, statusId: string, locationId: string) => {
    setLocalError(null);
    try {
      await updateStatus.mutateAsync({ id: pkgId, statusId, locationId: locationId || undefined });
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este paquete?')) return;
    setLocalError(null);
    try {
      await deletePackage.mutateAsync(id);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Paquetes</h2>
          <button type="button" onClick={() => navigate('/packages/new')}>Nuevo paquete</button>
        </div>
        {error && <div className="error-box">{error}</div>}
        {isLoading && <div className="loading-banner">Cargando...</div>}

        <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="simple-form filter-form">
          <div className="filter-grid">
            <label>
              Guia
              <select value={filterForm.guideId} onChange={(e) => setFilterForm((prev) => ({ ...prev, guideId: e.target.value }))}>
                <option value="">Todas</option>
                {guides.map((g) => <option key={g.id} value={g.id}>{g.externalRef || g.agency?.name}</option>)}
              </select>
            </label>
            <label>
              Estado
              <select value={filterForm.statusId} onChange={(e) => setFilterForm((prev) => ({ ...prev, statusId: e.target.value }))}>
                <option value="">Todos</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>
              Provincia
              <select value={filterForm.provinceId} onChange={(e) => setFilterForm((prev) => ({ ...prev, provinceId: e.target.value }))}>
                <option value="">Todas</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              Destinatario
              <select value={filterForm.recipientId} onChange={(e) => setFilterForm((prev) => ({ ...prev, recipientId: e.target.value }))}>
                <option value="">Todos</option>
                {recipients.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
              </select>
            </label>
            <label>
              HBL
              <input value={filterForm.hbl} onChange={(e) => setFilterForm((prev) => ({ ...prev, hbl: e.target.value }))} placeholder="Buscar por HBL" />
            </label>
            <label>
              Busqueda
              <input value={filterForm.search} onChange={(e) => setFilterForm((prev) => ({ ...prev, search: e.target.value }))} placeholder="Direccion, contenido..." />
            </label>
          </div>
          <button type="submit">Filtrar</button>
        </form>

        <div className="list-card">
          <h3>Paquetes ({packages.length})</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>HBLs</th><th>Destinatario</th><th>Provincia</th>
                <th>Estado</th><th>Ubicacion</th><th>Alerta</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg: any) => (
                <tr key={pkg.id}>
                  <td>{pkg.id}</td>
                  <td>{pkg.hbls ? pkg.hbls.map((h: { hblCode: string }) => h.hblCode).join(', ') : ''}</td>
                  <td>{pkg.recipient?.fullName || '—'}</td>
                  <td>{pkg.province?.name || '—'}</td>
                  <td>{pkg.status?.name || '—'}</td>
                  <td>{pkg.location?.name || '—'}</td>
                  <td>{pkg.alert ? <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>&#9888; {pkg.alertDescription || 'Si'}</span> : '—'}</td>
                  <td>
                    <div className="inline-actions">
                      <select value={pkg.status?.id || ''} onChange={(e) => handleUpdateStatus(pkg.id, e.target.value, pkg.location?.id || '')}>
                        <option value="">Estado</option>
                        {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select value={pkg.location?.id || ''} onChange={(e) => handleUpdateStatus(pkg.id, pkg.status?.id || '', e.target.value)}>
                        <option value="">Ubicacion</option>
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
    </div>
  );
}
