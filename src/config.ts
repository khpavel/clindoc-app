// In development, use relative paths to leverage Vite's proxy
// In production, you may want to use an absolute URL
//export const API_BASE_URL = "" as const;
export const API_BASE_URL = "http://127.0.0.1:8000" as const;


export const apiUrl = (path: string): string => {
  // Ensure path starts with / if it doesn't already
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Automatically prepend /api/v1 to all API paths
  const apiPath = normalizedPath.startsWith('/api/v1') 
    ? normalizedPath 
    : `/api/v1${normalizedPath}`;
  return `${API_BASE_URL}${apiPath}`;
};
