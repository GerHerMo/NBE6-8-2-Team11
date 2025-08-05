import { apiClient } from './apiClient';

// 회원 관리 인터페이스
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  nickname: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'banned';
  role: string;
}

// 펫 관리 인터페이스
export interface AdminPet {
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

// 펫 등록 요청 인터페이스
export interface CreatePetRequest {
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: string;
}

// 펫 수정 요청 인터페이스
export interface UpdatePetRequest {
  name: string;
  species: string;
  breed: string;
  age: number;
}

export const adminService = {
  // ===== 회원 관리 =====
  
  // 전체 회원 목록 조회
  async getMembers(): Promise<AdminUser[]> {
    try {
      const response = await apiClient.get<AdminUser[]>('/admin/members');
      if (response.success) {
        return response.content;
      } else {
        console.error('회원 목록 조회 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 회원 정보 조회
  async getMemberById(memberId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.get<AdminUser>(`/admin/members/${memberId}`);
      if (response.success) {
        return response.content;
      } else {
        console.error('회원 정보 조회 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      throw error;
    }
  },

  // 특정 회원 삭제 및 강제 탈퇴
  async deleteMember(memberId: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`/admin/members/${memberId}`);
      if (response.success) {
        return;
      } else {
        console.error('회원 삭제 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      throw error;
    }
  },

  // ===== 펫 관리 =====

  // 관리자 펫 등록
  async createPet(petData: CreatePetRequest): Promise<AdminPet> {
    try {
      const response = await apiClient.post<AdminPet>('/admin/pets', petData);
      if (response.success) {
        return response.content;
      } else {
        console.error('펫 등록 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('펫 등록 실패:', error);
      throw error;
    }
  },

  // 관리자 펫 리스트 조회
  async getPets(): Promise<AdminPet[]> {
    try {
      const response = await apiClient.get<AdminPet[]>('/admin/pets');
      if (response.success) {
        return response.content;
      } else {
        console.error('펫 목록 조회 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('펫 목록 조회 실패:', error);
      throw error;
    }
  },

  // 관리자 특정 펫 조회
  async getPetById(petId: string): Promise<AdminPet> {
    try {
      const response = await apiClient.get<AdminPet>(`/admin/pets/${petId}`);
      if (response.success) {
        return response.content;
      } else {
        console.error('펫 정보 조회 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('펫 정보 조회 실패:', error);
      throw error;
    }
  },

  // 관리자 펫 정보 수정
  async updatePet(petId: string, petData: UpdatePetRequest): Promise<AdminPet> {
    try {
      const response = await apiClient.put<AdminPet>(`/admin/pets/${petId}`, petData);
      if (response.success) {
        return response.content;
      } else {
        console.error('펫 정보 수정 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('펫 정보 수정 실패:', error);
      throw error;
    }
  },

  // 관리자 펫 정보 삭제
  async deletePet(petId: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`/admin/pets/${petId}`);
      if (response.success) {
        return;
      } else {
        console.error('펫 삭제 실패:', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('펫 삭제 실패:', error);
      throw error;
    }
  },
};

