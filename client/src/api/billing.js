import client from './client';

export const getSubscription  = (clubId) => client.get(`/billing/${clubId}`);
export const createCheckout   = (data)   => client.post('/billing/checkout', data);
export const createPortal     = (data)   => client.post('/billing/portal', data);
