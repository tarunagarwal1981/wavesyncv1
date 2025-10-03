// API Configuration
export const API_CONFIG = {
  // Base URLs
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Version
  version: 'v1',
  
  // Rate limiting (requests per window)
  rateLimits: {
    // Authentication endpoints
    auth: {
      login: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      signup: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
      passwordReset: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
      refresh: { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 refreshes per 15 minutes
    },
    
    // General endpoints
    default: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    
    // Upload endpoints
    upload: {
      certificates: { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 uploads per hour
      documents: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
      avatar: { requests: 2, windowMs: 60 * 60 * 1000 }, // 2 uploads per hour
    },
    
    // Export endpoints
    export: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 exports per 15 minutes
    
    // Weather endpoints
    weather: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
    
    // Admin endpoints
    admin: { requests: 500, windowMs: 15 * 60 * 1000 }, // 500 requests per 15 minutes
  },
  
  // File upload limits
  fileUpload: {
    maxSize: {
      certificate: 10 * 1024 * 1024, // 10MB
      document: 50 * 1024 * 1024, // 50MB
      avatar: 2 * 1024 * 1024, // 2MB
      general: 25 * 1024 * 1024, // 25MB
    },
    allowedTypes: {
      certificate: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetmlsheet'],
      avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      general: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'],
    },
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1,
  },
  
  // Cache settings
  cache: {
    defaultTTL: 300, // 5 minutes
    authTTL: 3600, // 1 hour
    weatherTTL: 1800, // 30 minutes
  },
  
  // External services
  external: {
    weather: {
      apiKey: process.env.WEATHER_API_KEY,
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      timeout: 10000, // 10 seconds
    },
  },
  
  // Storage buckets
  storage: {
    certificates: 'certificates',
    documents: 'documents',
    avatars: 'avatars',
    exports: 'exports',
  },
  
  // Notification settings
  notifications: {
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
  },
  
  // Export settings
  export: {
    maxFileAgeHours: 24,
    cleanupIntervalHours: 6,
    supportedFormats: ['pdf', 'csv', 'xlsx'],
  },
  
  // Security settings
  security: {
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '7d',
    passwordMinLength: 8,
    passwordRequirements: {
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },
  
  // CORS settings
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'https://wavesync.app',
      'https://staging.wavesync.app',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowCredentials: true,
  },
};

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    isDevelopment,
    isProduction,
    
    // Development overrides
    ...(isDevelopment && {
      rateLimits: {
        ...API_CONFIG.rateLimits,
        auth: {
          login: { requests: 100, windowMs: 60 * 1000 }, // More lenient for dev
          signup: { requests: 50, windowMs: 60 * 1000 },
          passwordReset: { requests: 50, windowMs: 60 * 1000 },
          refresh: { requests: 200, windowMs: 60 * 1000 },
        },
        default: { requests: 1000, windowMs: 60 * 1000 },
      },
      fileUpload: {
        ...API_CONFIG.fileUpload,
        maxSize: {
          certificate: 100 * 1024 * 1024, // Larger limits for dev
          document: 200 * 1024 * 1024,
          avatar: 10 * 1024 * 1024,
          general: 100 * 1024 * 1024,
        },
      },
    }),
    
    // Production overrides
    ...(isProduction && {
      cors: {
        allowedOrigins: [
          'https://wavesync.app',
          'https://app.wavesync.app',
        ],
      },
    }),
  };
};

// Helper functions
export const getRateLimitForEndpoint = (endpoint: string): { requests: number; windowMs: number } => {
  const parts = endpoint.split('/');
  
  // Check for specific endpoint patterns
  if (parts.includes('auth')) {
    const authAction = parts[parts.length - 1];
    return API_CONFIG.rateLimits.auth[authAction as keyof typeof API_CONFIG.rateLimits.auth] || API_CONFIG.rateLimits.default;
  }
  
  if (parts.includes('upload')) {
    const uploadType = parts[parts.length - 1];
    return API_CONFIG.rateLimits.upload[uploadType as keyof typeof API_CONFIG.rateLimits.upload] || API_CONFIG.rateLimits.default;
  }
  
  if (parts.includes('export')) {
    return API_CONFIG.rateLimits.export;
  }
  
  if (parts.includes('weather')) {
    return API_CONFIG.rateLimits.weather;
  }
  
  return API_CONFIG.rateLimits.default;
};

export const getFileUploadLimit = (category: keyof typeof API_CONFIG.fileUpload.maxSize) => {
  return API_CONFIG.fileUpload.maxSize[category];
};

export const getAllowedFileTypes = (category: keyof typeof API_CONFIG.fileUpload.allowedTypes) => {
  return API_CONFIG.fileUpload.allowedTypes[category];
};

export const isValidFileType = (
  file: File | { type: string },
  category: keyof typeof API_CONFIG.fileUpload.allowedTypes
): boolean => {
  const allowedTypes = getAllowedFileTypes(category);
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (
  file: File | { size: number },
  category: keyof typeof API_CONFIG.fileUpload.maxSize
): boolean => {
  const maxSize = getFileUploadLimit(category);
  return file.size <= maxSize;
};

// Export the current environment config
export const ENV_CONFIG = getEnvironmentConfig();



