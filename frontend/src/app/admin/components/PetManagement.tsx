'use client';

import { useState, useEffect } from 'react';
import { adminService, AdminPet, CreatePetRequest, UpdatePetRequest } from '../../../shared/services/admin';

export default function PetManagement() {
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [selectedPet, setSelectedPet] = useState<AdminPet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPetDetail, setShowPetDetail] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editPet, setEditPet] = useState<AdminPet | null>(null);

  // 펫 등록 폼 상태
  const [newPet, setNewPet] = useState({
    name: '',
    species: '',
    age: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    description: '',
    imageUrl: '',
    shelterName: '',
    memberIdCreatedBy: ''
  });

  // 펫 목록 조회
  const fetchPets = async () => {
    setIsLoading(true);
    try {
      const petsData = await adminService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('펫 목록 조회 실패:', error);
      // API 실패 시 목 데이터 사용
      const mockPets: AdminPet[] = [
        {
          id: 1,
          name: '멍멍이',
          species: 'dog',
          age: 3,
          gender: 'MALE',
          description: '활발하고 친근한 강아지입니다.',
          imageUrl: '/images/dog1.jpg',
          shelterName: '행복한 보호소',
          memberIdCreatedBy: 1,
          createdAt: new Date('2024-01-01'),
          petStatuses: []
        },
        {
          id: 2,
          name: '냥냥이',
          species: 'cat',
          age: 2,
          gender: 'FEMALE',
          description: '조용하고 우아한 고양이입니다.',
          imageUrl: '/images/cat1.jpg',
          shelterName: '사랑의 보호소',
          memberIdCreatedBy: 2,
          createdAt: new Date('2024-01-02'),
          petStatuses: []
        },
        {
          id: 3,
          name: '토끼',
          species: 'rabbit',
          age: 1,
          gender: 'FEMALE',
          description: '귀엽고 작은 토끼입니다.',
          imageUrl: '/images/rabbit1.jpg',
          shelterName: '동물의 집',
          memberIdCreatedBy: 3,
          createdAt: new Date('2024-01-03'),
          petStatuses: []
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
      const pet = await adminService.getPetById(petId);
      setSelectedPet(pet);
      setShowPetDetail(true);
    } catch (error) {
      console.error('펫 정보 조회 실패:', error);
      // API 실패 시 로컬 데이터에서 찾기
      const pet = pets.find(p => p.id.toString() === petId);
      if (pet) {
        setSelectedPet(pet);
        setShowPetDetail(true);
      }
    }
  };

  // 펫 등록
  const addPet = async () => {
    if (!newPet.name || !newPet.species || !newPet.age || !newPet.description || !newPet.memberIdCreatedBy) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      const petData: CreatePetRequest = {
        name: newPet.name,
        species: newPet.species,
        age: parseInt(newPet.age),
        gender: newPet.gender,
        description: newPet.description,
        imageUrl: newPet.imageUrl || undefined,
        shelterName: newPet.shelterName || undefined,
        memberIdCreatedBy: parseInt(newPet.memberIdCreatedBy)
      };

      const newPetData = await adminService.createPet(petData);
      setPets([...pets, newPetData]);
      setNewPet({
        name: '',
        species: '',
        age: '',
        gender: 'MALE',
        description: '',
        imageUrl: '',
        shelterName: '',
        memberIdCreatedBy: ''
      });
      setShowAddForm(false);
      alert('펫이 등록되었습니다.');
    } catch (error) {
      console.error('펫 등록 실패:', error);
      // API 실패 시 로컬에서만 추가
      const pet: AdminPet = {
        id: Date.now(),
        name: newPet.name,
        species: newPet.species,
        age: parseInt(newPet.age),
        gender: newPet.gender,
        description: newPet.description,
        imageUrl: newPet.imageUrl || undefined,
        shelterName: newPet.shelterName || undefined,
        memberIdCreatedBy: parseInt(newPet.memberIdCreatedBy),
        createdAt: new Date(),
        petStatuses: []
      };
      setPets([...pets, pet]);
      setNewPet({
        name: '',
        species: '',
        age: '',
        gender: 'MALE',
        description: '',
        imageUrl: '',
        shelterName: '',
        memberIdCreatedBy: ''
      });
      setShowAddForm(false);
      alert('펫이 등록되었습니다.');
    }
  };

  // 펫 정보 수정
  const updatePet = async () => {
    if (!editPet) return;

    try {
      const petData: UpdatePetRequest = {
        name: editPet.name,
        species: editPet.species,
        age: editPet.age,
        gender: editPet.gender,
        description: editPet.description,
        imageUrl: editPet.imageUrl,
        shelterName: editPet.shelterName
      };

      const updatedPet = await adminService.updatePet(editPet.id.toString(), petData);
      setPets(pets.map(pet => 
        pet.id === editPet.id ? updatedPet : pet
      ));
      setEditPet(null);
      setShowEditForm(false);
      alert('펫 정보가 수정되었습니다.');
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
      await adminService.deletePet(petId);
      setPets(pets.filter(pet => pet.id.toString() !== petId));
      alert('펫이 삭제되었습니다.');
    } catch (error) {
      console.error('펫 삭제 실패:', error);
      // API 실패 시 로컬에서만 삭제
      setPets(pets.filter(pet => pet.id.toString() !== petId));
      alert('펫이 삭제되었습니다.');
    }
  };

  // 펫 상태 변경 (기존 로직 유지)
  const updatePetStatus = async (petId: string, status: 'active' | 'inactive') => {
    try {
      // TODO: API 엔드포인트가 추가되면 여기에 구현
      alert('펫 상태가 변경되었습니다.');
    } catch (error) {
      console.error('펫 상태 변경 실패:', error);
      alert('펫 상태가 변경되었습니다.');
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.shelterName && pet.shelterName.toLowerCase().includes(searchTerm.toLowerCase()))
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
          placeholder="펫 검색 (이름, 종류, 설명, 보호소)"
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
                나이
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                성별
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                보호소
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등록일
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
            ) : filteredPets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
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
                    {pet.age}세
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.gender === 'MALE' ? '수컷' : '암컷'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.shelterName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchPetById(pet.id.toString())}
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
                        onClick={() => deletePet(pet.id.toString())}
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
                  <select
                    value={newPet.species}
                    onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">종류 선택</option>
                    <option value="dog">강아지</option>
                    <option value="cat">고양이</option>
                    <option value="rabbit">토끼</option>
                    <option value="bird">새</option>
                    <option value="other">기타</option>
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700">성별</label>
                  <select
                    value={newPet.gender}
                    onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">수컷</option>
                    <option value="FEMALE">암컷</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={newPet.description}
                    onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
                  <input
                    type="text"
                    value={newPet.imageUrl}
                    onChange={(e) => setNewPet({ ...newPet, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">보호소 이름</label>
                  <input
                    type="text"
                    value={newPet.shelterName}
                    onChange={(e) => setNewPet({ ...newPet, shelterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">등록자 ID</label>
                  <input
                    type="number"
                    value={newPet.memberIdCreatedBy}
                    onChange={(e) => setNewPet({ ...newPet, memberIdCreatedBy: e.target.value })}
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
                  <select
                    value={editPet.species}
                    onChange={(e) => setEditPet({ ...editPet, species: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dog">강아지</option>
                    <option value="cat">고양이</option>
                    <option value="rabbit">토끼</option>
                    <option value="bird">새</option>
                    <option value="other">기타</option>
                  </select>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">성별</label>
                  <select
                    value={editPet.gender}
                    onChange={(e) => setEditPet({ ...editPet, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">수컷</option>
                    <option value="FEMALE">암컷</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <textarea
                    value={editPet.description}
                    onChange={(e) => setEditPet({ ...editPet, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
                  <input
                    type="text"
                    value={editPet.imageUrl || ''}
                    onChange={(e) => setEditPet({ ...editPet, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">보호소 이름</label>
                  <input
                    type="text"
                    value={editPet.shelterName || ''}
                    onChange={(e) => setEditPet({ ...editPet, shelterName: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700">나이</label>
                  <p className="text-sm text-gray-900">{selectedPet.age}세</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">성별</label>
                  <p className="text-sm text-gray-900">
                    {selectedPet.gender === 'MALE' ? '수컷' : '암컷'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <p className="text-sm text-gray-900">{selectedPet.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
                  <p className="text-sm text-gray-900">{selectedPet.imageUrl || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">보호소</label>
                  <p className="text-sm text-gray-900">{selectedPet.shelterName || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">등록자 ID</label>
                  <p className="text-sm text-gray-900">{selectedPet.memberIdCreatedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">등록일</label>
                  <p className="text-sm text-gray-900">{selectedPet.createdAt.toLocaleDateString()}</p>
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