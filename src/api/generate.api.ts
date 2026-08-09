import api from './axios';

export const generateApi = {
  downloadPackagePdf: (id: string) =>
    api
      .get<Blob>(`/generate/pdf/${id}`, { responseType: 'blob' })
      .then((response) => ({
        blob: response.data,
        filename:
          response.headers['content-disposition']?.match(/filename="(?<name>.+)"/)?.groups?.name ?? `${id}.pdf`,
      })),
};
