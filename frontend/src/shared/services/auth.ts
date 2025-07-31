import { apiClient } from './apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface JoinRequest {
  email: string;
  password: string;
  nickname: string;
  [key: string]: any;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    [key: string]: any;
  };
}

export const authService = {
  // 회원가입
  async join(userData: JoinRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/join', userData);
    
    // 회원가입 성공 시 토큰과 사용자 정보 저장
    if (response.content.token) {
      localStorage.setItem('accessToken', response.content.token);
      localStorage.setItem('userId', response.content.user.id);
      localStorage.setItem('userEmail', response.content.user.email);
      localStorage.setItem('userName', response.content.user.nickname);
    }
    
    return response.content;
  },

  // 로그인
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // 로그인 성공 시 토큰과 사용자 정보 저장
    if (response.content.token) {
      localStorage.setItem('accessToken', response.content.token);
      localStorage.setItem('userId', response.content.user.id);
      localStorage.setItem('userEmail', response.content.user.email);
      localStorage.setItem('userName', response.content.user.nickname);
    }
    
    return response.content;
  },

  // 회원 탈퇴
  async deleteAccount(memberId: string): Promise<void> {
    await apiClient.delete(`/auth/${memberId}`);
    
    // 회원 탈퇴 성공 시 로컬 스토리지에서 사용자 정보 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  },

  // 로그아웃
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser(): {
    id: string | null;
    email: string | null;
    name: string | null;
  } {
    return {
      id: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      name: localStorage.getItem('userName'),
    };
  },

  // 토큰 가져오기
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  // 인증 상태 확인
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
