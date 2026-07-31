import API from './axios';

export const submitFeedback = (data) => API.post('/feedback', data);
export const getFeedback = (complaintId) => API.get(`/feedback/${complaintId}`);
export const getAllFeedback = () => API.get('/feedback');
