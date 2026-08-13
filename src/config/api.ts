export const getFastApiUrl = (): string => {
  const metaEnv = (import.meta as any).env || {};
  const procEnv = (typeof process !== 'undefined' ? process.env : {}) || {};

  const apiUrl = metaEnv.ODOO_API_URL || procEnv.ODOO_API_URL || metaEnv.VITE_ODOO_API_URL || metaEnv.VITE_FASTAPI_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://capsy-odoo-api.vercel.app';
  }
  return 'http://localhost:8000';
};
