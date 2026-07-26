import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Agency, Location, Status } from '../types';

// ----------------------------------------------------------------
// Tipos (coinciden con los DTOs del backend)
// ----------------------------------------------------------------
type ExtractedPackage = {
  address?: string | null;
  content?: string | null;
  fullName?: string | null;
  idCard?: string | null;
  phone?: string | null;
  province?: string | null;
  municipe?: string | null;
  arrivalDate?: string | null;   // ← ahora usamos arrivalDate
  hblCodes?: string[];
  weight?: number | null;
};

type AiExtractResponse = {
  packages: ExtractedPackage[];
};

type BatchResult = {
  success: any[];   // podrías tiparlo mejor
  failed: Array<{ entity: any; error: string }>;
};

// ----------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------
function AiExtractPage() {
  const [token] = useState(() => window.localStorage.getItem('paqueteria_token') || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Datos de referencia
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Estado del formulario
  const [excelText, setExcelText] = useState('');
  const [fileName, setFileName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [isOrphan, setIsOrphan] = useState(false);

  // Datos de la IA y resultado del guardado
  const [preview, setPreview] = useState<ExtractedPackage[] | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  const apiHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  // Cargar datos de referencia
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
          aRes.json(),
          sRes.json(),
          lRes.json(),
        ]);
        setAgencies(Array.isArray(aData) ? aData : aData.data || []);
        setStatuses(Array.isArray(sData) ? sData : sData.data || []);
        setLocations(Array.isArray(lData) ? lData : lData.data || []);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token, apiHeaders]);

  // Seleccionar primeros valores por defecto
  useEffect(() => {
    if (statuses.length > 0 && !statusId) setStatusId(statuses[0].id);
  }, [statuses, statusId]);
  useEffect(() => {
    if (agencies.length > 0 && !agencyId) setAgencyId(agencies[0].id);
  }, [agencies, agencyId]);

  // Manejo del archivo Excel
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
              .join('\t')
          );

        setExcelText(textLines.join('\n'));
      } catch {
        setError('Error al leer el archivo Excel. Asegúrate de que sea un .xlsx o .xls válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 1. Generar vista previa con IA (llamada a /ai/extract)
  const handleGeneratePreview = async () => {
    if (!excelText.trim()) {
      setError('Debes cargar un archivo Excel primero');
      return;
    }

    setGenerating(true);
    setError(null);
    setPreview(null);
    setBatchResult(null);

    try {
      const response = await fetch('/ai/extract', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ excelText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { message?: string }).message || 'Error al extraer datos con IA');
      }

      const result: AiExtractResponse = await response.json();
      setPreview(result.packages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  // 2. Guardar el lote (llamada a /business/process-bulk-ai)
  const handleSaveBatch = async () => {
    if (!preview || preview.length === 0) {
      setError('No hay paquetes en la vista previa');
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

    setSaving(true);
    setError(null);

    try {
      // Construir el payload para /business/process-bulk-ai
      const payload = {
        statusId,
        agencyId,
        guide: externalRef.trim(),      // el backend creará la guía con este externalRef
        locationId: locationId || undefined,
        isOrphan: isOrphan || false,
        packages: preview.map((pkg) => ({
          address: pkg.address ?? undefined,
          content: pkg.content ?? undefined,
          fullName: pkg.fullName ?? undefined,
          idCard: pkg.idCard ?? undefined,
          phone: pkg.phone ?? undefined,
          province: pkg.province ?? undefined,
          municipe: pkg.municipe ?? undefined,
          arrivalDate: pkg.arrivalDate ?? undefined, // ← importante: arrivalDate
          hblCodes: pkg.hblCodes ?? [],
          weight: pkg.weight ?? undefined,
        })),
      };

      const response = await fetch('/business/process-bulk-ai', {
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------
  // Renderizado
  // ----------------------------------------------------------------
  if (!token) {
    return (
      <div className="panel">
        <h2>Extracción con IA</h2>
        <p>Debes iniciar sesión primero para usar esta página.</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>📦 Extraer datos con IA (Gemini)</h2>
        <p className="hint" style={{ marginTop: 4, color: '#666' }}>
          Carga un Excel → la IA extrae los campos → revisa y guarda el lote.
        </p>
      </header>

      {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}
      {loading && <div className="loading-banner" style={{ marginBottom: 16 }}>Cargando opciones...</div>}

      {/* Paso 1: Cargar archivo */}
      <section className="list-card" style={{ marginBottom: 24 }}>
        <h3>1. Subir archivo Excel</h3>
        <form className="simple-form" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ flex: 1 }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: 4 }}
            />
            {fileName && <small style={{ display: 'block', marginTop: 4 }}>📎 {fileName}</small>}
          </label>
          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={generating || !excelText}
            style={{ padding: '8px 24px' }}
          >
            {generating ? '⏳ Extrayendo...' : '🔍 Extraer con IA'}
          </button>
        </form>
        {excelText && (
          <details style={{ marginTop: 12 }}>
            <summary>Ver texto extraído (puedes editarlo)</summary>
            <textarea
              value={excelText}
              onChange={(e) => setExcelText(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                marginTop: 8,
                padding: 8,
                border: '1px solid #ccc',
                borderRadius: 4,
              }}
            />
          </details>
        )}
      </section>

      {/* Paso 2: Metadatos del lote (solo si hay preview) */}
      {preview && (
        <section className="list-card" style={{ marginBottom: 24 }}>
          <h3>2. Metadatos del lote</h3>
          <form className="simple-form" onSubmit={(e) => e.preventDefault()}>
            <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label>
                Estado *
                <select value={statusId} onChange={(e) => setStatusId(e.target.value)} required>
                  <option value="">Seleccionar</option>
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
                Agencia *
                <select value={agencyId} onChange={(e) => setAgencyId(e.target.value)} required>
                  <option value="">Seleccionar</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Referencia externa *
                <input
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  placeholder="Ej: LOTE-001"
                  required
                />
              </label>
              <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isOrphan}
                  onChange={(e) => setIsOrphan(e.target.checked)}
                />
                Marcar paquetes como huérfanos
              </label>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button type="button" onClick={handleSaveBatch} disabled={saving}>
                {saving ? '⏳ Guardando...' : `💾 Guardar lote (${preview.length})`}
              </button>
              <button type="button" onClick={() => setPreview(null)} disabled={saving}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Vista previa de los paquetes */}
      {preview && (
        <section className="list-card" style={{ marginBottom: 24 }}>
          <h3>📋 Vista previa ({preview.length} paquetes)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>#</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Destinatario</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Carnet</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Teléfono</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Provincia</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Municipio</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Dirección</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Contenido</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Peso</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Fecha llegada</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>HBLs</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((pkg, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{i + 1}</td>
                    <td style={{ padding: 8 }}>{pkg.fullName || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.idCard || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.phone || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.province || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.municipe || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.address || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.content || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.weight != null ? pkg.weight : '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.arrivalDate || '—'}</td>
                    <td style={{ padding: 8 }}>{pkg.hblCodes?.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Resultado del guardado */}
      {batchResult && (
        <section className="list-card batch-result" style={{ background: '#f8f9fa', padding: 16, borderRadius: 6 }}>
          <h3>✅ Resultado del guardado</h3>
          <p>
            Total: {batchResult.success.length + batchResult.failed.length} |
            Guardados: {batchResult.success.length} |
            Fallidos: {batchResult.failed.length}
          </p>
          {batchResult.failed.length > 0 && (
            <details>
              <summary style={{ cursor: 'pointer', color: '#d32f2f' }}>
                Ver fallos ({batchResult.failed.length})
              </summary>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {batchResult.failed.map((f, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    <strong>Índice {idx}</strong>: {f.error}
                    <pre style={{ fontSize: '0.8rem', background: '#fff', padding: 4, border: '1px solid #ddd', borderRadius: 4, marginTop: 2, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(f.entity, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </div>
  );
}

export default AiExtractPage;