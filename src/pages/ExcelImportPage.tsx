import { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAgencies } from '../hooks/useAgencies';
import { useStatuses } from '../hooks/useStatuses';
import { useLocations } from '../hooks/useLocations';
import { useGuides } from '../hooks/useGuides';
import { useProcessBulkAi } from '../hooks/useBusiness';
import { useAuthStore } from '../store/auth.store';
import type { GuideType } from '../api/guides.api';
import { CustomSelect } from '../components/CustomSelect';

const GUIDE_TYPE_OPTIONS = [
  { id: 'AEREA', name: 'Aerea' },
  { id: 'MARITIMA', name: 'Maritima' },
];

type FieldKey =
  | 'hblCodes'
  | 'fullName'
  | 'idCard'
  | 'phone'
  | 'province'
  | 'municipe'
  | 'address'
  | 'content'
  | 'weight'
  | 'arrivalDate';

const FIELD_DEFS: { key: FieldKey; label: string; required?: boolean }[] = [
  { key: 'hblCodes', label: 'HBLs', required: true },
  { key: 'fullName', label: 'Destinatario' },
  { key: 'idCard', label: 'Carnet' },
  { key: 'phone', label: 'Telefono' },
  { key: 'province', label: 'Provincia' },
  { key: 'municipe', label: 'Municipio' },
  { key: 'address', label: 'Direccion' },
  { key: 'content', label: 'Contenido' },
  { key: 'weight', label: 'Peso' },
  { key: 'arrivalDate', label: 'Fecha de llegada' },
];

type ImportedPackage = {
  province?: string;
  municipe?: string;
  address?: string;
  content?: string;
  weight?: number;
  arrivalDate?: string;
  fullName?: string;
  idCard?: string;
  phone?: string;
  hblCodes: string[];
};

type BatchResult = {
  success: unknown[];
  failed: Array<{ entity: unknown; error: string }>;
};

function getCellValue(row: unknown[], idx: number): string {
  const v = row[idx];
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function splitHbls(value: string): string[] {
  return value
    .replace(/\]\s*\[/g, ',')
    .split(/[,;\n]/)
    .map((s) => s.trim().replace(/[[\]]/g, ''))
    .filter(Boolean);
}

function excelSerialToIso(serial: number): string {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function parseArrivalDate(value: string): string {
  if (!value) return '';
  const asNumber = Number(value);
  if (value.trim() !== '' && Number.isFinite(asNumber)) {
    return excelSerialToIso(asNumber);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function ExcelImportPage() {
  const { data: agencies = [] } = useAgencies();
  const { data: statuses = [] } = useStatuses();
  const { data: locations = [] } = useLocations();
  const { data: guides = [] } = useGuides();
  const bulkMutation = useProcessBulkAi();

  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<unknown[][]>([]);
  const [hasHeader, setHasHeader] = useState(false);
  const [mappings, setMappings] = useState<Partial<Record<FieldKey, string>>>({});
  const [statusId, setStatusId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [guideId, setGuideId] = useState('');
  const [guideName, setGuideName] = useState('');
  const [guideType, setGuideType] = useState<GuideType>('AEREA');
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [deletedRows, setDeletedRows] = useState<number[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);

  const token = useAuthStore((s) => s.token);

  const columnOptions = useMemo(() => {
    if (rows.length === 0) return [];
    const firstRow = rows[0] ?? [];
    return Array.from(firstRow, (_, i) => ({
      id: String(i),
      name: `Col ${XLSX.utils.encode_col(i)}: ${getCellValue(firstRow, i) || '(vacia)'}`,
    }));
  }, [rows]);

  type PreviewItem = {
    pkg: ImportedPackage;
    sourceIndex: number;
  };

  const preview: PreviewItem[] = useMemo(() => {
    if (rows.length === 0) return [];
    const dataRows = (hasHeader ? rows.slice(1) : rows)
      .map((row, i) => ({ row, sourceIndex: hasHeader ? i + 1 : i }))
      .filter(({ row }) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== ''),
      )
      .filter(({ sourceIndex }) => !deletedRows.includes(sourceIndex));
    return dataRows.map(({ row, sourceIndex }) => {
      const cell = (key: FieldKey): string => {
        const rawIdx = mappings[key];
        const idx = rawIdx === undefined || rawIdx === '' ? -1 : Number(rawIdx);
        return idx >= 0 ? getCellValue(row, idx) : '';
      };
      const weightRaw = cell('weight');
      const weightNum = weightRaw ? parseFloat(weightRaw.replace(',', '.')) : NaN;
      return {
        sourceIndex,
        pkg: {
          hblCodes: cell('hblCodes') ? splitHbls(cell('hblCodes')) : [],
          fullName: cell('fullName') || undefined,
          idCard: cell('idCard') || undefined,
          phone: cell('phone') || undefined,
          province: cell('province') || undefined,
          municipe: cell('municipe') || undefined,
          address: cell('address') || undefined,
          content: cell('content') || undefined,
          weight: Number.isFinite(weightNum) ? weightNum : undefined,
          arrivalDate: parseArrivalDate(cell('arrivalDate')) || undefined,
        },
      };
    });
  }, [rows, hasHeader, mappings, deletedRows]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setRows([]);
    setMappings({});
    setDeletedRows([]);
    setBatchResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
        setRows(parsed);
      } catch {
        setError('Error al leer el archivo Excel. Asegurate de que sea un .xlsx o .xls valido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    setFileName('');
    setRows([]);
    setMappings({});
    setDeletedRows([]);
    setBatchResult(null);
    setError(null);
  };

  const handleSaveBatch = async () => {
    if (rows.length === 0) {
      setError('Debes cargar un archivo Excel primero');
      return;
    }
    if (!mappings.hblCodes || mappings.hblCodes === '') {
      setError('Debes indicar que columna contiene los HBLs');
      return;
    }
    if (preview.length === 0) {
      setError('No hay filas con datos para importar');
      return;
    }
    if (!statusId || !agencyId || (!guideId && !guideName.trim())) {
      setError('Debes completar estado, agencia y guia (seleccionada o nueva)');
      return;
    }

    setError(null);

    try {
      const result = await bulkMutation.mutateAsync({
        statusId,
        agencyId,
        guideId: guideId || undefined,
        guide: guideId ? undefined : guideName.trim(),
        guideType,
        locationId: locationId || undefined,
        packages: preview.map(({ pkg }) => ({
          address: pkg.address,
          content: pkg.content,
          fullName: pkg.fullName,
          idCard: pkg.idCard,
          phone: pkg.phone,
          province: pkg.province,
          municipe: pkg.municipe,
          arrivalDate: pkg.arrivalDate,
          hblCodes: pkg.hblCodes,
          weight: pkg.weight,
        })),
      });
      setBatchResult(result as BatchResult);
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
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Importar desde Excel</h2>
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
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Importar paquetes desde Excel</h2>
        <p className="m-0 text-gray-500 dark:text-gray-400">
          Carga un Excel, indica que columna corresponde a cada campo y guarda el lote sin usar IA.
        </p>
      </header>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl selectable-text">
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
          {fileName && (
            <button
              type="button"
              className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handleReset}
            >
              Limpiar
            </button>
          )}
        </div>
        {rows.length > 0 && (
          <div className="mt-3 flex items-center gap-4 flex-wrap text-sm text-gray-600 dark:text-gray-300">
            <span>
              {columnOptions.length} columnas · {preview.length} filas con datos
            </span>
            <label className="flex items-center gap-2 flex-row cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
              La primera fila contiene encabezados
            </label>
          </div>
        )}
      </section>

      {/* 2. Column mapping */}
      <section className="mb-6">
        <h3 className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">2</span>
          Mapear columnas
        </h3>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Carga un archivo Excel para seleccionar las columnas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FIELD_DEFS.map((field) => (
              <label key={field.key} className="flex flex-col gap-1.5 font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
                <CustomSelect
                  value={mappings[field.key] ?? ''}
                  onChange={(id) => setMappings((prev) => ({ ...prev, [field.key]: id }))}
                  options={columnOptions}
                  placeholder="— No usar —"
                  searchPlaceholder="Buscar columna..."
                />
              </label>
            ))}
          </div>
        )}
      </section>

      {/* 3. Batch metadata */}
      <section className="mb-6">
        <h3 className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">3</span>
          Metadatos del lote
        </h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" onSubmit={(e) => e.preventDefault()}>
          <label className="flex flex-col gap-1.5 font-medium">
            Estado *
            <CustomSelect value={statusId} onChange={setStatusId} options={statuses} placeholder="Seleccionar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Ubicacion
            <CustomSelect value={locationId} onChange={setLocationId} options={locations} placeholder="Sin ubicacion" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Agencia *
            <CustomSelect value={agencyId} onChange={setAgencyId} options={agencies} placeholder="Seleccionar" />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Guia *
            <CustomSelect
              value={guideId}
              onChange={(selected) => {
                setGuideId(selected);
                const guide = guides.find((g) => g.id === selected);
                if (guide) {
                  setGuideType(guide.type);
                  setAgencyId(guide.agencyId || '');
                }
              }}
              options={guides.map((g) => ({
                id: g.id,
                name: `${g.name}${g.agency?.name ? ` (${g.agency.name})` : ''} — ${g.type}`,
              }))}
              placeholder="Crear guia nueva..."
            />
          </label>
          {!guideId && (
            <label className="flex flex-col gap-1.5 font-medium">
              Referencia externa (guia nueva) *
              <input
                className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
                placeholder="Ej: LOTE-001"
                required
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 font-medium">
            Tipo de guia *
            <CustomSelect value={guideType} onChange={(id) => setGuideType(id as GuideType)} options={GUIDE_TYPE_OPTIONS} placeholder="Seleccionar" />
          </label>
        </form>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50"
            onClick={handleSaveBatch}
            disabled={bulkMutation.isPending || rows.length === 0 || preview.length === 0}
          >
            {bulkMutation.isPending ? 'Guardando...' : `Guardar lote (${preview.length})`}
          </button>
          <button
            type="button"
            className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setBatchResult(null)}
            disabled={bulkMutation.isPending}
          >
            Cancelar
          </button>
        </div>
      </section>

      {/* Save result */}
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
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-semibold rounded-lg px-3 py-1.5 text-xs cursor-pointer transition-colors"
                  onClick={() => {
                    const text = batchResult.failed
                      .map((f, idx) => `Indice ${idx}: ${f.error}\n\n${JSON.stringify(f.entity, null, 2)}`)
                      .join('\n\n========================================\n\n');
                    navigator.clipboard.writeText(text);
                  }}
                >
                  Copiar todos los fallos
                </button>
              </div>
              <ul className="mt-2 space-y-2 max-h-56 overflow-y-auto">
                {batchResult.failed.map((f, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-border text-sm">
                    <strong className="selectable-text">Indice {idx}</strong>: <span className="selectable-text">{f.error}</span>
                    <pre className="selectable-text cursor-text text-xs text-gray-500 dark:text-gray-400 mt-1.5 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(f.entity, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* 4. Preview */}
      <section>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold m-0">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-400 text-white text-xs font-bold">4</span>
            Vista previa ({preview.length} paquetes)
          </h3>
          {deletedRows.length > 0 && (
            <button
              type="button"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline px-2 py-1 cursor-pointer"
              onClick={() => setDeletedRows([])}
            >
              Restaurar filas eliminadas ({deletedRows.length})
            </button>
          )}
        </div>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">
                <th className="p-2.5 text-left font-semibold">#</th>
                <th className="p-2.5 text-left font-semibold">HBLs</th>
                <th className="p-2.5 text-left font-semibold">Destinatario</th>
                <th className="p-2.5 text-left font-semibold">Carnet</th>
                <th className="p-2.5 text-left font-semibold">Telefono</th>
                <th className="p-2.5 text-left font-semibold">Provincia</th>
                <th className="p-2.5 text-left font-semibold">Municipio</th>
                <th className="p-2.5 text-left font-semibold">Direccion</th>
                <th className="p-2.5 text-left font-semibold">Contenido</th>
                <th className="p-2.5 text-left font-semibold">Peso</th>
                <th className="p-2.5 text-left font-semibold">Fecha llegada</th>
                <th className="p-2.5 text-left font-semibold">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {preview.length > 0 ? (
                preview.map(({ pkg, sourceIndex }, i) => (
                  <tr key={sourceIndex} className={`border-t border-border ${i % 2 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400">{i + 1}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.hblCodes.join(', ') || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.fullName || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.idCard || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.phone || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.province || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.municipe || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.address || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.content || '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.weight != null ? pkg.weight : '—'}</td>
                    <td className="p-2.5 text-gray-700 dark:text-gray-300">{pkg.arrivalDate || '—'}</td>
                    <td className="p-2.5">
                      <button
                        type="button"
                        onClick={() => setDeletedRows((prev) => [...prev, sourceIndex])}
                        title="Eliminar fila"
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 border border-transparent transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-gray-400 dark:text-gray-500">
                    {rows.length > 0 ? 'Todos los paquetes fueron eliminados de este lote' : 'Carga un archivo Excel y mapea las columnas para ver los datos aqui'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ExcelImportPage;