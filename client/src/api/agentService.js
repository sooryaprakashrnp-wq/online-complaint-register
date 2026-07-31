import API from './axios';

export const getAgents = () => API.get('/agents');
export const assignAgent = (data) => API.put('/agents/assign', data);
export const getAgentDashboard = () => API.get('/agents/dashboard');
