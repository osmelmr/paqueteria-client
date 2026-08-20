import { useRoutes, useDeleteRoute } from '../hooks/useRoutes';
import { useNavigate } from 'react-router-dom';
import {DescargaExcelButton} from '../components/DescargaExcelButton.js'

function parseNotFound(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* ignorar y tratar como texto */
  }
  return raw
    .split(/[\r\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RoutesListPage() {
  const { data: items = [], isLoading, error: queryError } = useRoutes();
  const deleteEntity = useDeleteRoute();
  const navigate = useNavigate();
  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta ruta? Los paquetes asignados quedaran sin ruta.')) return;
    try {
      await deleteEntity.mutateAsync(id);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString() : '-';

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0">Rutas</h2>
          <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate('/routes/new')}>Nueva ruta</button>
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        {isLoading && <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Nombre</th>
                <th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Salida</th>
                <th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Vehiculo</th>
                <th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Paquetes</th>
                <th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">No encontrados</th>
                <th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{item.name}</td>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{formatDate(item.departureDate)}</td>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{item.vehicle?.name ?? '-'}</td>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{item.packages?.length ?? 0}</td>
                  {(() => {
                    const missing = parseNotFound(item.notFound);
                    return (
                      <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">
                        {missing.length > 0 ? (
                          <span
                            title={missing.join(', ')}
                            className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 cursor-help"
                          >
                            {missing.length}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                    );
                  })()}
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white rounded-xl px-2.5 py-2 text-xs cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate(`/routes/${item.id}/edit`)}>Editar</button>
                      <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border rounded-xl px-2.5 py-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleDelete(item.id)}>Eliminar</button>
                      <DescargaExcelButton routeId={item.id} /> 
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !isLoading && <tr><td colSpan={6} className="border border-border p-2.5 text-gray-700 dark:text-gray-300" style={{ textAlign: 'center', color: 'var(--muted)' }}>No hay rutas registradas</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
