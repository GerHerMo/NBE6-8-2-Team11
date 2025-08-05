import { apiClient } from './apiClient';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  userEmail: string;
  userName: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export const memberService = {
  // 로그인
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', request);
    // 백엔드 응답 구조: { success: boolean, content: LoginResponse, message: string }
    return response.content;
  },

  // 회원가입
  async signup(request: SignupRequest): Promise<void> {
    await apiClient.post<void>('/auth/join', request);
  },

  // 현재 사용자 정보 조회 (저장된 사용자 정보 사용)
  async getCurrentUser(): Promise<User> {
    try {
      // AuthContext에서 사용자 정보 가져오기
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        console.log('Current user from userInfo:', userInfo);
        
        // userInfo.sub에서 userId 추출
        const userId = parseInt(userInfo.sub, 10);
        
        // API에서 실제 사용자 정보 가져오기
        const response = await apiClient.get<User>(`/members/${userId}`);
        return response.content;
      }
      
      // userInfo가 없으면 기본값 반환
      return {
        id: 1,
        email: 'user@example.com',
        name: '사용자',
        phone: '',
        role: 'USER'
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      // 기본 사용자 정보 반환
      return {
        id: 1,
        email: 'user@example.com',
        name: '사용자',
        phone: '',
        role: 'USER'
      };
    }
  },

  // 사용자 ID로 사용자 정보 조회
  async getUserById(userId: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/members/${userId}`);
      return response.content;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      // 기본 사용자 정보 반환
      return {
        id: userId,
        email: `user${userId}@example.com`,
        name: `사용자 ${userId}`,
        phone: '',
        role: 'USER'
      };
    }
  },

  // 어드민 권한 체크
  async checkAdminRole(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      return currentUser.role === 'ADMIN';
    } catch (error) {
      console.error('Failed to check admin role:', error);
      return false;
    }
  },

  // 현재 사용자의 역할 조회
  async getCurrentUserRole(): Promise<string> {
    try {
      const currentUser = await this.getCurrentUser();
      return currentUser.role;
    } catch (error) {
      console.error('Failed to get current user role:', error);
      return 'USER';
    }
  },
}; 