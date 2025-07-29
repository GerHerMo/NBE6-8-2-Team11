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

// 로컬 스토리지에서 카카오 사용자 정보 가져오기
const getKakaoUserInfo = (): KakaoUserInfo | null => {
  try {
    const kakaoUserInfoStr = localStorage.getItem('kakaoUserInfo');
    if (kakaoUserInfoStr) {
      return JSON.parse(kakaoUserInfoStr);
    }
  } catch (error) {
    console.warn('카카오 사용자 정보 파싱 실패:', error);
  }
  return null;
};

// 카카오 정보로 업데이트된 모의 사용자 데이터 생성
const getMockUserWithKakaoInfo = (): User => {
  const kakaoUserInfo = getKakaoUserInfo();
  const mockUser = getMockUser();
  
  if (kakaoUserInfo) {
    console.log('카카오 사용자 정보를 사용하여 프로필을 생성합니다:', kakaoUserInfo);
    return {
      ...mockUser,
      email: kakaoUserInfo.account_email,
      profileImage: kakaoUserInfo.profile_image,
      name: kakaoUserInfo.profile_nickname,
      phone: kakaoUserInfo.phone || mockUser.phone,
      address: kakaoUserInfo.address || mockUser.address,
      bio: kakaoUserInfo.bio || mockUser.bio
    };
  }
  
  console.log('카카오 사용자 정보가 없어 기본 모의 데이터를 사용합니다.');
  return mockUser;
};

export const userApi = {
  // 현재 로그인한 사용자 정보 가져오기
  async getCurrentUser(): Promise<User> {
    try {
      // 백엔드 서버가 실행 중인지 확인
      const response = await apiClient.get<User>('/users/me');
      console.log('백엔드 API에서 사용자 정보를 가져왔습니다:', response.data);
      return response.data;
    } catch (error) {
      console.warn('백엔드 API 서버에 연결할 수 없습니다. 카카오 정보가 포함된 모의 데이터를 사용합니다.');
      // 개발 환경에서는 카카오 정보가 있으면 그것을 우선적으로 사용
      const userWithKakaoInfo = getMockUserWithKakaoInfo();
      console.log('최종 사용자 정보:', userWithKakaoInfo);
      return userWithKakaoInfo;
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
      console.log('백엔드 API를 통해 카카오 사용자 정보를 업데이트했습니다:', response.data);
      return response.data;
    } catch (error) {
      console.warn('백엔드 API 서버에 연결할 수 없습니다. 카카오 정보로 모의 데이터를 업데이트합니다.');
      // 개발 환경에서는 카카오 정보로 업데이트된 모의 데이터 반환
      const updatedUser = {
        ...getMockUser(),
        email: kakaoUserInfo.account_email,
        profileImage: kakaoUserInfo.profile_image,
        name: kakaoUserInfo.profile_nickname,
        phone: kakaoUserInfo.phone || getMockUser().phone,
        address: kakaoUserInfo.address || getMockUser().address,
        bio: kakaoUserInfo.bio || getMockUser().bio
      };
      console.log('카카오 정보로 업데이트된 사용자 정보:', updatedUser);
      return updatedUser;
    }
  },

  // 사용자 정보 업데이트
  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>('/users/me', userData);
      console.log('백엔드 API를 통해 사용자 정보를 업데이트했습니다:', response.data);
      return response.data;
    } catch (error) {
      console.warn('백엔드 API 서버에 연결할 수 없습니다. 카카오 정보가 포함된 모의 데이터를 업데이트합니다.');
      // 개발 환경에서는 업데이트된 모의 데이터 반환
      const mockUser = getMockUserWithKakaoInfo();
      const updatedUser = {
        ...mockUser,
        ...userData
      };
      console.log('업데이트된 사용자 정보:', updatedUser);
      return updatedUser;
    }
  }
}; 