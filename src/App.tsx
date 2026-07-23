import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type {
  Agency,
  Guide,
  Location,
  Province,
  Recipient,
  Status,
  PackageItem,
  User,
} from './types';

const API_BASE = '';

type Section = 'login' | 'agencies' | 'guides' | 'packages' | 'recipients' | 'provinces' | 'locations' | 'statuses';

type PackageCreateForm = {
  guideId: string;
  recipientId: string;
  provinceId: string;
  addressDetail: string;
  weight: string;
  contentDescription: string;
  departureDate: string;
  statusId: string;
  locationId: string;
  isOrphan: boolean;
  hbls: string;
};

type PackageFilterForm = {
  guideId: string;
  statusId: string;
  provinceId: string;
  recipientId: string;
  hbl: string;
  search: string;
};

const normalizeBody = (packageForm: PackageCreateForm) => {
  return {
    guideId: packageForm.guideId || undefined,
    recipientId: packageForm.recipientId || undefined,
    provinceId: packageForm.provinceId || undefined,
    addressDetail: packageForm.addressDetail || undefined,
    weight: packageForm.weight ? Number(packageForm.weight) : undefined,
    contentDescription: packageForm.contentDescription || undefined,
    departureDate: packageForm.departureDate || undefined,
    statusId: packageForm.statusId || undefined,
    locationId: packageForm.locationId || undefined,
    isOrphan: packageForm.isOrphan ? true : undefined,
    hbls: packageForm.hbls
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
};

function App() {
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [guideForm, setGuideForm] = useState({ externalRef: '', agencyId: '' });
  const [agencyForm, setAgencyForm] = useState({ name: '' });
  const [recipientForm, setRecipientForm] = useState({ fullName: '', idCard: '', phone: '', address: '' });
  const [provinceForm, setProvinceForm] = useState({ name: '' });
  const [locationForm, setLocationForm] = useState({ name: '', type: '' });
  const [packageForm, setPackageForm] = useState<PackageCreateForm>({
    guideId: '',
    recipientId: '',
    provinceId: '',
    addressDetail: '',
    weight: '',
    contentDescription: '',
    departureDate: '',
    statusId: '',
    locationId: '',
    isOrphan: false,
    hbls: '',
  });

  const [packageFilter, setPackageFilter] = useState<PackageFilterForm>({
    guideId: '',
    statusId: '',
    provinceId: '',
    recipientId: '',
    hbl: '',
    search: '',
  });

  const apiHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem('paqueteria_token');
    const savedUser = window.localStorage.getItem('paqueteria_user');
    if (savedToken) {
      setToken(savedToken);
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setSection('guides');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    if (section !== 'login') {
      loadReferenceData();
      fetchPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, section]);

  useEffect(() => {
    if (statuses.length > 0 && !packageForm.statusId) {
      setPackageForm((prev) => ({ ...prev, statusId: statuses[0].id }));
    }
  }, [statuses, packageForm.statusId]);

  const request = async (path: string, method = 'GET', body?: unknown) => {
    setError(null);
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: apiHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error(data?.message || data?.error?.message || res.statusText || 'Request failed');
    }
    return data;
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await request('/auth/login', 'POST', loginForm);
      setToken(result.accessToken);
      setUser(result.user);
      window.localStorage.setItem('paqueteria_token', result.accessToken);
      window.localStorage.setItem('paqueteria_user', JSON.stringify(result.user));
      setSection('guides');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    window.localStorage.removeItem('paqueteria_token');
    window.localStorage.removeItem('paqueteria_user');
    setGuides([]);
    setLocations([]);
    setProvinces([]);
    setRecipients([]);
    setStatuses([]);
    setPackages([]);
    setSection('login');
  };

  const loadReferenceData = async () => {
    setLoading(true);
    try {
      const [statusesData, provincesData, locationsData, recipientsData, guidesData, agenciesData] = await Promise.all([
        request('/statuses'),
        request('/provinces'),
        request('/locations'),
        request('/recipients'),
        request('/guides'),
        request('/agencies'),
      ]);
      setStatuses(Array.isArray(statusesData) ? statusesData : statusesData.data || []);
      setProvinces(Array.isArray(provincesData) ? provincesData : provincesData.data || []);
      setLocations(Array.isArray(locationsData) ? locationsData : locationsData.data || []);
      setRecipients(Array.isArray(recipientsData) ? recipientsData : recipientsData.data || []);
      setGuides(Array.isArray(guidesData) ? guidesData : guidesData.data || []);
      setAgencies(Array.isArray(agenciesData) ? agenciesData : agenciesData.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(packageFilter).forEach(([key, value]) => {
        if (!value) return;
        const queryKey = key === 'statusId' ? 'status' : key;
        params.set(queryKey, value);
      });
      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await request(`/packages${query}`);
      setPackages(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createGuide = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const newGuide = await request('/guides', 'POST', guideForm);
      setGuides((prev) => [newGuide, ...prev]);
      setGuideForm({ externalRef: '', agencyId: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createAgency = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const newAgency = await request('/agencies', 'POST', agencyForm);
      setAgencies((prev) => [newAgency, ...prev]);
      setAgencyForm({ name: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createRecipient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const newRecipient = await request('/recipients', 'POST', recipientForm);
      setRecipients((prev) => [newRecipient, ...prev]);
      setRecipientForm({ fullName: '', idCard: '', phone: '', address: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createProvince = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const newProvince = await request('/provinces', 'POST', provinceForm);
      setProvinces((prev) => [newProvince, ...prev]);
      setProvinceForm({ name: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const newLocation = await request('/locations', 'POST', locationForm);
      setLocations((prev) => [newLocation, ...prev]);
      setLocationForm({ name: '', type: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const body = normalizeBody(packageForm);
      const newPackage = await request('/packages', 'POST', body);
      setPackages((prev) => [newPackage, ...prev]);
      setPackageForm((prev) => ({ ...prev, addressDetail: '', weight: '', contentDescription: '', departureDate: '', hbls: '' }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updatePackageStatus = async (pkg: PackageItem, statusId: string, locationId: string) => {
    if (!pkg.id) return;
    setLoading(true);
    try {
      const updated = await request(`/packages/${pkg.id}/status`, 'PATCH', { statusId, locationId: locationId || undefined });
      setPackages((prev) => prev.map((item) => (item.id === pkg.id ? updated : item)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteGuide = async (id: string) => {
    setLoading(true);
    try {
      await request(`/guides/${id}`, 'DELETE');
      setGuides((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <header className="app-header">
      <div>
        <h1>Paquetería tester</h1>
        <p className="subtitle">Interfaz básica para probar login y CRUD de guías, paquetes, destinatarios, provincias y ubicaciones.</p>
      </div>
      <div className="user-panel">
        {user ? (
          <>
            <span>Conectado como <strong>{user.username}</strong></span>
            <button type="button" className="secondary" onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <span>Usuario no autenticado</span>
        )}
      </div>
    </header>
  );

  const renderNav = () => (
    <nav className="section-nav">
      {['agencies', 'guides', 'packages', 'recipients', 'provinces', 'locations', 'statuses'].map((item) => (
        <button
          key={item}
          className={section === item ? 'active' : ''}
          onClick={() => setSection(item as Section)}
          type="button"
        >
          {item[0].toUpperCase() + item.slice(1)}
        </button>
      ))}
    </nav>
  );

  const renderError = () => error && <div className="error-box">{error}</div>;

  const renderLogin = () => (
    <section className="panel">
      <h2>Acceso</h2>
      <form onSubmit={handleLogin} className="simple-form">
        <label>
          Usuario
          <input
            value={loginForm.username}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p className="hint">Usa el login del backend para obtener el token y habilitar las demás pruebas.</p>
    </section>
  );

  const renderGuides = () => (
    <section className="panel">
      <h2>Guías</h2>
      <form onSubmit={createGuide} className="simple-form grid-form">
        <label>
          Agencia
          <select
            value={guideForm.agencyId}
            onChange={(e) => setGuideForm((prev) => ({ ...prev, agencyId: e.target.value }))}
            required
          >
            <option value="">Seleccionar agencia</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>{agency.name}</option>
            ))}
          </select>
        </label>
        <label>
          Referencia externa
          <input
            value={guideForm.externalRef}
            onChange={(e) => setGuideForm((prev) => ({ ...prev, externalRef: e.target.value }))}
            required
          />
        </label>
        <button type="submit" disabled={loading}>Crear guía</button>
      </form>

      <div className="list-card">
        <h3>Guías existentes</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Agencia</th>
              <th>Referencia</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id}>
                <td>{guide.id}</td>
                <td>{guide.agency?.name || '—'}</td>
                <td>{guide.externalRef}</td>
                <td>
                  <button type="button" className="small" onClick={() => deleteGuide(guide.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAgencies = () => (
    <section className="panel">
      <h2>Agencias</h2>
      <form onSubmit={createAgency} className="simple-form two-column-form">
        <label>
          Nombre
          <input value={agencyForm.name} onChange={(e) => setAgencyForm({ name: e.target.value })} required />
        </label>
        <button type="submit">Crear agencia</button>
      </form>

      <div className="list-card">
        <h3>Agencias existentes</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr key={agency.id}>
                <td>{agency.id}</td>
                <td>{agency.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderPackages = () => (
    <section className="panel">
      <h2>Paquetes</h2>
      <div className="panel-row">
        <form onSubmit={(e) => { e.preventDefault(); fetchPackages(); }} className="simple-form filter-form">
          <div className="filter-grid">
            <label>
              Guía
              <select value={packageFilter.guideId} onChange={(e) => setPackageFilter((prev) => ({ ...prev, guideId: e.target.value }))}>
                <option value="">Todas</option>
                {guides.map((guide) => (
                  <option key={guide.id} value={guide.id}>{guide.externalRef || guide.agency?.name}</option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select value={packageFilter.statusId} onChange={(e) => setPackageFilter((prev) => ({ ...prev, statusId: e.target.value }))}>
                <option value="">Todos</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </label>
            <label>
              Provincia
              <select value={packageFilter.provinceId} onChange={(e) => setPackageFilter((prev) => ({ ...prev, provinceId: e.target.value }))}>
                <option value="">Todas</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>{province.name}</option>
                ))}
              </select>
            </label>
            <label>
              Destinatario
              <select value={packageFilter.recipientId} onChange={(e) => setPackageFilter((prev) => ({ ...prev, recipientId: e.target.value }))}>
                <option value="">Todos</option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>{recipient.fullName}</option>
                ))}
              </select>
            </label>
            <label>
              HBL
              <input value={packageFilter.hbl} onChange={(e) => setPackageFilter((prev) => ({ ...prev, hbl: e.target.value }))} placeholder="Buscar por HBL" />
            </label>
            <label>
              Búsqueda libre
              <input value={packageFilter.search} onChange={(e) => setPackageFilter((prev) => ({ ...prev, search: e.target.value }))} placeholder="Dirección, contenido..." />
            </label>
          </div>
          <button type="submit">Filtrar</button>
        </form>

        <form onSubmit={createPackage} className="simple-form grid-form">
          <h3>Crear paquete</h3>
          <label>
            Guía
            <select value={packageForm.guideId} onChange={(e) => setPackageForm((prev) => ({ ...prev, guideId: e.target.value }))}>
              <option value="">Sin guía</option>
              {guides.map((guide) => (
                <option key={guide.id} value={guide.id}>{guide.externalRef || guide.agency?.name}</option>
              ))}
            </select>
          </label>
          <label>
            Destinatario
            <select value={packageForm.recipientId} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientId: e.target.value }))}>
              <option value="">Seleccionar destinatario</option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>{recipient.fullName}</option>
              ))}
            </select>
          </label>
          <label>
            Provincia
            <select value={packageForm.provinceId} onChange={(e) => setPackageForm((prev) => ({ ...prev, provinceId: e.target.value }))}>
              <option value="">Seleccionar provincia</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>{province.name}</option>
              ))}
            </select>
          </label>
          <label>
            Dirección
            <input value={packageForm.addressDetail} onChange={(e) => setPackageForm((prev) => ({ ...prev, addressDetail: e.target.value }))} />
          </label>
          <label>
            Peso
            <input type="number" step="0.1" value={packageForm.weight} onChange={(e) => setPackageForm((prev) => ({ ...prev, weight: e.target.value }))} />
          </label>
          <label>
            Contenido
            <input value={packageForm.contentDescription} onChange={(e) => setPackageForm((prev) => ({ ...prev, contentDescription: e.target.value }))} />
          </label>
          <label>
            Fecha de salida
            <input type="date" value={packageForm.departureDate} onChange={(e) => setPackageForm((prev) => ({ ...prev, departureDate: e.target.value }))} />
          </label>
          <label>
            Estado
            <select value={packageForm.statusId} onChange={(e) => setPackageForm((prev) => ({ ...prev, statusId: e.target.value }))} required>
              <option value="">Seleccionar estado</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </label>
          <label>
            Ubicación
            <select value={packageForm.locationId} onChange={(e) => setPackageForm((prev) => ({ ...prev, locationId: e.target.value }))}>
              <option value="">Sin ubicación</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>
          <label className="full-width">
            HBLs (coma, punto y coma o nueva línea)
            <textarea value={packageForm.hbls} onChange={(e) => setPackageForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
          </label>
          <label className="full-width checkbox-label">
            <input type="checkbox" checked={packageForm.isOrphan} onChange={(e) => setPackageForm((prev) => ({ ...prev, isOrphan: e.target.checked }))} /> Paquete huérfano
          </label>
          <button type="submit">Crear paquete</button>
        </form>
      </div>

      <div className="list-card">
        <h3>Paquetes</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>HBLs</th>
              <th>Destinatario</th>
              <th>Provincia</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Acciones</th>
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
                <td>
                  <div className="inline-actions">
                    <select
                      value={pkg.status?.id || ''}
                      onChange={(e) => updatePackageStatus(pkg, e.target.value, pkg.location?.id || '')}
                    >
                      <option value="">Estado</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                    <select
                      value={pkg.location?.id || ''}
                      onChange={(e) => updatePackageStatus(pkg, pkg.status?.id || '', e.target.value)}
                    >
                      <option value="">Ubicación</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderRecipients = () => (
    <section className="panel">
      <h2>Destinatarios</h2>
      <form onSubmit={createRecipient} className="simple-form grid-form">
        <label>
          Nombre
          <input value={recipientForm.fullName} onChange={(e) => setRecipientForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
        </label>
        <label>
          Carnet
          <input value={recipientForm.idCard} onChange={(e) => setRecipientForm((prev) => ({ ...prev, idCard: e.target.value }))} required />
        </label>
        <label>
          Teléfono
          <input value={recipientForm.phone} onChange={(e) => setRecipientForm((prev) => ({ ...prev, phone: e.target.value }))} />
        </label>
        <label className="full-width">
          Dirección
          <input value={recipientForm.address} onChange={(e) => setRecipientForm((prev) => ({ ...prev, address: e.target.value }))} />
        </label>
        <button type="submit">Crear destinatario</button>
      </form>

      <div className="list-card">
        <h3>Destinatarios</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Carnet</th>
              <th>Teléfono</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((recipient) => (
              <tr key={recipient.id}>
                <td>{recipient.fullName}</td>
                <td>{recipient.idCard}</td>
                <td>{recipient.phone || '—'}</td>
                <td>{recipient.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderProvinces = () => (
    <section className="panel">
      <h2>Provincias</h2>
      <form onSubmit={createProvince} className="simple-form two-column-form">
        <label>
          Nombre
          <input value={provinceForm.name} onChange={(e) => setProvinceForm({ name: e.target.value })} required />
        </label>
        <button type="submit">Crear provincia</button>
      </form>

      <div className="list-card">
        <h3>Provincias</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {provinces.map((province) => (
              <tr key={province.id}>
                <td>{province.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderLocations = () => (
    <section className="panel">
      <h2>Ubicaciones</h2>
      <form onSubmit={createLocation} className="simple-form grid-form">
        <label>
          Nombre
          <input value={locationForm.name} onChange={(e) => setLocationForm((prev) => ({ ...prev, name: e.target.value }))} required />
        </label>
        <label>
          Tipo
          <input value={locationForm.type} onChange={(e) => setLocationForm((prev) => ({ ...prev, type: e.target.value }))} required />
        </label>
        <button type="submit">Crear ubicación</button>
      </form>

      <div className="list-card">
        <h3>Ubicaciones</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id}>
                <td>{location.name}</td>
                <td>{location.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderStatuses = () => (
    <section className="panel">
      <h2>Estados</h2>
      <div className="list-card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.id}>
                <td>{status.name}</td>
                <td>{status.category || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="app-shell">
      {renderHeader()}
      {renderError()}
      {!token ? renderLogin() : (
        <>
          {renderNav()}
          {loading && <div className="loading-banner">Cargando...</div>}
          {section === 'agencies' && renderAgencies()}
          {section === 'guides' && renderGuides()}
          {section === 'packages' && renderPackages()}
          {section === 'recipients' && renderRecipients()}
          {section === 'provinces' && renderProvinces()}
          {section === 'locations' && renderLocations()}
          {section === 'statuses' && renderStatuses()}
        </>
      )}
    </div>
  );
}

export default App;
