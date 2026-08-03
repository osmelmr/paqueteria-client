import api from './axios';

export type GuideType = 'AEREA' | 'MARITIMA';

export interface Guide {
  id: string;
  name: string;
  type: GuideType;
  agencyId?: string;
  agency?: { id: string; name: string } | null;
  uploadedAt?: string;
}

export interface CreateGuideDto {
  name: string;
  agencyId: string;
  type: GuideType;
}

export type UpdateGuideDto = Partial<CreateGuideDto>;

export const guidesApi = {
  findAll: () => api.get<Guide[]>('/guides').then((r) => r.data),
  findById: (id: string) => api.get<Guide>(`/guides/${id}`).then((r) => r.data),
  create: (dto: CreateGuideDto) => api.post<Guide>('/guides', dto).then((r) => r.data),
  update: (id: string, dto: UpdateGuideDto) => api.patch<Guide>(`/guides/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/guides/${id}`),
};
