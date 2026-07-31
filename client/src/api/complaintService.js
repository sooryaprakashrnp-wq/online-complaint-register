import API from './axios';

export const getComplaints = (params) => API.get('/complaints', { params });
export const getComplaint = (id) => API.get(`/complaints/${id}`);
export const createComplaint = (data) => API.post('/complaints', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateComplaint = (id, data) => API.put(`/complaints/${id}`, data);
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const addMessage = (id, text) => API.post(`/complaints/${id}/message`, { text });
export const addInternalNote = (id, text) => API.post(`/complaints/${id}/internal-note`, { text });
