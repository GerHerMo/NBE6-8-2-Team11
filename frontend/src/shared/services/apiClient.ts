// API 클라이언트 설정
// 팀원들의 기존 환경과 호환성을 위한 우선순위 설정
const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL ||  // 환경변수 우선
  'http://localhost:8080';             // Docker 환경 기본값

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    console.log('API 클라이언트 초기화:', this.baseURL);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // API 엔드포인트가 /api로 시작하지 않으면 추가
    const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const url = `${this.baseURL}${normalizedEndpoint}`;
    
    // Authorization 헤더 추가
    const accessToken = localStorage.getItem('accessToken');
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    });

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    const config: RequestInit = {
      headers,
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    console.log(`API 요청: ${config.method || 'GET'} ${url}`);
    console.log('요청 헤더:', Object.fromEntries(headers.entries()));

    try {
      const response = await fetch(url, config);
      
      console.log(`API 응답 상태: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 오류 응답: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('API 요청 실패:', error);
      console.error('요청 URL:', url);
      console.error('요청 설정:', config);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);