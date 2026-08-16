import { useNavigate } from 'react-router-dom';
import { Sparkles, FileSpreadsheet } from 'lucide-react';

export default function RegisterPackagesPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0">
      <div className="p-[18px] border border-border rounded-xl bg-surface shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-1.5">
          Registrar paquetes nuevos
        </h2>
        <p className="m-0 mb-5 text-sm text-gray-500 dark:text-gray-400">
          Elige cómo quieres registrar la lista de paquetes.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/ai-extract')}
            className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-white dark:bg-slate-800 p-5 text-left cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-1">
                Con IA (automático)
              </h3>
              <p className="m-0 text-sm text-gray-500 dark:text-gray-400">
                Extrae los datos automáticamente desde el texto de una guía usando inteligencia artificial.
              </p>
            </div>
            <span className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Ir a la extracción por IA →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/excel-import')}
            className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-white dark:bg-slate-800 p-5 text-left cursor-pointer transition-all hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-1">
                Manual (desde Excel)
              </h3>
              <p className="m-0 text-sm text-gray-500 dark:text-gray-400">
                Carga un archivo Excel, indica qué columna corresponde a cada campo y guarda el lote sin usar IA.
              </p>
            </div>
            <span className="mt-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              Ir a la importación manual →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}