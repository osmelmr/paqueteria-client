import { useState } from 'react';
import { generateApi } from '../api/generate.api';

export function useDownloadPackagePdf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (packageId: string) => {
    setError(null);
    setLoading(true);

    try {
      const { blob, filename } = await generateApi.downloadPackagePdf(packageId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando PDF del paquete:', err);
      setError('No se pudo descargar el PDF.');
    } finally {
      setLoading(false);
    }
  };

  return { downloadPdf, loading, error };
}
