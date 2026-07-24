import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Agency, Location, Province, Recipient, Status } from '../types';

type PackageForm = {
    guideRef: string;
    agencyId: string;
    recipientId: string;
    recipientName: string;
    recipientIdCard: string;
    recipientPhone: string;
    provinceId: string;
    address: string;
    weight: string;
    content: string;
    departureDate: string;
    statusId: string;
    locationId: string;
    isOrphan: string;
    hbls: string;
};

type StaticDefaults = {
    guideRef: string;
    agencyId: string;
    statusId: string;
    locationId: string;
    isOrphan: string;
    departureDate: string;
};

type PackagePreview = {
    id: string;
    guideRef: string;
    agencyId: string;
    agencyName: string;
    recipientId: string;
    recipientName: string;
    recipientIdCard: string;
    recipientPhone: string;
    provinceId: string;
    provinceName: string;
    address: string;
    weight: string;
    content: string;
    departureDate: string;
    statusId: string;
    statusName: string;
    locationId: string;
    locationName: string;
    isOrphan: boolean;
    hbls: string[];
};

type BatchResult = {
    summary: { total: number; saved: number; failed: number; successRate: string };
    successful: Array<{ index: number; packageId?: string; data?: Record<string, unknown> }>;
    failed: Array<{ index: number; error: string; data?: Record<string, unknown> }>;
    savedIds: string[];
};

const INITIAL_FORM: PackageForm = {
    guideRef: '',
    agencyId: '',
    recipientId: '',
    recipientName: '',
    recipientIdCard: '',
    recipientPhone: '',
    provinceId: '',
    address: '',
    weight: '',
    content: '',
    departureDate: '',
    statusId: '',
    locationId: '',
    isOrphan: '',
    hbls: '',
};

function BulkPackageEntryPage() {
    const [token] = useState(() => window.localStorage.getItem('paqueteria_token') || '');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [staticDefaults, setStaticDefaults] = useState<StaticDefaults>({ guideRef: '', agencyId: '', statusId: '', locationId: '', isOrphan: '', departureDate: '' });
    const [packageForm, setPackageForm] = useState<PackageForm>(INITIAL_FORM);
    const [pendingPackages, setPendingPackages] = useState<PackagePreview[]>([]);
    const [savedPackages, setSavedPackages] = useState<PackagePreview[]>([]);
    const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

    const apiHeaders = useMemo(() => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }, [token]);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        Promise.all([fetch('/agencies', { headers: apiHeaders }), fetch('/statuses', { headers: apiHeaders }), fetch('/locations', { headers: apiHeaders }), fetch('/provinces', { headers: apiHeaders }), fetch('/recipients', { headers: apiHeaders })])
            .then(async ([aRes, sRes, lRes, pRes, rRes]) => {
                if (!aRes.ok || !sRes.ok || !lRes.ok || !pRes.ok || !rRes.ok) {
                    throw new Error('No fue posible cargar los datos de referencia');
                }
                const [aData, sData, lData, pData, rData] = await Promise.all([aRes.json(), sRes.json(), lRes.json(), pRes.json(), rRes.json()]);
                setAgencies(Array.isArray(aData) ? aData : aData.data || []);
                setStatuses(Array.isArray(sData) ? sData : sData.data || []);
                setLocations(Array.isArray(lData) ? lData : lData.data || []);
                setProvinces(Array.isArray(pData) ? pData : pData.data || []);
                setRecipients(Array.isArray(rData) ? rData : rData.data || []);
            })
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [token, apiHeaders]);

    const getAgencyName = (agencyId: string) => agencies.find((item) => item.id === agencyId)?.name || '';
    const getStatusName = (statusId: string) => statuses.find((item) => item.id === statusId)?.name || '';
    const getLocationName = (locationId: string) => locations.find((item) => item.id === locationId)?.name || '';
    const getProvinceName = (provinceId: string) => provinces.find((item) => item.id === provinceId)?.name || '';

    const handleRecipientSelection = (recipientId: string) => {
        const selectedRecipient = recipients.find((item) => item.id === recipientId);
        setPackageForm((prev) => ({
            ...prev,
            recipientId,
            recipientName: selectedRecipient?.fullName || '',
            recipientIdCard: selectedRecipient?.idCard || '',
            recipientPhone: selectedRecipient?.phone || '',
        }));
    };

    const buildPackagePreview = (form: PackageForm, defaults: StaticDefaults): PackagePreview => {
        const guideRef = form.guideRef || defaults.guideRef || '';
        const agencyId = form.agencyId || defaults.agencyId || '';
        const statusId = form.statusId || defaults.statusId || '';
        const locationId = form.locationId || defaults.locationId || '';
        const departureDate = form.departureDate || defaults.departureDate || '';
        const isOrphan = form.isOrphan ? form.isOrphan === 'true' : defaults.isOrphan === 'true';

        return {
            id: crypto.randomUUID(),
            guideRef,
            agencyId,
            agencyName: getAgencyName(agencyId) || '',
            recipientId: form.recipientId,
            recipientName: form.recipientName,
            recipientIdCard: form.recipientIdCard,
            recipientPhone: form.recipientPhone,
            provinceId: form.provinceId,
            provinceName: getProvinceName(form.provinceId) || '',
            address: form.address,
            weight: form.weight,
            content: form.content,
            departureDate,
            statusId,
            statusName: getStatusName(statusId) || '',
            locationId,
            locationName: getLocationName(locationId) || '',
            isOrphan,
            hbls: form.hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
        };
    };

    const convertToBackendPayload = (pkg: PackagePreview): Record<string, unknown> => {
        const payload: Record<string, unknown> = {
            statusId: pkg.statusId,
            address: pkg.address || undefined,
            weight: pkg.weight ? parseFloat(pkg.weight) : undefined,
            content: pkg.content || undefined,
            departureDate: pkg.departureDate || undefined,
            isOrphan: pkg.isOrphan,
            hblCodes: pkg.hbls.length > 0 ? pkg.hbls : undefined,
        };

        if (pkg.recipientId) {
            payload.recipientId = pkg.recipientId;
        } else if (pkg.recipientName && pkg.recipientIdCard) {
            payload.newRecipient = {
                fullName: pkg.recipientName,
                idCard: pkg.recipientIdCard,
                phone: pkg.recipientPhone || undefined,
            };
        }

        if (pkg.agencyId && pkg.guideRef) {
            payload.newGuide = {
                externalRef: pkg.guideRef,
                agencyId: pkg.agencyId,
            };
        }

        if (pkg.provinceId) payload.provinceId = pkg.provinceId;
        if (pkg.locationId) payload.locationId = pkg.locationId;

        return payload;
    };

    const resetPackageForm = () => {
        setPackageForm(INITIAL_FORM);
    };

    const handleAddToPending = (event: FormEvent) => {
        event.preventDefault();
        const statusId = packageForm.statusId || staticDefaults.statusId;
        if (!statusId) {
            setError('Debes seleccionar un estado (en el formulario o en valores estáticos)');
            return;
        }
        if (!packageForm.recipientName && !packageForm.recipientId) {
            setError('Debes proporcionar un destinatario (nombre o seleccionar uno existente)');
            return;
        }

        const newPkg = buildPackagePreview(packageForm, staticDefaults);
        setPendingPackages((prev) => [...prev, newPkg]);
        setError(null);
        resetPackageForm();
    };

    const handleSaveSingle = async (event: FormEvent) => {
        event.preventDefault();
        const statusId = packageForm.statusId || staticDefaults.statusId;
        if (!statusId) {
            setError('Debes seleccionar un estado');
            return;
        }
        if (!packageForm.recipientName && !packageForm.recipientId) {
            setError('Debes proporcionar un destinatario');
            return;
        }

        setSubmitting(true);
        try {
            const preview = buildPackagePreview(packageForm, staticDefaults);
            const payload = convertToBackendPayload(preview);
            console.log(payload)
            const response = await fetch('/package-entry/single', {
                method: 'POST',
                headers: apiHeaders,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error((errData as { message?: string }).message || 'Error al guardar');
            }

            const result = await response.json();
            setSavedPackages((prev) => [...prev, preview]);
            setError(null);
            resetPackageForm();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveBatch = async () => {
        if (pendingPackages.length === 0) {
            setError('No hay paquetes pendientes para guardar');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                packages: pendingPackages.map((pkg) => convertToBackendPayload(pkg)),
            };
            console.log(payload)
            const response = await fetch('/package-entry', {
                method: 'POST',
                headers: apiHeaders,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error((errData as { message?: string }).message || 'Error al guardar el lote');
            }

            const result: BatchResult = await response.json();
            setBatchResult(result);

            if (result.savedIds.length > 0) {
                setSavedPackages((prev) => [...prev, ...pendingPackages]);
                setPendingPackages([]);
            }
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemovePending = (id: string) => {
        setPendingPackages((prev) => prev.filter((p) => p.id !== id));
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
                <h3>Valores estáticos</h3>
                <form className="simple-form">
                    <fieldset className="grid-form">
                        <legend>Identificación</legend>
                        <label>
                            Guía por defecto
                            <input
                                value={staticDefaults.guideRef}
                                onChange={(e) => setStaticDefaults((prev) => ({ ...prev, guideRef: e.target.value }))}
                                placeholder="REF-123"
                            />
                        </label>
                        <label>
                            Agencia por defecto
                            <select value={staticDefaults.agencyId} onChange={(e) => setStaticDefaults((prev) => ({ ...prev, agencyId: e.target.value }))}>
                                <option value="">Seleccionar agencia</option>
                                {agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </label>
                    </fieldset>
                    <fieldset className="grid-form">
                        <legend>Seguimiento</legend>
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
                        <label>
                            Fecha de salida por defecto
                            <input type="date" value={staticDefaults.departureDate} onChange={(e) => setStaticDefaults((prev) => ({ ...prev, departureDate: e.target.value }))} />
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={staticDefaults.isOrphan === 'true'}
                                onChange={(e) => setStaticDefaults((prev) => ({ ...prev, isOrphan: e.target.checked ? 'true' : 'false' }))}
                            />
                            Marcar paquetes como huérfanos por defecto
                        </label>
                    </fieldset>
                </form>
            </section>

            <section className="list-card">
                <h3>Agregar paquete</h3>
                <form className="simple-form" onSubmit={(e) => e.preventDefault()}>
                    <fieldset className="grid-form">
                        <legend>Valores del paquete (coinciden con estáticos)</legend>
                        <label>
                            Guía del paquete
                            <input
                                value={packageForm.guideRef}
                                onChange={(e) => setPackageForm((prev) => ({ ...prev, guideRef: e.target.value }))}
                                placeholder="Usar guía superior si está vacío"
                            />
                        </label>
                        <label>
                            Agencia del paquete
                            <select value={packageForm.agencyId} onChange={(e) => setPackageForm((prev) => ({ ...prev, agencyId: e.target.value }))}>
                                <option value="">Usar agencia superior</option>
                                {agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
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
                            Fecha de salida
                            <input type="date" value={packageForm.departureDate} onChange={(e) => setPackageForm((prev) => ({ ...prev, departureDate: e.target.value }))} />
                        </label>
                        <label>
                            Huérfano
                            <select value={packageForm.isOrphan} onChange={(e) => setPackageForm((prev) => ({ ...prev, isOrphan: e.target.value }))}>
                                <option value="">Usar valor estático</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </label>
                    </fieldset>
                    <fieldset className="grid-form">
                        <legend>Identificación</legend>
                        <label className="full-width">
                            HBLs (coma, punto y coma o nueva línea)
                            <textarea value={packageForm.hbls} onChange={(e) => setPackageForm((prev) => ({ ...prev, hbls: e.target.value }))} rows={3} />
                        </label>
                    </fieldset>
                    <fieldset className="grid-form">
                        <legend>Destinatario</legend>
                        <label>
                            Destinatario
                            <select value={packageForm.recipientId} onChange={(e) => handleRecipientSelection(e.target.value)}>
                                <option value="">Seleccionar destinatario</option>
                                {recipients.map((recipient) => (
                                    <option key={recipient.id} value={recipient.id}>{recipient.fullName}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Nombre
                            <input value={packageForm.recipientName} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientName: e.target.value }))} />
                        </label>
                        <label>
                            Carnet
                            <input value={packageForm.recipientIdCard} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientIdCard: e.target.value }))} />
                        </label>
                        <label>
                            Teléfono
                            <input value={packageForm.recipientPhone} onChange={(e) => setPackageForm((prev) => ({ ...prev, recipientPhone: e.target.value }))} />
                        </label>
                    </fieldset>
                    <fieldset className="grid-form">
                        <legend>Dirección de entrega</legend>
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
                            <input value={packageForm.address} onChange={(e) => setPackageForm((prev) => ({ ...prev, address: e.target.value }))} />
                        </label>
                    </fieldset>
                    <fieldset className="grid-form">
                        <legend>Detalles del paquete</legend>
                        <label>
                            Peso
                            <input type="number" step="0.1" value={packageForm.weight} onChange={(e) => setPackageForm((prev) => ({ ...prev, weight: e.target.value }))} />
                        </label>
                        <label>
                            Contenido
                            <input value={packageForm.content} onChange={(e) => setPackageForm((prev) => ({ ...prev, content: e.target.value }))} />
                        </label>
                    </fieldset>
                    <fieldset className="simple-form">
                        <legend>Importación</legend>
                        <label className="full-width">
                            Archivo de entrada (sin función actualmente)
                            <input type="file" onChange={handleFileChange} />
                            {fileName && <small>Archivo seleccionado: {fileName}</small>}
                        </label>
                    </fieldset>
                    <div className="button-group">
                        <button type="button" onClick={handleAddToPending} disabled={submitting}>
                            Continuar
                        </button>
                        <button type="button" onClick={handleSaveSingle} disabled={submitting}>
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" onClick={handleSaveBatch} disabled={submitting || pendingPackages.length === 0}>
                            Guardar lote ({pendingPackages.length})
                        </button>
                    </div>
                </form>
            </section>

            {batchResult && (
                <section className="list-card batch-result">
                    <h3>Resultado del lote</h3>
                    <p>Total: {batchResult.summary.total} | Guardados: {batchResult.summary.saved} | Fallidos: {batchResult.summary.failed} | Éxito: {batchResult.summary.successRate}</p>
                    {batchResult.failed.length > 0 && (
                        <details>
                            <summary>Ver fallos ({batchResult.failed.length})</summary>
                            <ul>
                                {batchResult.failed.map((f, idx) => (
                                    <li key={idx}>Índice {f.index}: {f.error}</li>
                                ))}
                            </ul>
                        </details>
                    )}
                </section>
            )}

            <section className="list-card">
                <h3>Paquetes pendientes ({pendingPackages.length})</h3>
                {pendingPackages.length === 0 ? (
                    <p>No hay paquetes en la lista.</p>
                ) : (
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
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPackages.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td>{pkg.guideRef || '—'}</td>
                                    <td>{pkg.agencyName || '—'}</td>
                                    <td>{pkg.recipientName || pkg.recipientIdCard || '—'}</td>
                                    <td>{pkg.provinceName || '—'}</td>
                                    <td>{pkg.statusName || '—'}</td>
                                    <td>{pkg.locationName || '—'}</td>
                                    <td>{pkg.isOrphan ? 'Sí' : 'No'}</td>
                                    <td>{pkg.hbls.join(', ')}</td>
                                    <td>
                                        <button type="button" className="small secondary" onClick={() => handleRemovePending(pkg.id)}>
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default BulkPackageEntryPage;
