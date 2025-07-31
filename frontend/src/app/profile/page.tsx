'use client';

import { useState, useEffect } from 'react';
import Header from '../../shared/components/layout/Header';
import Footer from '../../shared/components/layout/Footer';
import ProfileInfo from '../../features/profile/components/ProfileInfo';
import ProfileEdit from '../../features/profile/components/ProfileEdit';
import AdoptionHistory from '../../features/profile/components/AdoptionHistory';
import LoadingSpinner from '../../shared/components/common/LoadingSpinner';
import ErrorBoundary from '../../shared/components/common/ErrorBoundary';
import { memberService } from '../../shared/services/memberService';
import { User } from '../../features/profile/types';

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
        const userData = await memberService.getCurrentUser();
        
        // API 응답을 User 타입으로 변환
        const user: User = {
          id: userData.id,
          name: userData.nickname || userData.name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
          profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          memberType: userData.memberType || 'adopter',
          createdAt: new Date(userData.createdAt),
          bio: userData.bio || '동물을 사랑하는 사람입니다.'
        };
        
        setUser(user);
      } catch (error) {
        console.error('사용자 정보 로딩 실패:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const tabs = [
    { id: 'info', label: '내 정보', icon: '👤' },
    { id: 'edit', label: '정보 수정', icon: '✏️' },
    { id: 'history', label: '입양 이력', icon: '📋' }
  ];

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
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              다시 시도
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
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
} 