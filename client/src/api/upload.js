import client from './client';

export const uploadPlayerAvatar = (playerId, file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return client.post(`/upload/avatar/${playerId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadClubLogo = (clubId, file) => {
  const fd = new FormData();
  fd.append('logo', file);
  return client.post(`/upload/logo/${clubId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadUserAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return client.post('/upload/user-avatar', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
