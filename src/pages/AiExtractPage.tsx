import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import { useAgencies } from '../hooks/useAgencies';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { useProcessBulkAi } from '../hooks/useBusiness';
import { useAuthStore } from '../store/auth.store';
import type { GuideType } from '../api/guides.api';

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

type AiCache = {
  excelText: string;
  fileName: string;
  preview: ExtractedPackage[] | null;
  statusId: string;
  locationId: string;
  agencyId: string;
  guideName: string;
  guideType: GuideType;
};

const CACHE_KEY = 'paqueteria_ai_extract_cache_v1';

function loadCache(): AiCache | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AiCache;
    if (typeof parsed.excelText !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearCache() {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

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
  const [guideName, setGuideName] = useState('');
  const [guideType, setGuideType] = useState<GuideType>('AEREA');
  const [preview, setPreview] = useState<ExtractedPackage[] | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const cache = loadCache();
    if (!cache) return;
    setExcelText(cache.excelText);
    setFileName(cache.fileName);
    setPreview(cache.preview);
    setStatusId(cache.statusId);
    setLocationId(cache.locationId);
    setAgencyId(cache.agencyId);
    setGuideName(cache.guideName);
    setGuideType(cache.guideType || 'AEREA');
  }, []);

  useEffect(() => {
    const cache: AiCache = { excelText, fileName, preview, statusId, locationId, agencyId, guideName, guideType };
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* ignore */
    }
  }, [excelText, fileName, preview, statusId, locationId, agencyId, guideName, guideType]);

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

  const handleReset = () => {
    clearCache();
    setExcelText('');
    setFileName('');
    setPreview(null);
    setBatchResult(null);
    setError(null);
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
      const result = await api.post<{ packages: ExtractedPackage[] }>('/ai/extract', { excelText });
      setPreview(result.data.packages);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message
        || (err as Error).message
        || 'Error al extraer datos con IA';
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveBatch = async () => {
    if (!preview || preview.length === 0) {
      setError('No hay paquetes en la vista previa');
      return;
    }
    if (!statusId || !agencyId || !guideName.trim()) {
      setError('Debes completar estado, agencia, tipo de guia y referencia externa');
      return;
    }

    setError(null);

    try {
      const result = await bulkMutation.mutateAsync({
        statusId,
        agencyId,
        guide: guideName.trim(),
        guideType,
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
      clearCache();
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
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

  const totalSaved = batchResult ? batchResult.success.length : 0;
  const totalFailed = batchResult ? batchResult.failed.length : 0;
  const hasPartialResult = batchResult !== null;
  const allOk = hasPartialResult && totalFailed === 0;
  const allFailed = hasPartialResult && totalSaved === 0;

  return (
    <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header className="mb-6">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Extraer datos con IA (Gemini)</h2>
        <p className="m-0 text-gray-500 dark:text-gray-400">
          Carga un Excel &rarr; la IA extrae los campos &rarr; revisa y guarda el lote.
        </p>
      </header>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {/* 1. Upload */}
      <section className="mb-6">
        <h3 className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">1</span>
          Subir archivo Excel
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center justify-between gap-3 border-2 border-dashed border-border rounded-xl px-4 py-3 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors bg-slate-50 dark:bg-slate-800/50">
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {fileName ? `📎 ${fileName}` : 'Selecciona un archivo .xlsx o .xls'}
            </span>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            <span className="shrink-0 bg-purple-500 dark:bg-purple-400 text-white text-xs font-semibold rounded-lg px-3 py-2">Examinar</span>
          </label>
          <button
            type="button"
            className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50"
            onClick={handleGeneratePreview}
            disabled={generating || !excelText}
          >
            {generating ? 'Extrayendo...' : 'Extraer con IA'}
          </button>
          {excelText && (
            <button
              type="button"
              className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handleReset}
            >
              Limpiar
            </button>
          )}
        </div>
        {excelText && (
          <div className="mt-3">
            <label className="flex items-center justify-between gap-2 mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Texto extraido del Excel (puedes editarlo antes de extraer)
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{excelText.length} caracteres</span>
            </label>
            <textarea
              value={excelText}
              onChange={(e) => setExcelText(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full font-mono text-sm rounded-xl border border-border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 resize-y focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
            />
          </div>
        )}
      </section>

      {preview && (
        <>
          {/* 2. Batch metadata */}
          <section className="mb-6">
            <h3 className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">2</span>
              Metadatos del lote
            </h3>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" onSubmit={(e) => e.preventDefault()}>
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
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  placeholder="Ej: LOTE-001"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 font-medium">
                Tipo de guia *
                <select
                  className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  value={guideType}
                  onChange={(e) => setGuideType(e.target.value as GuideType)}
                  required
                >
                  <option value="AEREA">Aerea</option>
                  <option value="MARITIMA">Maritima</option>
                </select>
              </label>
            </form>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50"
                onClick={handleSaveBatch}
                disabled={bulkMutation.isPending}
              >
                {bulkMutation.isPending ? 'Guardando...' : `Guardar lote (${preview.length})`}
              </button>
              <button
                type="button"
                className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setPreview(null);
                  setBatchResult(null);
                }}
                disabled={bulkMutation.isPending}
              >
                Cancelar
              </button>
            </div>
          </section>

          {/* Save result (shown right where the user clicks, no scrolling needed) */}
          {batchResult && (
            <div ref={resultRef} className={`mb-6 p-4 rounded-xl border ${
              allOk
                ? 'bg-green-50 dark:bg-green-900/30 border-green-400/50 dark:border-green-800/50'
                : allFailed
                  ? 'bg-red-50 dark:bg-red-900/30 border-red-400/50 dark:border-red-800/50'
                  : 'bg-amber-50 dark:bg-amber-900/30 border-amber-400/50 dark:border-amber-800/50'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                  allOk ? 'bg-green-500' : allFailed ? 'bg-red-500' : 'bg-amber-500'
                }`}>
                  {allOk ? '✓' : allFailed ? '✗' : '!'}
                </span>
                {allOk
                  ? 'Lote guardado correctamente'
                  : allFailed
                    ? 'No se pudo guardar ningun paquete'
                    : 'Lote guardado parcialmente'}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-border text-gray-700 dark:text-gray-300">
                  Total: {totalSaved + totalFailed}
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                  Guardados: {totalSaved}
                </span>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  Fallidos: {totalFailed}
                </span>
              </div>
              {totalFailed > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400">
                    Ver fallos ({totalFailed})
                  </summary>
                  <ul className="mt-2 space-y-2 max-h-56 overflow-y-auto">
                    {batchResult.failed.map((f, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-border text-sm">
                        <strong>Indice {idx}</strong>: {f.error}
                        <pre className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(f.entity, null, 2)}
                        </pre>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* 3. Preview */}
          <section>
            <h3 className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">3</span>
              Vista previa ({preview.length} paquetes)
            </h3>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">
                    <th className="p-2.5 text-left font-semibold">#</th>
                    <th className="p-2.5 text-left font-semibold">Destinatario</th>
                    <th className="p-2.5 text-left font-semibold">Carnet</th>
                    <th className="p-2.5 text-left font-semibold">Telefono</th>
                    <th className="p-2.5 text-left font-semibold">Provincia</th>
                    <th className="p-2.5 text-left font-semibold">Municipio</th>
                    <th className="p-2.5 text-left font-semibold">Direccion</th>
                    <th className="p-2.5 text-left font-semibold">Contenido</th>
                    <th className="p-2.5 text-left font-semibold">Peso</th>
                    <th className="p-2.5 text-left font-semibold">Fecha llegada</th>
                    <th className="p-2.5 text-left font-semibold">HBLs</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((pkg, i) => (
                    <tr key={i} className={`border-t border-border ${i % 2 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                      <td className="p-2.5 text-gray-500 dark:text-gray-400">{i + 1}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.fullName || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.idCard || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.phone || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.province || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.municipe || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.address || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.content || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.weight != null ? pkg.weight : '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.arrivalDate || '—'}</td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.hblCodes?.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AiExtractPage;
