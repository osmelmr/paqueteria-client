import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useRecipients, useDeleteRecipient } from '../hooks/useRecipients';

export default function RecipientsListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const { data: recipients = [], isLoading, error: queryError } = useRecipients({ search: search || undefined });
  const deleteRecipient = useDeleteRecipient();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este destinatario?')) return;
    try {
      await deleteRecipient.mutateAsync(id);
    } catch (err) {
      /* error is ignored in list page */
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0">Destinatarios</h2>
          <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate('/recipients/new')}>Nuevo destinatario</button>
        </div>
        <div className="relative mb-4 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, carnet o telefono..."
            className="w-full h-10 pl-9 pr-9 border border-border rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        {isLoading && <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>}
        {!isLoading && !error && search && recipients.length === 0 && (
          <div className="mb-4 p-3.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm">
            No se encontraron destinatarios para "{search}".
          </div>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr><th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Nombre</th><th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Carnet</th><th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Telefono</th><th className="border border-border p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Acciones</th></tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id}>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{r.fullName}</td>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{r.idCard}</td>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">{r.phone || '—'}</td>
                  <td className="border border-border p-2.5 text-gray-700 dark:text-gray-300">
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white rounded-xl px-2.5 py-2 text-xs cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate(`/recipients/${r.id}/edit`)}>Editar</button>
                      <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border rounded-xl px-2.5 py-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleDelete(r.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}