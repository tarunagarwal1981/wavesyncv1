import { ApiResponse, ApiError as ApiErrorType } from './types';
import { handleApiError } from './errors';

// API Client Configuration
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

// Request options
interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Retry configuration
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000;

class ApiClient {
  private config: Required<ApiClientConfig>;
  private abortController?: AbortController;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      ...config,
    };
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.config.timeout,
      retries = DEFAULT_RETRIES,
      retryDelay = DEFAULT_RETRY_DELAY,
      headers,
      ...fetchOptions
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestHeaders = {
      ...this.config.defaultHeaders,
      ...headers,
    };

    const requestConfig: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
      signal: this.createAbortSignal(timeout),
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse<T> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Request failed');
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's an authentication error or client error
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('403') || error.message.includes('400')) {
            break;
          }
        }

        // Wait before retrying (except on last attempt)
        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  // Helper method to create abort signal
  private createAbortSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    this.abortController = controller;

    setTimeout(() => {
      controller.abort();
    }, timeout);

    return controller.signal;
  }

  // Helper method for delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload method
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, browser sets it automatically
      },
    });
  }

  // Set authorization header
  setAuthHeader(token: string): void {
    this.config.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization header
  removeAuthHeader(): void {
    delete this.config.defaultHeaders['Authorization'];
  }

  // Cancel ongoing requests
  cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  // Update base configuration
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create default API client instance
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
});

// Export functions for easier usage
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => apiClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) => apiClient.put<T>(endpoint, data, options),
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) => apiClient.patch<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestOptions) => apiClient.delete<T>(endpoint, options),
  upload: <T>(endpoint: string, file: File, additionalData?: Record<string, any>) => 
    apiClient.upload<T>(endpoint, file, additionalData),
  
  // Auth helpers
  setAuthToken: (token: string) => apiClient.setAuthHeader(token),
  removeAuthToken: () => apiClient.removeAuthHeader(),
  
  // Configuration
  configure: (config: Partial<ApiClientConfig>) => apiClient.updateConfig(config),
};

// Error handling wrapper for component usage
export async function handleApiCall<T>(
  apiCall: Promise<ApiResponse<T>>
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await apiCall;
    return { data: response.data };
  } catch (error) {
    const errorData = handleApiError(error);
    return { error: errorData.message };
  }
}

export default apiClient;
export { ApiClient };
