'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userApi } from '../../../shared/services/userApi';

function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processLogin = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const accountEmail = searchParams.get('account_email');
      const profileImage = searchParams.get('profile_image');
      const profileNickname = searchParams.get('profile_nickname');

      if (accessToken && refreshToken) {
        // 토큰을 로컬 스토리지에 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // 카카오 사용자 정보가 있으면 로컬 스토리지에 저장
        if (accountEmail && profileImage && profileNickname) {
          const kakaoUserInfo = {
            account_email: accountEmail,
            profile_image: profileImage,
            profile_nickname: profileNickname
          };
          
          // 카카오 사용자 정보를 로컬 스토리지에 저장
          localStorage.setItem('kakaoUserInfo', JSON.stringify(kakaoUserInfo));
          
          setIsProcessing(true);
          try {
            // 카카오 사용자 정보로 사용자 정보 업데이트
            await userApi.updateUserFromKakao(kakaoUserInfo);
            console.log('카카오 사용자 정보 업데이트 완료');
          } catch (error) {
            console.error('카카오 사용자 정보 업데이트 실패:', error);
            // 사용자 정보 업데이트 실패해도 로그인은 성공으로 처리
          } finally {
            setIsProcessing(false);
          }
        }

        // 메인 페이지로 리다이렉트
        router.push('/');
      } else {
        // 토큰이 없으면 에러 상태로 설정하고 3초 후 홈으로 리다이렉트
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
        
        // 3초 후 홈으로 리다이렉트
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    processLogin();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 실패</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">잠시 후 홈페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isProcessing ? '사용자 정보를 업데이트하는 중...' : '로그인 처리 중...'}
        </p>
      </div>
    </div>
  );
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <OAuth2RedirectContent />
    </Suspense>
  );
} 