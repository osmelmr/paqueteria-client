import api from './axios';

export interface BulkAiEntities {
  statusId: string;
  agencyId: string;
  locationId?: string;
  location?: string;
  guideId?: string;
  guide?: string;
  packages: Array<{
    province?: string;
    municipe?: string;
    address?: string;
    content?: string;
    weight?: number;
    arrivalDate?: string;
    fullName?: string;
    idCard?: string;
    phone?: string;
    hblCodes?: string[];
  }>;
}

export interface BulkStatusUpdate {
  hbls: string[];
  statusId?: string;
  locationId?: string;
}

export interface ResolveAlertDto {
  guideId?: string;
  recipientId?: string;
  provinceId?: string;
  address?: string;
  weight?: number;
  content?: string;
  arrivalDate?: string;
  statusId?: string;
  locationId?: string;
  anotations?: string;
  alertDescription?: string;
  hbls?: string[];
}

export const businessApi = {
  processBulkAi: (entities: BulkAiEntities) =>
    api.post('/business/process-bulk-ai', entities).then((r) => r.data),

  updateStatusBulk: (dto: BulkStatusUpdate) =>
    api.post('/business/update-status-bulk', dto).then((r) => r.data),

  resolveAlert: (packageId: string, dto: ResolveAlertDto) =>
    api.patch(`/business/packages/${packageId}/resolve-alert`, dto).then((r) => r.data),
};
