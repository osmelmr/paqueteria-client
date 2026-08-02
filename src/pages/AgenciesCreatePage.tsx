import { useState, type FormEvent } from 'react';
import { useCreateAgency } from '../hooks/useAgencies';
import { useNavigate } from 'react-router-dom';
import type { GuideType } from '../api/agencies.api';

export default function AgenciesCreatePage() {
  const createEntity = useCreateAgency();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<GuideType>('AEREA');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createEntity.mutateAsync({ name, type });
      navigate('/agencies');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-[#dbdbdb] dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nueva agencia</h2>
        {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5 items-end">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre
            <input className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Tipo
            <select className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200" value={type} onChange={(e) => setType(e.target.value as GuideType)} required>
              <option value="AEREA">Aérea</option>
              <option value="MARITIMA">Marítima</option>
            </select>
          </label>
          <div className="flex gap-2.5 flex-wrap mt-3.5">
            <button type="submit" disabled={createEntity.isPending} className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50">Crear agencia</button>
            <button type="button" className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => navigate('/agencies')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
