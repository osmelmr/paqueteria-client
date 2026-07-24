import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Agency, Location, Status } from '../types';

type PreviewPackage = {
  address: string | null;
  content: string | null;
  fullName: string | null;
  idCard: string | null;
  phone: string | null;
  province: string | null;
  departureDate: string | null;
  hblCodes: string[];
  weight: number | null;
  recipientId?: string;
  provinceId?: string;
};

type PreviewResponse = {
  packages: PreviewPackage[];
};

type BatchResult = {
  summary: { total: number; saved: number; failed: number; successRate: string };
  successful: Array<{ index: number; packageId?: string }>;
  failed: Array<{ index: number; error: string }>;
};

function AiPreviewPage() {
  const [token] = useState(() => window.localStorage.getItem('paqueteria_token') || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [excelText, setExcelText] = useState('');
  const [fileName, setFileName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [isOrphan, setIsOrphan] = useState(false);

  const [preview, setPreview] = useState<PreviewPackage[] | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  const apiHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch('/agencies', { headers: apiHeaders }),
      fetch('/statuses', { headers: apiHeaders }),
      fetch('/locations', { headers: apiHeaders }),
    ])
      .then(async ([aRes, sRes, lRes]) => {
        if (!aRes.ok || !sRes.ok || !lRes.ok) {
          throw new Error('No fue posible cargar datos de referencia');
        }
        const [aData, sData, lData] = await Promise.all([
          aRes.json(), sRes.json(), lRes.json(),
        ]);
        setAgencies(Array.isArray(aData) ? aData : aData.data || []);
        setStatuses(Array.isArray(sData) ? sData : sData.data || []);
        setLocations(Array.isArray(lData) ? lData : lData.data || []);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token, apiHeaders]);

  useEffect(() => {
    if (statuses.length > 0 && !statusId) {
      setStatusId(statuses[0].id);
    }
  }, [statuses, statusId]);

  useEffect(() => {
    if (agencies.length > 0 && !agencyId) {
      setAgencyId(agencies[0].id);
    }
  }, [agencies, agencyId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(null);
    setBatchResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(sheet, { header: 1 });

        const textLines = rows
          .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ''))
          .map((row) =>
            row
              .map((cell) => (cell !== null && cell !== undefined ? String(cell).trim() : ''))
              .join('\t'),
          );

        setExcelText(textLines.join('\n'));
      } catch {
        setError('Error al leer el archivo Excel. Asegúrate de que sea un archivo .xlsx o .xls válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleGeneratePreview = async () => {
    if (!excelText.trim()) {
      setError('Debes cargar un archivo Excel primero');
      return;
    }
    if (!statusId) {
      setError('Debes seleccionar un estado');
      return;
    }
    if (!agencyId) {
      setError('Debes seleccionar una agencia');
      return;
    }
    if (!externalRef.trim()) {
      setError('Debes escribir una referencia externa');
      return;
    }

    setGenerating(true);
    setError(null);
    setPreview(null);
    setBatchResult(null);
    console.log({
          excelText,
          statusId,
          locationId: locationId || undefined,
          agencyId,
          externalRef: externalRef.trim(),
          isOrphan: isOrphan || undefined,
        })
    try {
      const response = await fetch('/package-entry/preview', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          excelText,
          statusId,
          locationId: locationId || undefined,
          agencyId,
          externalRef: externalRef.trim(),
          isOrphan: isOrphan || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { message?: string }).message || 'Error al generar vista previa');
      }

      const result: PreviewResponse = await response.json();
      setPreview(result.packages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveBatch = async () => {
    if (!preview || preview.length === 0) {
      setError('No hay paquetes en la vista previa');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const packages = preview.map((pkg) => ({
        address: pkg.address ?? undefined,
        content: pkg.content ?? undefined,
        departureDate: pkg.departureDate ?? undefined,
        hblCodes: pkg.hblCodes ?? [],
        weight: pkg.weight ?? undefined,
        statusId,
        locationId: locationId || undefined,
        provinceId: pkg.provinceId || undefined,
        recipientId: pkg.recipientId || undefined,
        isOrphan: isOrphan || false,
        newGuide: {
          agencyId,
          externalRef: externalRef.trim(),
        },
      }));

      const response = await fetch('/package-entry', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ packages }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { message?: string }).message || 'Error al guardar el lote');
      }

      const result: BatchResult = await response.json();
      setBatchResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="panel">
        <h2>Previsualización con IA</h2>
        <p>Debes iniciar sesión primero para usar esta página.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Previsualización con IA (Gemini)</h2>
      <p className="hint" style={{ marginBottom: 16 }}>
        Carga un archivo Excel para extraer los datos de los envíos mediante inteligencia artificial.
      </p>

      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading-banner">Cargando opciones...</div>}

      <section className="list-card">
        <h3>1. Cargar archivo Excel</h3>
        <form className="simple-form">
          <label>
            Archivo (.xlsx, .xls)
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
            {fileName && <small>Archivo: {fileName}</small>}
          </label>
        </form>
      </section>

      {excelText && (
        <section className="list-card">
          <h3>2. Texto extraído (verifica y edita si es necesario)</h3>
          <textarea
            value={excelText}
            onChange={(e) => setExcelText(e.target.value)}
            rows={10}
            style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}
          />
        </section>
      )}

      <section className="list-card">
        <h3>3. Metadatos del lote</h3>
        <form className="simple-form" onSubmit={(e) => e.preventDefault()}>
          <div className="grid-form">
            <label>
              Estado
              <select value={statusId} onChange={(e) => setStatusId(e.target.value)} required>
                <option value="">Seleccionar estado</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label>
              Ubicación
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">Sin ubicación</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </label>
            <label>
              Agencia
              <select value={agencyId} onChange={(e) => setAgencyId(e.target.value)} required>
                <option value="">Seleccionar agencia</option>
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label>
              Referencia externa
              <input
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="Ej: LOTE-001"
                required
              />
            </label>
            <label className="checkbox-label" style={{ gridColumn: '1 / -1' }}>
              <input
                type="checkbox"
                checked={isOrphan}
                onChange={(e) => setIsOrphan(e.target.checked)}
              />
              Marcar paquetes como huérfanos
            </label>
          </div>
          <div className="button-group">
            <button type="button" onClick={handleGeneratePreview} disabled={generating || !excelText}>
              {generating ? 'Generando...' : 'Generar vista previa'}
            </button>
          </div>
        </form>
      </section>

      {preview && (
        <section className="list-card">
          <h3>4. Vista previa ({preview.length} paquetes)</h3>
          <div className="button-group" style={{ marginBottom: 12 }}>
            <button type="button" onClick={handleSaveBatch} disabled={saving}>
              {saving ? 'Guardando...' : `Guardar lote (${preview.length})`}
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Destinatario</th>
                  <th>Carnet</th>
                  <th>Teléfono</th>
                  <th>Provincia</th>
                  <th>Dirección</th>
                  <th>Contenido</th>
                  <th>Peso</th>
                  <th>Fecha salida</th>
                  <th>HBLs</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((pkg, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{pkg.fullName || '—'}</td>
                    <td>{pkg.idCard || '—'}</td>
                    <td>{pkg.phone || '—'}</td>
                    <td>{pkg.province || '—'}</td>
                    <td>{pkg.address || '—'}</td>
                    <td>{pkg.content || '—'}</td>
                    <td>{pkg.weight != null ? pkg.weight : '—'}</td>
                    <td>{pkg.departureDate || '—'}</td>
                    <td>{pkg.hblCodes?.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {batchResult && (
        <section className="list-card batch-result">
          <h3>Resultado del guardado</h3>
          <p>
            Total: {batchResult.summary.total} | Guardados: {batchResult.summary.saved} |
            Fallidos: {batchResult.summary.failed} | Éxito: {batchResult.summary.successRate}
          </p>
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
    </div>
  );
}

export default AiPreviewPage;
