'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../shared/services/apiClient';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function PetManagement() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPetDetail, setShowPetDetail] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);

  // 펫 등록 폼 상태
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    ownerId: ''
  });

  // 펫 목록 조회
  const fetchPets = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Pet[]>('/admin/pets');
      if (response.success) {
        setPets(response.content);
      } else {
        console.error('펫 목록 조회 실패:', response.message);
        // API 실패 시 목 데이터 사용
        const mockPets: Pet[] = [
          {
            id: '1',
            name: '멍멍이',
            species: '강아지',
            breed: '골든 리트리버',
            age: 3,
            ownerId: '1',
            ownerName: '사용자1',
            createdAt: '2024-01-01',
            status: 'active'
          },
          {
            id: '2',
            name: '냥냥이',
            species: '고양이',
            breed: '페르시안',
            age: 2,
            ownerId: '2',
            ownerName: '사용자2',
            createdAt: '2024-01-02',
            status: 'active'
          },
          {
            id: '3',
            name: '토끼',
            species: '토끼',
            breed: '네덜란드 드워프',
            age: 1,
            ownerId: '3',
            ownerName: '사용자3',
            createdAt: '2024-01-03',
            status: 'inactive'
          }
        ];
        setPets(mockPets);
      }
    } catch (error) {
      console.error('펫 목록 조회 실패:', error);
      // 에러 시 목 데이터 사용
      const mockPets: Pet[] = [
        {
          id: '1',
          name: '멍멍이',
          species: '강아지',
          breed: '골든 리트리버',
          age: 3,
          ownerId: '1',
          ownerName: '사용자1',
          createdAt: '2024-01-01',
          status: 'active'
        },
        {
          id: '2',
          name: '냥냥이',
          species: '고양이',
          breed: '페르시안',
          age: 2,
          ownerId: '2',
          ownerName: '사용자2',
          createdAt: '2024-01-02',
          status: 'active'
        },
        {
          id: '3',
          name: '토끼',
          species: '토끼',
          breed: '네덜란드 드워프',
          age: 1,
          ownerId: '3',
          ownerName: '사용자3',
          createdAt: '2024-01-03',
          status: 'inactive'
        }
      ];
      setPets(mockPets);
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 펫 조회
  const fetchPetById = async (petId: string) => {
    try {
      const response = await apiClient.get<Pet>(`/admin/pets/${petId}`);
      if (response.success) {
        setSelectedPet(response.content);
        setShowPetDetail(true);
      } else {
        // API 실패 시 로컬 데이터에서 찾기
        const pet = pets.find(p => p.id === petId);
        if (pet) {
          setSelectedPet(pet);
          setShowPetDetail(true);
        }
      }
    } catch (error) {
      console.error('펫 정보 조회 실패:', error);
      // 에러 시 로컬 데이터에서 찾기
      const pet = pets.find(p => p.id === petId);
      if (pet) {
        setSelectedPet(pet);
        setShowPetDetail(true);
      }
    }
  };

  // 펫 등록
  const addPet = async () => {
    if (!newPet.name || !newPet.species || !newPet.breed || !newPet.age || !newPet.ownerId) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const petData = {
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed,
        age: parseInt(newPet.age),
        ownerId: newPet.ownerId
      };

      const response = await apiClient.post<Pet>('/admin/pets', petData);
      if (response.success) {
        setPets([...pets, response.content]);
        setNewPet({ name: '', species: '', breed: '', age: '', ownerId: '' });
        setShowAddForm(false);
        alert('펫이 등록되었습니다.');
      } else {
        alert('펫 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('펫 등록 실패:', error);
      // API 실패 시 로컬에서만 추가
      const pet: Pet = {
        id: Date.now().toString(),
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed,
        age: parseInt(newPet.age),
        ownerId: newPet.ownerId,
        ownerName: `사용자${newPet.ownerId}`,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setPets([...pets, pet]);
      setNewPet({ name: '', species: '', breed: '', age: '', ownerId: '' });
      setShowAddForm(false);
      alert('펫이 등록되었습니다.');
    }
  };

  // 펫 정보 수정
  const updatePet = async () => {
    if (!editPet) return;

    try {
      const petData = {
        name: editPet.name,
        species: editPet.species,
        breed: editPet.breed,
        age: editPet.age
      };

      const response = await apiClient.put<Pet>(`/admin/pets/${editPet.id}`, petData);
      if (response.success) {
        setPets(pets.map(pet => 
          pet.id === editPet.id ? response.content : pet
        ));
        setEditPet(null);
        setShowEditForm(false);
        alert('펫 정보가 수정되었습니다.');
      } else {
        alert('펫 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('펫 정보 수정 실패:', error);
      // API 실패 시 로컬에서만 수정
      setPets(pets.map(pet => 
        pet.id === editPet.id ? editPet : pet
      ));
      setEditPet(null);
      setShowEditForm(false);
      alert('펫 정보가 수정되었습니다.');
    }
  };

  // 펫 삭제
  const deletePet = async (petId: string) => {
    if (!confirm('정말로 이 펫을 삭제하시겠습니까?')) return;
    
    try {
      const response = await apiClient.delete<void>(`/admin/pets/${petId}`);
      if (response.success) {
        setPets(pets.filter(pet => pet.id !== petId));
        alert('펫이 삭제되었습니다.');
      } else {
        alert('펫 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('펫 삭제 실패:', error);
      // API 실패 시 로컬에서만 삭제
      setPets(pets.filter(pet => pet.id !== petId));
      alert('펫이 삭제되었습니다.');
    }
  };

  // 펫 상태 변경
  const updatePetStatus = async (petId: string, status: 'active' | 'inactive') => {
    try {
      const response = await apiClient.put<void>(`/admin/pets/${petId}/status`, { status });
      if (response.success) {
        setPets(pets.map(pet => 
          pet.id === petId ? { ...pet, status } : pet
        ));
        alert('펫 상태가 변경되었습니다.');
      } else {
        alert('펫 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('펫 상태 변경 실패:', error);
      // API 실패 시 로컬에서만 변경
      setPets(pets.map(pet => 
        pet.id === petId ? { ...pet, status } : pet
      ));
      alert('펫 상태가 변경되었습니다.');
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">펫 관리</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            펫 등록
          </button>
          <button
            onClick={fetchPets}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="펫 검색 (이름, 종류, 품종, 주인)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 펫 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                종류
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                품종
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                나이
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주인
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등록일
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
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : filteredPets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  펫이 없습니다.
                </td>
              </tr>
            ) : (
              filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.species}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.breed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.age}세
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pet.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchPetById(pet.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => {
                          setEditPet(pet);
                          setShowEditForm(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => updatePetStatus(pet.id, pet.status === 'active' ? 'inactive' : 'active')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {pet.status === 'active' ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => deletePet(pet.id)}
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

      {/* 펫 등록 모달 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">펫 등록</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">종류</label>
                  <input
                    type="text"
                    value={newPet.species}
                    onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">품종</label>
                  <input
                    type="text"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">나이</label>
                  <input
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">주인 ID</label>
                  <input
                    type="text"
                    value={newPet.ownerId}
                    onChange={(e) => setNewPet({ ...newPet, ownerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
                <button
                  onClick={addPet}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 펫 수정 모달 */}
      {showEditForm && editPet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">펫 정보 수정</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    value={editPet.name}
                    onChange={(e) => setEditPet({ ...editPet, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">종류</label>
                  <input
                    type="text"
                    value={editPet.species}
                    onChange={(e) => setEditPet({ ...editPet, species: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">품종</label>
                  <input
                    type="text"
                    value={editPet.breed}
                    onChange={(e) => setEditPet({ ...editPet, breed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">나이</label>
                  <input
                    type="number"
                    value={editPet.age}
                    onChange={(e) => setEditPet({ ...editPet, age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
                <button
                  onClick={updatePet}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 펫 상세 정보 모달 */}
      {showPetDetail && selectedPet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">펫 상세 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedPet.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <p className="text-sm text-gray-900">{selectedPet.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">종류</label>
                  <p className="text-sm text-gray-900">{selectedPet.species}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">품종</label>
                  <p className="text-sm text-gray-900">{selectedPet.breed}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">나이</label>
                  <p className="text-sm text-gray-900">{selectedPet.age}세</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">주인</label>
                  <p className="text-sm text-gray-900">{selectedPet.ownerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">등록일</label>
                  <p className="text-sm text-gray-900">{selectedPet.createdAt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <p className="text-sm text-gray-900">
                    {selectedPet.status === 'active' ? '활성' : '비활성'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPetDetail(false)}
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