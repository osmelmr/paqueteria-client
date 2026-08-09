import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generateApi } from '../api/generate.api';

interface DownloadPdfButtonProps {
  packageId: string;
}

export function DownloadPdfButton({ packageId }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async () => {
    if (!packageId.trim()) {
      setError('Ingresa un id de paquete válido.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { blob, filename } = await generateApi.downloadPackagePdf(packageId.trim());
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      setError('No se pudo descargar el PDF. Revisa el id o inicia sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={downloadPdf}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Descargar PDF
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
