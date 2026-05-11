import client from './client';

export const getFixtures    = (params) => client.get('/fixtures', { params });
export const getFixture     = (id)     => client.get(`/fixtures/${id}`);
export const createFixture  = (data)   => client.post('/fixtures', data);
export const updateFixture  = (id,d)   => client.put(`/fixtures/${id}`, d);
export const deleteFixture  = (id)     => client.delete(`/fixtures/${id}`);
export const recordResult   = (id,d)   => client.post(`/fixtures/${id}/result`, d);
