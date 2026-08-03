import { PackageCard, type PackageData } from '../components/PackageCard';

const samples: PackageData[] = [
  {
    id: 'pkg-1',
    guide: { externalRef: 'G-2024-0892', agency: { name: 'Agencia Caribe' } },
    hbls: [
      { hblCode: 'HBL-001-ABC' },
      { hblCode: 'HBL-002-DEF' },
      { hblCode: 'HBL-003-GHI' },
    ],
    alert: true,
    province: { name: 'La Habana' },
    municipe: { name: 'Plaza' },
    recipient: { fullName: 'Juan Carlos Rodríguez' },
    weight: 14.5,
    status: { name: 'En tránsito' },
    location: { name: 'Almacén Central' },
  },
  {
    id: 'pkg-2',
    guide: { externalRef: 'G-2024-0911', agency: { name: 'Agencia del Centro' } },
    hbls: [{ hblCode: 'HBL-004-JKL' }],
    alert: false,
    province: { name: 'Santiago de Cuba' },
    municipe: { name: 'Santiago' },
    recipient: { fullName: 'María García López' },
    weight: 3.2,
    status: { name: 'Entregado' },
    location: { name: 'Sucursal Santiago' },
  },
  {
    id: 'pkg-3',
    hbls: [
      { hblCode: 'HBL-005-MNO' },
      { hblCode: 'HBL-006-PQR' },
    ],
    alert: true,
    province: { name: 'Matanzas' },
    recipient: { fullName: 'Pedro Martínez' },
    weight: 8.0,
    status: { name: 'En aduana' },
  },
];

export default function PackageCardTestPage() {
  return (
    <div className="p-4 sm:p-8 bg-canvas min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
          Listado de Paquetes
        </h2>

        <div className="flex flex-col gap-3">
          {samples.map((pkg) => (
            <PackageCard
              key={pkg.id}
              data={pkg}
              onEdit={(id) => console.log('Edit', id)}
              onDelete={(id) => console.log('Delete', id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
