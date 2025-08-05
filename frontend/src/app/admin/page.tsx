'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { memberService } from '../../shared/services/member';
import UserManagement from './components/UserManagement';
import PetManagement from './components/PetManagement';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'pets'>('users');
  const { isLoggedIn, userInfo } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 어드민 권한 체크
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);
        const hasAdminRole = await memberService.checkAdminRole();
        setIsAdmin(hasAdminRole);
        
        if (!hasAdminRole) {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('어드민 권한 체크 실패:', error);
        alert('권한 확인에 실패했습니다.');
        router.push('/');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [isLoggedIn, router]);

  // 로딩 중이거나 권한이 없는 경우
  if (isLoading || !isLoggedIn || isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? '권한을 확인하는 중...' : '접근 권한이 없습니다.'}
          </p>
        </div>
      </div>
    );
  }

  // 어드민 권한이 확인된 경우에만 페이지 렌더링
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">회원 및 펫 관리 시스템</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                회원 관리
              </button>
              <button
                onClick={() => setActiveTab('pets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                펫 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'pets' && <PetManagement />}
        </div>
      </div>
    </div>
  );
} 