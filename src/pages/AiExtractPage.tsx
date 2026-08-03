import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAgencies } from '../hooks/useAgencies';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { useProcessBulkAi } from '../hooks/useBusiness';

type ExtractedPackage = {
  address?: string | null;
  content?: string | null;
  fullName?: string | null;
  idCard?: string | null;
  phone?: string | null;
  province?: string | null;
  municipe?: string | null;
  arrivalDate?: string | null;
  hblCodes?: string[];
  weight?: number | null;
};

type BatchResult = {
  success: any[];
  failed: Array<{ entity: any; error: string }>;
};

function AiExtractPage() {
  const { data: agencies = [] } = useAgencies();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const bulkMutation = useProcessBulkAi();

  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [excelText, setExcelText] = useState('');
  const [fileName, setFileName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [preview, setPreview] = useState<ExtractedPackage[] | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  const token = useMemo(() => window.localStorage.getItem('paqueteria_token') || '', []);
  const apiHeaders = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

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
        setError('Error al leer el archivo Excel. Asegurate de que sea un .xlsx o .xls valido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

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

      const result = await response.json() as { packages: ExtractedPackage[] };
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
    if (!statusId || !agencyId || !externalRef.trim()) {
      setError('Debes completar estado, agencia y referencia externa');
      return;
    }

    setError(null);

    try {
      const result = await bulkMutation.mutateAsync({
        statusId,
        agencyId,
        guide: externalRef.trim(),
        locationId: locationId || undefined,
        packages: preview.map((pkg) => ({
          address: pkg.address ?? undefined,
          content: pkg.content ?? undefined,
          fullName: pkg.fullName ?? undefined,
          idCard: pkg.idCard ?? undefined,
          phone: pkg.phone ?? undefined,
          province: pkg.province ?? undefined,
          municipe: pkg.municipe ?? undefined,
          arrivalDate: pkg.arrivalDate ?? undefined,
          hblCodes: pkg.hblCodes ?? [],
          weight: pkg.weight ?? undefined,
        })),
      });
      setBatchResult(result as BatchResult);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!token) {
    return (
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Extraccion con IA</h2>
        <p>Debes iniciar sesion primero para usar esta pagina.</p>
      </div>
    );
  }

  return (
    <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Extraer datos con IA (Gemini)</h2>
        <p className="m-0 text-gray-500 dark:text-gray-400" style={{ marginTop: 4, color: '#666' }}>
          Carga un Excel &rarr; la IA extrae los campos &rarr; revisa y guarda el lote.
        </p>
      </header>

      {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl" style={{ marginBottom: 16 }}>{error}</div>}

      <section className="mt-4 overflow-x-auto" style={{ marginBottom: 24 }}>
        <h3>1. Subir archivo Excel</h3>
        <form className="flex flex-col gap-3.5 mb-4.5" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="flex flex-col gap-1.5 font-medium" style={{ flex: 1 }}>
            <input
              className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: 4 }}
            />
            {fileName && <small style={{ display: 'block', marginTop: 4 }}>&#128206; {fileName}</small>}
          </label>
          <button
            type="button"
            className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50"
            onClick={handleGeneratePreview}
            disabled={generating || !excelText}
            style={{ padding: '8px 24px' }}
          >
            {generating ? 'Extrayendo...' : 'Extraer con IA'}
          </button>
        </form>
        {excelText && (
          <details style={{ marginTop: 12 }}>
            <summary>Ver texto extraido (puedes editarlo)</summary>
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

      {preview && (
        <section className="mt-4 overflow-x-auto" style={{ marginBottom: 24 }}>
          <h3>2. Metadatos del lote</h3>
          <form className="flex flex-col gap-3.5 mb-4.5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3.5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label className="flex flex-col gap-1.5 font-medium">
                Estado *
                <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={statusId} onChange={(e) => setStatusId(e.target.value)} required>
                  <option value="">Seleccionar</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 font-medium">
                Ubicacion
                <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                  <option value="">Sin ubicacion</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 font-medium">
                Agencia *
                <select className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={agencyId} onChange={(e) => setAgencyId(e.target.value)} required>
                  <option value="">Seleccionar</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 font-medium">
                Referencia externa *
                <input
                  className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  placeholder="Ej: LOTE-001"
                  required
                />
              </label>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" onClick={handleSaveBatch} disabled={bulkMutation.isPending}>
                {bulkMutation.isPending ? 'Guardando...' : `Guardar lote (${preview.length})`}
              </button>
              <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setPreview(null)} disabled={bulkMutation.isPending}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {preview && (
        <section className="mt-4 overflow-x-auto" style={{ marginBottom: 24 }}>
          <h3>Vista previa ({preview.length} paquetes)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>#</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Destinatario</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Carnet</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Telefono</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Provincia</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Municipio</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Direccion</th>
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

      {batchResult && (
        <section className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-400/50 dark:border-purple-800/50 rounded-xl" style={{ background: '#f8f9fa', padding: 16, borderRadius: 6 }}>
          <h3>Resultado del guardado</h3>
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
                    <strong>Indice {idx}</strong>: {f.error}
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
