import client from './client';

export const getSessions       = (params) => client.get('/sessions', { params });
export const getSession        = (id)     => client.get(`/sessions/${id}`);
export const createSession     = (data)   => client.post('/sessions', data);
export const updateSession     = (id,d)   => client.put(`/sessions/${id}`, d);
export const deleteSession     = (id)     => client.delete(`/sessions/${id}`);
export const recordAttendance  = (id,d)   => client.post(`/sessions/${id}/attendance`, d);
