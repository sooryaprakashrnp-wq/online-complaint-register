import API from './axios';

export const getStats = () => API.get('/admin/stats');
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
