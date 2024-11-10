export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  serverApiUrl: import.meta.env.VITE_SERVER_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
} as const;

// Validate that all required environment variables are defined
Object.entries(config).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}); 