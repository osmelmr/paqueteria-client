import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateVehicle } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import { CustomSelect } from '../components/CustomSelect';

export default function VehiclesCreatePage() {
  const navigate = useNavigate();
  const createVehicle = useCreateVehicle();
  const { data: drivers = [] } = useDrivers();

  const [form, setForm] = useState({ name: '', driverIds: [] as string[] });
  const [localError, setLocalError] = useState<string | null>(null);

  const toggleDriver = (id: string) => {
    setForm((prev) => ({
      ...prev,
      driverIds: prev.driverIds.includes(id)
        ? prev.driverIds.filter((d) => d !== id)
        : [...prev.driverIds, id],
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await createVehicle.mutateAsync({
        name: form.name,
        driverIds: form.driverIds.length ? form.driverIds : undefined,
      });
      navigate('/vehicles');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Nuevo vehiculo</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre / Placa
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Choferes
            <CustomSelect value="" onChange={(id) => toggleDriver(id)} options={drivers.filter((d) => !form.driverIds.includes(d.id)).map((d) => ({ id: d.id, name: d.name }))} placeholder="Agregar chofer..." />
          </label>
          {form.driverIds.length > 0 && (
            <div className="col-span-full flex flex-wrap gap-2">
              {drivers.filter((d) => form.driverIds.includes(d.id)).map((d) => (
                <span key={d.id} className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100">
                  {d.name}
                  <button type="button" className="bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 hover:text-red-500 font-bold" onClick={() => toggleDriver(d.id)}>x</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={createVehicle.isPending}>Crear vehiculo</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/vehicles')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
