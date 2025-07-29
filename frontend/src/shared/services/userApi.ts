import { apiClient } from './apiClient';
import { User } from '../../features/profile/types';

// 카카오 로그인 사용자 정보 인터페이스
interface KakaoUserInfo {
  account_email: string;
  profile_image: string;
  profile_nickname: string;
  phone?: string;
  address?: string;
  memberType?: 'adopter' | 'shelter';
  bio?: string;
}

// 개발 환경용 모의 사용자 데이터
const getMockUser = (): User => ({
  id: 1,
  name: '김동물',
  email: 'kim@example.com',
  phone: '010-1234-5678',
  address: '서울시 강남구',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  memberType: 'adopter',
  createdAt: new Date('2024-01-15'),
  bio: '동물을 사랑하는 사람입니다. 새로운 가족을 찾고 있어요!'
});

export const userApi = {
  // 현재 로그인한 사용자 정보 가져오기
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/users/me');
      return response.data;
    } catch (error) {
      console.warn('API 서버에 연결할 수 없습니다. 모의 데이터를 사용합니다.');
      // 개발 환경에서는 모의 데이터 반환
      return getMockUser();
    }
  },

  // 카카오 사용자 정보로 사용자 정보 업데이트
  async updateUserFromKakao(kakaoUserInfo: KakaoUserInfo): Promise<User> {
    try {
      const userData = {
        email: kakaoUserInfo.account_email,
        profileImage: kakaoUserInfo.profile_image,
        name: kakaoUserInfo.profile_nickname,
        phone: kakaoUserInfo.phone || '',
        address: kakaoUserInfo.address || '',
        memberType: kakaoUserInfo.memberType || 'adopter',
        bio: kakaoUserInfo.bio || ''
      };

      const response = await apiClient.put<User>('/users/me', userData);
      return response.data;
    } catch (error) {
      console.warn('API 서버에 연결할 수 없습니다. 모의 데이터를 사용합니다.');
      // 개발 환경에서는 카카오 정보로 업데이트된 모의 데이터 반환
      return {
        ...getMockUser(),
        email: kakaoUserInfo.account_email,
        profileImage: kakaoUserInfo.profile_image,
        name: kakaoUserInfo.profile_nickname,
        phone: kakaoUserInfo.phone || getMockUser().phone,
        address: kakaoUserInfo.address || getMockUser().address,
        bio: kakaoUserInfo.bio || getMockUser().bio
      };
    }
  },

  // 사용자 정보 업데이트
  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>('/users/me', userData);
      return response.data;
    } catch (error) {
      console.warn('API 서버에 연결할 수 없습니다. 모의 데이터를 사용합니다.');
      // 개발 환경에서는 업데이트된 모의 데이터 반환
      const mockUser = getMockUser();
      return {
        ...mockUser,
        ...userData
      };
    }
  }
}; 