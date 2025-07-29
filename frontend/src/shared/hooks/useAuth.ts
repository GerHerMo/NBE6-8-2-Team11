'use client';

import { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';
import { User } from '../../features/profile/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // API를 통해 사용자 정보 가져오기
          const userData = await userApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.warn('API 서버에 연결할 수 없습니다. 모의 데이터를 사용합니다.');
          // API 오류는 무시하고 모의 데이터 사용
          const userData = await userApi.getCurrentUser();
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    loadUserInfo();
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // 로그인 후 사용자 정보를 다시 로드
    loadUserInfo();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const loadUserInfo = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.warn('API 서버에 연결할 수 없습니다. 모의 데이터를 사용합니다.');
        // API 오류는 무시하고 모의 데이터 사용
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      }
    } else {
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
}; 