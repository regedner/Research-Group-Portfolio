import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export interface YearCount {
  year: string;
  count: number;
}

export const fetchMembers = async () => {
  const response = await api.get('/members?page=0&size=10&sort=id');
  return response.data;
};

export const fetchNewMember = async (sourceId: string, providerType: string) => {
  const response = await api.post('/members/fetch', {}, { params: { sourceId, providerType } });
  return response.data;
};

export const getMemberById = async (id: string) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

export const updateMember = async (id: string, updatedMember: { description?: string; photoPath?: string }) => {
  const response = await api.put(`/members/${id}`, updatedMember);
  return response.data;
};

export const uploadMemberPhoto = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/members/${id}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getPublicationsByMember = async (
  id: string, 
  page: number = 0, 
  size: number = 10, 
  sort: string = 'id',
  types: string[] = [], // YENİ
  tags: string[] = []   // YENİ
) => {
  
  // URLSearchParams, dizileri (array) backend'e düzgün yollamak için kritik
  // (örn: ?types=article&types=preprint&tags=AI)
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  params.append('sort', sort);
  types.forEach(type => params.append('types', type));
  tags.forEach(tag => params.append('tags', tag));

  const response = await api.get(`/members/${id}/publications`, { params });
  return response.data;
};

export const getPublicationMetadata = async (id: string) => {
  const response = await api.get(`/members/${id}/publication-metadata`);
  return response.data;
};

export const getOpenAlexWorkTypes = async (): Promise<string[]> => {
  const response = await api.get('/openalex/work-types');
  return response.data;
};

export const updatePublicationType = async (id: number, type: string) => {
  const response = await api.put(`/publications/${id}/type`, { type });
  return response.data;
};

export const getMemberCountsByYear = async (id: string): Promise<YearCount[]> => {
  const response = await api.get(`/members/${id}/counts-by-year`);
  return response.data;
};

export const getConferencesByMember = async (id: string) => {
  const response = await api.get(`/members/${id}/conferences`);
  return response.data;
};

export const addConference = async (memberId: string, conference: { name: string; year: number; location: string; description: string }) => {
  const response = await api.post(`/members/${memberId}/conferences`, conference);
  return response.data;
};

export const updatePublicationTags = async (id: number, tags: string[]) => {
  const response = await api.put(`/publications/${id}/tags`, tags);
  return response.data;
};