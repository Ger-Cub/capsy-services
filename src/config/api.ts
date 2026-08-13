export const getFastApiUrl = (): string => {
  const metaEnv = (import.meta as any).env || {};
  if (metaEnv.VITE_ODOO_API_URL) {
    return metaEnv.VITE_ODOO_API_URL.replace(/\/$/, '');
  }
  if (metaEnv.VITE_FASTAPI_URL) {
    return metaEnv.VITE_FASTAPI_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://capsy-odoo-api.vercel.app';
  }
  return 'http://localhost:8000';
};
