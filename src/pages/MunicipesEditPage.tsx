import { useEffect, useState, type FormEvent } from 'react';
import { useMunicipes, useUpdateMunicipe } from '../hooks/useMunicipes';
import { useNavigate, useParams } from 'react-router-dom';

export default function MunicipesEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: items = [], isLoading } = useMunicipes();
  const updateEntity = useUpdateMunicipe();
  const navigate = useNavigate();
  const item = items.find((i) => i.id === id);
  const [name, setName] = useState(item?.name ?? '');
  const [header, setHeader] = useState(item?.header ?? true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name ?? '');
      setHeader(item.header ?? true);
    }
  }, [item]);

  if (isLoading) return <div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div>;
  if (!item) return <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">Municipio no encontrado</div>;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await updateEntity.mutateAsync({ id: id!, dto: { name, header } });
      navigate('/municipes');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar municipio</h2>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-3.5 items-end">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="flex items-center gap-2.5 font-medium text-sm">
            <input
              type="checkbox"
              checked={header}
              onChange={(e) => setHeader(e.target.checked)}
              className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
            />
            Cabecera
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5">
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updateEntity.isPending}>Actualizar municipio</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/municipes')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
