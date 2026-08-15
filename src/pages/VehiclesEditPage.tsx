import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles, useUpdateVehicle } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import { CustomSelect } from '../components/CustomSelect';

export default function VehiclesEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vehicles = [], isLoading } = useVehicles();
  const updateVehicle = useUpdateVehicle();
  const { data: drivers = [] } = useDrivers();

  const vehicle = vehicles.find((v) => v.id === id);
  const [name, setName] = useState('');
  const [driverIds, setDriverIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicle) return;
    setName(vehicle.name);
    setDriverIds(vehicle.drivers?.map((d) => d.driverId) ?? []);
  }, [vehicle?.id]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto w-full min-w-0"><div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]"><div className="mb-4 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-gray-100">Cargando...</div></div></div>;
  }

  if (!vehicle) {
    return <div className="max-w-7xl mx-auto w-full min-w-0"><div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">Vehiculo no encontrado</div></div>;
  }

  const toggleDriver = (driverId: string) => {
    setDriverIds((prev) =>
      prev.includes(driverId)
        ? prev.filter((d) => d !== driverId)
        : [...prev, driverId],
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await updateVehicle.mutateAsync({
        id: id!,
        dto: { name, driverIds },
      });
      navigate('/vehicles');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Editar vehiculo</h2>
        {localError && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{localError}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Nombre / Placa
            <input className="border border-border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Choferes
            <CustomSelect value="" onChange={(id) => toggleDriver(id)} options={drivers.filter((d) => !driverIds.includes(d.id)).map((d) => ({ id: d.id, name: d.name }))} placeholder="Agregar chofer..." />
          </label>
          {driverIds.length > 0 && (
            <div className="col-span-full flex flex-wrap gap-2">
              {drivers.filter((d) => driverIds.includes(d.id)).map((d) => (
                <span key={d.id} className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100">
                  {d.name}
                  <button type="button" className="bg-transparent border-none cursor-pointer text-gray-500 dark:text-gray-400 hover:text-red-500 font-bold" onClick={() => toggleDriver(d.id)}>x</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2.5 flex-wrap mt-3.5" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors disabled:opacity-50" disabled={updateVehicle.isPending}>Guardar</button>
            <button type="button" className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-border font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/vehicles')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
