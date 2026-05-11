import client from './client';

export const getClubs   = ()        => client.get('/clubs');
export const getClub    = (id)      => client.get(`/clubs/${id}`);
export const createClub = (data)    => client.post('/clubs', data);
export const updateClub = (id,data) => client.put(`/clubs/${id}`, data);
export const deleteClub = (id)      => client.delete(`/clubs/${id}`);
