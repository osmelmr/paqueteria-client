import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Agency, Location, Province, Status } from '../types';

const API_BASE = '';

type PackageForm = {
    guideRef: string;
    agencyId: string;
    recipientName: string;
    recipientIdCard: string;
    recipientPhone: string;
    recipientAddress: string;
    provinceId: string;
    addressDetail: string;
    weight: string;
    contentDescription: string;
    departureDate: string;
    statusId: string;
    locationId: string;
    isOrphan: string;
    hbls: string;
};

type StaticDefaults = {
    statusId: string;
    locationId: string;
    isOrphan: string;
};

type PackagePreview = {
    id: string;
    guideRef: string;
    agencyName: string;
    recipientName: string;
    recipientIdCard: string;
    recipientPhone: string;
    recipientAddress: string;
    provinceName: string;
    addressDetail: string;
    weight: string;
    contentDescription: string;
    departureDate: string;
    statusName: string;
    locationName: string;
    isOrphan: boolean;
    hbls: string[];
};

function BulkPackageEntryPage() {
    const [token] = useState(() => window.localStorage.getItem('paqueteria_token') || '');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [guideForm, setGuideForm] = useState({ agencyId: '', externalRef: '' });
    const [staticDefaults, setStaticDefaults] = useState<StaticDefaults>({ statusId: '', locationId: '', isOrphan: '' });
    const [packageForm, setPackageForm] = useState<PackageForm>({
        guideRef: '',
        agencyId: '',
        recipientName: '',
        recipientIdCard: '',
        recipientPhone: '',
        recipientAddress: '',
        provinceId: '',
        addressDetail: '',
        weight: '',
        contentDescription: '',
        departureDate: '',
        statusId: '',
        locationId: '',
        isOrphan: '',
        hbls: '',
    });
    const [packages, setPackages] = useState<PackagePreview[]>([]);

    const apiHeaders = useMemo(() => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }, [token]);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        Promise.all([fetch('/agencies', { headers: apiHeaders }), fetch('/statuses', { headers: apiHeaders }), fetch('/locations', { headers: apiHeaders }), fetch('/provinces', { headers: apiHeaders })])
            .then(async ([aRes, sRes, lRes, pRes]) => {
                if (!aRes.ok || !sRes.ok || !lRes.ok || !pRes.ok) {
                    throw new Error('No fue posible cargar los datos de referencia');
                }
                const [aData, sData, lData, pData] = await Promise.all([aRes.json(), sRes.json(), lRes.json(), pRes.json()]);
                setAgencies(Array.isArray(aData) ? aData : aData.data || []);
                setStatuses(Array.isArray(sData) ? sData : sData.data || []);
                setLocations(Array.isArray(lData) ? lData : lData.data || []);
                setProvinces(Array.isArray(pData) ? pData : pData.data || []);
            })
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [token, apiHeaders]);

    const getAgencyName = (agencyId: string) => agencies.find((item) => item.id === agencyId)?.name || '';
    const getStatusName = (statusId: string) => statuses.find((item) => item.id === statusId)?.name || '';
    const getLocationName = (locationId: string) => locations.find((item) => item.id === locationId)?.name || '';
    const getProvinceName = (provinceId: string) => provinces.find((item) => item.id === provinceId)?.name || '';

    const handleAddPackage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const guideRef = packageForm.guideRef || guideForm.externalRef || '';
        const agencyName = getAgencyName(packageForm.agencyId || guideForm.agencyId) || '';
        const statusId = packageForm.statusId || staticDefaults.statusId;
        const locationId = packageForm.locationId || staticDefaults.locationId;
        const isOrphan = packageForm.isOrphan ? packageForm.isOrphan === 'true' : staticDefaults.isOrphan === 'true';

        const nextPackage: PackagePreview = {
            id: crypto.randomUUID(),
            guideRef,
            agencyName,
            recipientName: packageForm.recipientName,
            recipientIdCard: packageForm.recipientIdCard,
            recipientPhone: packageForm.recipientPhone,
            recipientAddress: packageForm.recipientAddress,
            provinceName: getProvinceName(packageForm.provinceId),
            addressDetail: packageForm.addressDetail,
            weight: packageForm.weight,
            contentDescription: packageForm.contentDescription,
            departureDate: packageForm.departureDate,
            statusName: getStatusName(statusId),
            locationName: getLocationName(locationId),
            isOrphan,
            hbls: packageForm.hbls.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean),
        };

        setPackages((prev) => [nextPackage, ...prev]);
        setPackageForm((prev) => ({
            ...prev,
            recipientName: '',
            recipientIdCard: '',
            recipientPhone: '',
            recipientAddress: '',
            provinceId: '',
            addressDetail: '',
            weight: '',
            contentDescription: '',
            departureDate: '',
            statusId: '',
            locationId: '',
            isOrphan: '',
            hbls: '',
        }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFileName(file?.name || '');
    };

    if (!token) {
        return (
            <div className="panel">
                <h2>Bulk package entry</h2>
                <p>Debes iniciar sesión primero para usar esta página.</p>
            </div>
        );
    }

    return (
        <div className="panel">
            <h2>Ingreso masivo de paquetes</h2>
            {error && <div className="error-box">{error}</div>}
            {loading && <div className="loading-banner">Cargando opciones...</div>}

            <section className="list-card">
                <h3>Guía y agencia</h3>
                <form className="simple-form grid-form">
                    <label>
                        Agencia
                        <select value={guideForm.agencyId} onChange={(e) => setGuideForm((prev) => ({ ...prev, agencyId: e.target.value }))} required>
                            <option value="">Seleccionar agencia</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Nombre de la guía
                        <input
                            value={guideForm.externalRef}
                            onChange={(e) => setGuideForm((prev) => ({ ...prev, externalRef: e.target.value }))}
                            placeholder="REF-123"
                            required
                        />
                    </label>
                </form>
            </section>

            <section className="list-card">
                <h3>Valores estáticos</h3>
                <form className="simple-form grid-form">
                    <label>
                        Estado por defecto
                        <select value={staticDefaults.statusId} onChange={(e) => setStaticDefaults((prev) => ({ ...prev, statusId: e.target.value }))}>
                            <option value="">Ninguno</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Ubicación por defecto
                        <select value={staticDefaults.locationId} onChange={(e) => setStaticDefaults((prev) => ({ ...prev, locationId: e.target.value }))}>
                            <option value="">Ninguna</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="checkbox-label full-width">
                        <input
                            type="checkbox"
                            checked={staticDefaults.isOrphan === 'true'}
                            onChange={(e) => setStaticDefaults((prev) => ({ ...prev, isOrphan: e.target.checked ? 'true' : 'false' }))}
                        />
                        Convertir paquetes en huérfanos por defecto
                    </label>
                </form>
            </section>

            <section className="list-card">
                <h3>Agregar paquete</h3>
                <form onSubmit={handleAddPackage} className="simple-form grid-form">
                    <label>
                        Guía del paquete (sobrescribe la guía superior)
                        <input
                            value={packageForm.guideRef}
                            onChange={(e) => setPackageForm((prev) => ({ ...prev, guideRef: e.target.value }))}
                            placeholder="Usar guía superior si está vacío"
                        />
                    </label>
                    <label>
                        Agencia del paquete (sobrescribe la agencia superior)
                        <select value={packageForm.agencyId} onChange={(e) => setPackageForm((prev) => ({ ...prev, agencyId: e.target.value }))}>
                            <option value="">Usar agencia superior</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Nombre del destinatario
                        <input value={packageForm.recipientName} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientName: e.target.value }))} />
                    </label>
                    <label>
                        Carnet del destinatario
                        <input value={packageForm.recipientIdCard} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientIdCard: e.target.value }))} />
                    </label>
                    <label>
                        Teléfono del destinatario
                        <input value={packageForm.recipientPhone} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientPhone: e.target.value }))} />
                    </label>
                    <label className="full-width">
                        Dirección del destinatario
                        <input value={packageForm.recipientAddress} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientAddress: e.target.value }))} />
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
                        Dirección entrega
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
                        <select value={packageForm.statusId} onChange={(e) => setPackageForm((prev) => ({ ...prev, statusId: e.target.value }))}>
                            <option value="">Usar valor estático</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Ubicación
                        <select value={packageForm.locationId} onChange={(e) => setPackageForm((prev) => ({ ...prev, locationId: e.target.value }))}>
                            <option value="">Usar valor estático</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Huerfano
                        <select value={packageForm.isOrphan} onChange={(e) => setPackageForm((prev) => ({ ...prev, isOrphan: e.target.value }))}>
                            <option value="">Usar valor estático</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </label>
                    <label className="full-width">
                        HBLs (coma, punto y coma o nueva línea)
                        <textarea value={packageForm.hbls} onChange={(e) => setPackageForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
                    </label>
                    <label className="full-width">
                        Archivo de entrada (sin función actualmente)
                        <input type="file" onChange={handleFileChange} />
                        {fileName && <small>Archivo seleccionado: {fileName}</small>}
                    </label>
                    <button type="submit">Agregar paquete</button>
                </form>
            </section>

            <section className="list-card">
                <h3>Previsualización de paquetes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Guía</th>
                            <th>Agencia</th>
                            <th>Destinatario</th>
                            <th>Provincia</th>
                            <th>Estado</th>
                            <th>Ubicación</th>
                            <th>Huérfano</th>
                            <th>HBLs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map((pkg) => (
                            <tr key={pkg.id}>
                                <td>{pkg.guideRef || '—'}</td>
                                <td>{pkg.agencyName || '—'}</td>
                                <td>{pkg.recipientName || pkg.recipientIdCard || '—'}</td>
                                <td>{pkg.provinceName || '—'}</td>
                                <td>{pkg.statusName || '—'}</td>
                                <td>{pkg.locationName || '—'}</td>
                                <td>{pkg.isOrphan ? 'Sí' : 'No'}</td>
                                <td>{pkg.hbls.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default BulkPackageEntryPage;
