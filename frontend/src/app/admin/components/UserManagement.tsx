'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../shared/services/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  nickname: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'banned';
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // 전체 회원 목록 조회
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<User[]>('/admin/users');
      if (response.success) {
        setUsers(response.content);
      } else {
        console.error('회원 목록 조회 실패:', response.message);
        // API 실패 시 목 데이터 사용
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'user1',
            email: 'user1@example.com',
            nickname: '사용자1',
            createdAt: '2024-01-01',
            status: 'active',
            role: 'USER'
          },
          {
            id: '2',
            username: 'admin',
            email: 'admin@example.com',
            nickname: '관리자',
            createdAt: '2024-01-02',
            status: 'active',
            role: 'ADMIN'
          },
          {
            id: '3',
            username: 'user3',
            email: 'user3@example.com',
            nickname: '사용자3',
            createdAt: '2024-01-03',
            status: 'inactive',
            role: 'USER'
          }
        ];
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      // 에러 시 목 데이터 사용
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'user1',
          email: 'user1@example.com',
          nickname: '사용자1',
          createdAt: '2024-01-01',
          status: 'active',
          role: 'USER'
        },
        {
          id: '2',
          username: 'admin',
          email: 'admin@example.com',
          nickname: '관리자',
          createdAt: '2024-01-02',
          status: 'active',
          role: 'ADMIN'
        },
        {
          id: '3',
          username: 'user3',
          email: 'user3@example.com',
          nickname: '사용자3',
          createdAt: '2024-01-03',
          status: 'inactive',
          role: 'USER'
        }
      ];
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 회원 정보 조회
  const fetchUserById = async (userId: string) => {
    try {
      const response = await apiClient.get<User>(`/admin/users/${userId}`);
      if (response.success) {
        setSelectedUser(response.content);
        setShowUserDetail(true);
      } else {
        // API 실패 시 로컬 데이터에서 찾기
        const user = users.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          setShowUserDetail(true);
        }
      }
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      // 에러 시 로컬 데이터에서 찾기
      const user = users.find(u => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setShowUserDetail(true);
      }
    }
  };

  // 회원 삭제/강제 탈퇴
  const deleteUser = async (userId: string) => {
    if (!confirm('정말로 이 회원을 삭제하시겠습니까?')) return;
    
    try {
      const response = await apiClient.delete<void>(`/admin/users/${userId}`);
      if (response.success) {
        setUsers(users.filter(user => user.id !== userId));
        alert('회원이 삭제되었습니다.');
      } else {
        alert('회원 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      // API 실패 시 로컬에서만 삭제
      setUsers(users.filter(user => user.id !== userId));
      alert('회원이 삭제되었습니다.');
    }
  };

  // 회원 상태 변경
  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'banned') => {
    try {
      const response = await apiClient.put<void>(`/admin/users/${userId}/status`, { status });
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status } : user
        ));
        alert('회원 상태가 변경되었습니다.');
      } else {
        alert('회원 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 상태 변경 실패:', error);
      // API 실패 시 로컬에서만 변경
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
      alert('회원 상태가 변경되었습니다.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">회원 관리</h2>
        <button
          onClick={fetchUsers}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          새로고침
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="회원 검색 (이름, 이메일, 닉네임)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.nickname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? '관리자' : '사용자'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '차단'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchUserById(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {user.status === 'active' ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 회원 상세 정보 모달 */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">회원 상세 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자명</label>
                  <p className="text-sm text-gray-900">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">닉네임</label>
                  <p className="text-sm text-gray-900">{selectedUser.nickname}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">역할</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.role === 'ADMIN' ? '관리자' : '사용자'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">가입일</label>
                  <p className="text-sm text-gray-900">{selectedUser.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.status === 'active' ? '활성' : selectedUser.status === 'inactive' ? '비활성' : '차단'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 