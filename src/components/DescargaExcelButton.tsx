// DescargaExcelButton.jsx
import { useEffect, useRef } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { useRouteExcel } from '../hooks/useRoutes';

export function DescargaExcelButton({ routeId }: { routeId: string }) {
  const { data, refetch, isFetching } = useRouteExcel(routeId);
  const pendingDownload = useRef(false);

  useEffect(() => {
    if (data && pendingDownload.current) {
      pendingDownload.current = false;
      const url = window.URL.createObjectURL(data.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }, [data]);

  const handleDownload = async () => {
    try {
      pendingDownload.current = true;
      await refetch();
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo descargar el archivo.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isFetching}
      title="Descargar Excel"
      aria-label="Descargar Excel"
      className="inline-flex items-center justify-center p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border-none cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-800/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
    >
      {isFetching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
    </button>
  );
}
