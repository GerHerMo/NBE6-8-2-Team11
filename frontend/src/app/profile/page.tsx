'use client';

import { useState, useEffect } from 'react';
import Header from '../../shared/components/layout/Header';
import Footer from '../../shared/components/layout/Footer';
import ProfileInfo from '../../features/profile/components/ProfileInfo';
import ProfileEdit from '../../features/profile/components/ProfileEdit';
import AdoptionHistory from '../../features/profile/components/AdoptionHistory';
import FavoritePets from '../../features/profile/components/FavoritePets';
import LoadingSpinner from '../../shared/components/common/LoadingSpinner';
import ErrorBoundary from '../../shared/components/common/ErrorBoundary';
import { User } from '../../features/profile/types';
import { userApi } from '../../shared/services/userApi';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 로컬 스토리지에서 토큰 확인
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('로그인이 필요합니다.');
        }

        console.log('프로필 페이지에서 사용자 정보를 로딩합니다...');
        
        // API를 통해 현재 로그인한 사용자 정보 가져오기
        // 카카오 정보가 있으면 자동으로 포함됨
        const userData = await userApi.getCurrentUser();
        console.log('로딩된 사용자 정보:', userData);
        
        if (userData) {
          setUser(userData);
        } else {
          throw new Error('사용자 정보를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('사용자 정보 로딩 실패:', error);
        
        // 로그인이 필요한 경우
        if (error instanceof Error && error.message === '로그인이 필요합니다.') {
          setError('로그인이 필요합니다.');
        } else {
          // API 오류는 무시하고 모의 데이터 사용 (카카오 정보 포함)
          console.warn('API 오류로 인해 카카오 정보가 포함된 모의 데이터를 사용합니다.');
          try {
            const userData = await userApi.getCurrentUser();
            console.log('모의 데이터로 로딩된 사용자 정보:', userData);
            if (userData) {
              setUser(userData);
            } else {
              setError('사용자 정보를 불러올 수 없습니다.');
            }
          } catch (fallbackError) {
            console.error('모의 데이터 로딩도 실패:', fallbackError);
            setError('사용자 정보를 불러올 수 없습니다.');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const tabs = [
    { id: 'info', label: '내 정보', icon: '👤' },
    { id: 'edit', label: '정보 수정', icon: '✏️' },
    { id: 'history', label: '입양 이력', icon: '📋' },
    { id: 'favorites', label: '관심 동물', icon: '❤️' }
  ];

  console.log('프로필 페이지 렌더링:', { isLoading, user, error });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">오류 발생</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">사용자 정보 없음</h2>
            <p className="text-gray-600 mb-4">사용자 정보를 불러올 수 없습니다.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">내 프로필</h1>
            <p className="text-gray-600">내 정보와 입양 이력을 관리하세요</p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-6">
              {activeTab === 'info' && <ProfileInfo user={user} />}
              {activeTab === 'edit' && <ProfileEdit user={user} setUser={setUser} />}
              {activeTab === 'history' && <AdoptionHistory />}
              {activeTab === 'favorites' && <FavoritePets />}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
} 