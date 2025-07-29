'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, BRAND_INFO } from '../../constants';
import { userApi } from '../../services/userApi';
import { User } from '../../../features/profile/types';

// 실제 토큰 기반 로그인 상태 관리
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      // localStorage에서 토큰 확인
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      console.log('헤더 - 토큰 확인:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
      if (accessToken && refreshToken) {
        try {
          // API를 통해 사용자 정보 가져오기
          console.log('헤더 - 사용자 정보 로딩 시작');
          const userData = await userApi.getCurrentUser();
          console.log('헤더 - 사용자 정보 로딩 완료:', userData);
          setUser(userData);
        } catch (error) {
          console.warn('헤더 - API 서버에 연결할 수 없습니다. 모의 데이터를 사용합니다.');
          // API 오류는 무시하고 모의 데이터 사용
          const userData = await userApi.getCurrentUser();
          console.log('헤더 - 모의 데이터 사용:', userData);
          setUser(userData);
        }
      } else {
        // 토큰이 없으면 로그인하지 않은 상태
        console.log('헤더 - 토큰이 없어 로그인하지 않은 상태로 설정');
        setUser(null);
      }
      
      setIsLoading(false);
    };

    loadUserInfo();
  }, []);

  const logout = () => {
    console.log('헤더 - 로그아웃 실행');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('kakaoUserInfo');
    setUser(null);
  };

  return { user, isLoading, logout };
};

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  const handleKakaoLogin = () => {
    // 백엔드의 OAuth2 엔드포인트로 리다이렉트
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  console.log('헤더 렌더링 - 로그인 상태:', { user: !!user, isLoading, userInfo: user });

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{BRAND_INFO.logo}</span>
            </div>
            <span className="text-xl font-bold text-gray-800">{BRAND_INFO.name}</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  // 로그인된 상태: 사용자 이름, 내 프로필, 로그아웃 버튼
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 font-medium">
                      {user.name} 님
                    </span>
                    <Link
                      href="/profile"
                      className={`text-sm font-medium transition-colors ${
                        pathname === '/profile'
                          ? 'text-orange-600'
                          : 'text-gray-700 hover:text-orange-500'
                      }`}
                    >
                      내 프로필
                    </Link>
                    <button 
                      onClick={logout}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  // 로그인하지 않은 상태: 카카오 로그인 버튼
                  <button 
                    onClick={handleKakaoLogin}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/kakao_login_medium_narrow.png"
                      alt="카카오 로그인"
                      width={183}
                      height={45}
                      className="cursor-pointer"
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 