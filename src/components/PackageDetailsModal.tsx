import React from 'react';
import {
  X,
  Package as PackageIcon,
  AlertCircle,
  Building2,
  User,
  MapPin,
  Weight,
  FileText,
  Calendar,
  Tag,
  Hash,
  Clock,
} from 'lucide-react';
import { usePackage } from '../hooks/usePackages';
import type { Package } from '../api/packages.api';

interface PackageDetailsModalProps {
  isOpen: boolean;
  packageId: string;
  initialData?: Partial<Package> | null;
  onClose: () => void;
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100 break-words">
        {value ?? '—'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-100 dark:border-gray-800 first:border-t-0 pt-4 mt-4 first:pt-0 first:mt-0">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

export const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({
  isOpen,
  packageId,
  initialData,
  onClose,
}) => {
  const { data: fetched, isLoading } = usePackage(packageId, isOpen);

  if (!isOpen) return null;

  const pkg = fetched ?? initialData;

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

  const formatDateTime = (date?: string | null) =>
    date ? new Date(date).toLocaleString('es-CU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-gray-500" /> Detalles del Paquete
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {isLoading && !pkg && (
            <div className="text-center py-8 text-sm text-gray-500">Cargando...</div>
          )}

          {pkg && (
            <>
              {/* Identificacion */}
              <div className="flex items-center gap-2 flex-wrap">
                {(pkg.hbls ?? []).map((h) => (
                  <span
                    key={h.hblCode}
                    className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono font-semibold text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                  >
                    {h.hblCode}
                  </span>
                ))}
                {(pkg.hbls ?? []).length === 0 && (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Sin HBL</span>
                )}
                {pkg.alert === true && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> Alerta
                  </span>
                )}
              </div>

              <Section title="Guía">
                <DetailItem icon={Tag} label="Guía" value={pkg.guide?.name} />
                <DetailItem icon={FileText} label="Tipo" value={pkg.guide?.type} />
                <DetailItem
                  icon={Building2}
                  label="Agencia"
                  value={pkg.guide?.agency?.name}
                />
              </Section>

              <Section title="Destinatario">
                <DetailItem icon={User} label="Nombre" value={pkg.recipient?.fullName} />
                <DetailItem icon={Hash} label="Carnet de identidad" value={pkg.recipient?.idCard} />
                <DetailItem icon={FileText} label="Teléfono" value={pkg.recipient?.phone} />
              </Section>

              <Section title="Ubicación">
                <DetailItem icon={MapPin} label="Provincia" value={pkg.province?.name} />
                <DetailItem icon={MapPin} label="Municipio" value={pkg.municipe?.name} />
                <DetailItem icon={MapPin} label="Dirección" value={pkg.address} />
              </Section>

              <Section title="Estado">
                <DetailItem icon={Tag} label="Estado" value={pkg.status?.name} />
                <DetailItem icon={MapPin} label="Ubicación actual" value={pkg.location?.name} />
                <DetailItem
                  icon={Calendar}
                  label="Fecha de llegada"
                  value={formatDate(pkg.arrivalDate)}
                />
              </Section>

              <Section title="Detalles del paquete">
                <DetailItem
                  icon={Weight}
                  label="Peso"
                  value={
                    pkg.weight != null
                      ? `${Number(pkg.weight).toFixed(2)} kg`
                      : null
                  }
                />
                <DetailItem icon={PackageIcon} label="Contenido" value={pkg.content} />
                <DetailItem icon={FileText} label="Anotaciones" value={pkg.anotations} />
                {pkg.alert === true && (
                  <DetailItem
                    icon={AlertCircle}
                    label="Descripción de alerta"
                    value={pkg.alertDescription}
                  />
                )}
              </Section>

              <Section title="Registro">
                <DetailItem icon={Clock} label="Creado" value={formatDateTime(pkg.createdAt)} />
                <DetailItem icon={Clock} label="Actualizado" value={formatDateTime(pkg.updatedAt)} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
