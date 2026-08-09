import { useState } from 'react';
import { DownloadPdfButton } from '../components/DownloadPdfButton';

export default function TestPage() {
  const [packageId, setPackageId] = useState('');

  return (
    <div className="max-w-3xl mx-auto w-full min-h-full p-6">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-lg dark:bg-gray-900 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-4">Prueba de descarga de PDF</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Ingresa el id del paquete y presiona el botón para descargar el PDF generado por el endpoint <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">/generate/pdf/:id</code>.
        </p>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Id de paquete</span>
          <input
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="Ej. 1234abcd"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          />
        </label>

        <DownloadPdfButton packageId={packageId} />
      </div>
    </div>
  );
}
