import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Filter,
  Loader2,
  Package as PackageIcon,
  Search,
  XCircle,
} from 'lucide-react';
import { useCheckHbls } from '../hooks/usePackages';
import { useStatuses } from '../hooks/useStatuses';
import { useProvinces } from '../hooks/useProvinces';
import { useLocations } from '../hooks/useLocations';
import { PackageCard, type PackageData } from '../components/PackageCard';

export default function ConsultarHblsPage() {
  const navigate = useNavigate();
  const [hbls, setHbls] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedNotFound, setCopiedNotFound] = useState(false);
  const [copiedFiltered, setCopiedFiltered] = useState(false);
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedProvinceIds, setSelectedProvinceIds] = useState<string[]>([]);
  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);

  const { data: statuses = [] } = useStatuses();
  const { data: provinces = [] } = useProvinces();
  const { data: locations = [] } = useLocations();
  const mutation = useCheckHbls();

  const error = mutation.isError ? (mutation.error as Error).message : localError;
  const result = mutation.data ?? null;

  const filteredFound = useMemo(() => {
    if (!result) return [];
    return result.found.filter((pkg) => {
      const matchStatus = selectedStatusIds.length === 0 || (pkg.status?.id && selectedStatusIds.includes(pkg.status.id));
      const matchProvince = selectedProvinceIds.length === 0 || (pkg.province?.id && selectedProvinceIds.includes(pkg.province.id));
      return matchStatus && matchProvince;
    });
  }, [result, selectedStatusIds, selectedProvinceIds]);

  const filteredHbls = useMemo(() => {
    return filteredFound.flatMap((pkg) => pkg.hbls?.map((h) => h.hblCode) ?? []);
  }, [filteredFound]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setCopiedNotFound(false);
    setCopiedFiltered(false);

    const parsed = hbls.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    if (parsed.length === 0) {
      setLocalError('Ingresa al menos un HBL');
      return;
    }

    try {
      await mutation.mutateAsync(parsed);
      setSelectedStatusIds([]);
      setSelectedProvinceIds([]);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleCopyNotFound = async () => {
    if (!result || result.notFound.length === 0) return;
    const text = result.notFound.join('\n');
    await copyToClipboard(text);
    setCopiedNotFound(true);
    setTimeout(() => setCopiedNotFound(false), 2000);
  };

  const handleCopyFiltered = async () => {
    if (filteredHbls.length === 0) return;
    const text = filteredHbls.join('\n');
    await copyToClipboard(text);
    setCopiedFiltered(true);
    setTimeout(() => setCopiedFiltered(false), 2000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const toggleStatus = (id: string) => {
    setSelectedStatusIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleAllStatuses = () => {
    if (selectedStatusIds.length === statuses.length) {
      setSelectedStatusIds([]);
    } else {
      setSelectedStatusIds(statuses.map((s) => s.id));
    }
  };

  const toggleProvince = (id: string) => {
    setSelectedProvinceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleAllProvinces = () => {
    if (selectedProvinceIds.length === provinces.length) {
      setSelectedProvinceIds([]);
    } else {
      setSelectedProvinceIds(provinces.map((p) => p.id));
    }
  };

  return (
    <main className="flex-1 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Consultar HBLs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Verifica el estado de varios paquetes a partir de una lista de HBLs
            </p>
          </div>
        </div>

        <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Lista de HBLs</h2>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl selectable-text">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <label>
              HBLs (separados por coma, punto y coma o salto de linea) *
              <textarea
                className="w-full min-h-32 resize-y border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                value={hbls}
                onChange={(e) => setHbls(e.target.value)}
                rows={6}
                placeholder={'HBL001\nHBL002\nHBL003'}
                required
              />
            </label>
            <button
              type="submit"
              className="self-start flex items-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 text-white font-semibold rounded-xl px-5 py-3 text-sm transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Consultar
            </button>
          </form>
        </div>

        {mutation.isPending && (
          <div className="mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            Consultando HBLs...
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-xl bg-surface">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <PackageIcon className="h-4 w-4 text-purple-500" />
                Total consultados: {result.notFound.length + result.found.length}
              </span>
              <button
                type="button"
                onClick={() => document.getElementById('no-encontrados-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-rose-700 dark:text-rose-400 cursor-pointer transition-colors hover:bg-rose-200 dark:hover:bg-rose-900/50"
              >
                <XCircle className="h-3.5 w-3.5" />
                {result.notFound.length} no encontrados
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('encontrados-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-1.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-emerald-700 dark:text-emerald-400 cursor-pointer transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.found.length} encontrados
              </button>
            </div>

            <section id="no-encontrados-section" className="scroll-mt-24 overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 bg-rose-50 px-4 py-3 dark:bg-rose-900/20">
                <span className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
                  <XCircle className="h-4 w-4" />
                  HBLs no encontrados
                </span>
                <div className="flex items-center gap-2">
                  {result.notFound.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyNotFound}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        copiedNotFound
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-rose-700 dark:bg-slate-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                      }`}
                    >
                      {copiedNotFound ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedNotFound ? '¡Copiados!' : 'Copiar'}
                    </button>
                  )}
                  <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {result.notFound.length}
                  </span>
                </div>
              </div>
              {result.notFound.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">Todos los HBLs fueron encontrados.</p>
              ) : (
                <div className="px-4 py-3.5">
                  <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
                    Selecciona el texto para copiarlo.
                  </p>
                  <pre className="selectable-text cursor-text m-0 whitespace-pre-wrap break-words font-mono text-sm text-rose-700 dark:text-rose-300">
                    {result.notFound.join('\n')}
                  </pre>
                </div>
              )}
            </section>

            <section id="encontrados-section" className="scroll-mt-24 overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Paquetes encontrados
                </span>
                <div className="flex items-center gap-2">
                  {filteredHbls.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyFiltered}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        copiedFiltered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                      }`}
                    >
                      {copiedFiltered ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedFiltered ? '¡Copiados!' : 'Copiar HBLs filtrados'}
                    </button>
                  )}
                  <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {filteredFound.length}/{result.found.length}
                  </span>
                </div>
              </div>

              {result.found.length > 0 && (
                <div className="px-4 py-2 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-wrap gap-2">
                  <div className="relative" ref={(el) => {
                    if (!el) return;
                    const onDocClick = (e: MouseEvent) => {
                      if (!el.contains(e.target as Node)) setStatusDropdownOpen(false);
                    };
                    el.addEventListener('mousedown', onDocClick);
                    return () => el.removeEventListener('mousedown', onDocClick);
                  }}>
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen((o) => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      <Filter className="h-3.5 w-3.5 text-emerald-500" />
                      {selectedStatusIds.length === 0
                        ? 'Filtrar por estado (todos)'
                        : `${selectedStatusIds.length} estado${selectedStatusIds.length !== 1 ? 's' : ''} seleccionado${selectedStatusIds.length !== 1 ? 's' : ''}`}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {statusDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto py-1">
                        <button
                          type="button"
                          onClick={toggleAllStatuses}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          {selectedStatusIds.length === statuses.length ? 'Limpiar selección' : 'Seleccionar todos'}
                        </button>
                        {statuses.map((s) => {
                          const checked = selectedStatusIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleStatus(s.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                checked
                                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                checked
                                  ? 'bg-purple-600 border-purple-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {checked && <Check className="w-3 h-3 text-white" />}
                              </span>
                              <span className="truncate">{s.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={(el) => {
                    if (!el) return;
                    const onDocClick = (e: MouseEvent) => {
                      if (!el.contains(e.target as Node)) setProvinceDropdownOpen(false);
                    };
                    el.addEventListener('mousedown', onDocClick);
                    return () => el.removeEventListener('mousedown', onDocClick);
                  }}>
                    <button
                      type="button"
                      onClick={() => setProvinceDropdownOpen((o) => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      <Filter className="h-3.5 w-3.5 text-emerald-500" />
                      {selectedProvinceIds.length === 0
                        ? 'Filtrar por provincia (todas)'
                        : `${selectedProvinceIds.length} provincia${selectedProvinceIds.length !== 1 ? 's' : ''} seleccionada${selectedProvinceIds.length !== 1 ? 's' : ''}`}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${provinceDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {provinceDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto py-1">
                        <button
                          type="button"
                          onClick={toggleAllProvinces}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          {selectedProvinceIds.length === provinces.length ? 'Limpiar selección' : 'Seleccionar todos'}
                        </button>
                        {provinces.map((p) => {
                          const checked = selectedProvinceIds.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleProvince(p.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                checked
                                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                checked
                                  ? 'bg-purple-600 border-purple-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {checked && <Check className="w-3 h-3 text-white" />}
                              </span>
                              <span className="truncate">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.found.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">Ningun paquete fue encontrado para los HBLs consultados.</p>
              ) : filteredFound.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">Ningun paquete coincide con el filtro seleccionado.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredFound.map((pkg) => (
                    <PackageCard
                      key={`${pkg.id}-${pkg.status?.id ?? ''}:${pkg.location?.id ?? ''}`}
                      data={pkg as unknown as PackageData}
                      onEdit={(id) => navigate(`/packages/${id}/edit`)}
                      statuses={statuses}
                      locations={locations}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
