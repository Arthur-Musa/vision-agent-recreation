// Environment configuration
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "https://sinistros-ia-sistema-production.up.railway.app",
    timeout: 30000,
  },
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    maxFilesPerUpload: 10,
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  }
} as const;

export type Config = typeof config;