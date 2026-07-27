import { useNavigate } from 'react-router-dom';
import { useGuides, useDeleteGuide } from '../hooks/useGuides';

export default function GuidesListPage() {
  const navigate = useNavigate();
  const { data: guides = [], isLoading, error: queryError } = useGuides();
  const deleteGuide = useDeleteGuide();

  const error = queryError ? (queryError as Error).message : null;

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta guia?')) return;
    try {
      await deleteGuide.mutateAsync(id);
    } catch (err) {
      /* error is ignored in list page */
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white/92 dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0">Guias</h2>
          <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate('/guides/new')}>Nueva guia</button>
        </div>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        {isLoading && <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr><th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">ID</th><th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Agencia</th><th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Referencia</th><th className="border border-gray-200 dark:border-gray-700 p-2.5 text-left bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100 font-semibold">Acciones</th></tr>
            </thead>
            <tbody>
              {guides.map((g) => (
                <tr key={g.id}>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{g.id}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{g.agency?.name || '—'}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">{g.externalRef}</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2.5 text-gray-700 dark:text-gray-300">
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="bg-purple-500 dark:bg-purple-400 text-white rounded-xl px-2.5 py-2 text-xs cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors" onClick={() => navigate(`/guides/${g.id}/edit`)}>Editar</button>
                      <button type="button" className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleDelete(g.id)}>Eliminar</button>
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
