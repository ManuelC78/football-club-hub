import client from './client';

export const getPlayers   = (params) => client.get('/players', { params });
export const getPlayer    = (id)     => client.get(`/players/${id}`);
export const createPlayer = (data)   => client.post('/players', data);
export const updatePlayer = (id,d)   => client.put(`/players/${id}`, d);
export const deletePlayer = (id)     => client.delete(`/players/${id}`);
