import { apiClient } from './apiClient';
import { Pet } from '../types';

export const petService = {
  // 모든 동물 조회
  async getPets(): Promise<Pet[]> {
    try {
      const response = await apiClient.get<Pet[]>('/api/pets');
      return response.content;
    } catch (error) {
      console.error('Failed to fetch pets:', error);
      // API 호출 실패 시 빈 배열 반환
      return [];
    }
  },

  // 특정 동물 조회
  async getPet(petId: string): Promise<Pet> {
    try {
      const response = await apiClient.get<Pet>(`/api/pets/${petId}`);
      return response.content;
    } catch (error) {
      console.error(`Failed to fetch pet ${petId}:`, error);
      throw error;
    }
  },

  // 동물 생성
  async createPet(petData: Omit<Pet, 'id'>): Promise<Pet> {
    try {
      const response = await apiClient.post<Pet>('/api/pets', petData);
      return response.content;
    } catch (error) {
      console.error('Failed to create pet:', error);
      throw error;
    }
  },

  // 특정 동물 정보 수정
  async updatePet(petId: string, petData: Partial<Pet>): Promise<Pet> {
    try {
      const response = await apiClient.put<Pet>(`/api/pets/${petId}`, petData);
      return response.content;
    } catch (error) {
      console.error(`Failed to update pet ${petId}:`, error);
      throw error;
    }
  },

  // 특정 동물 삭제
  async deletePet(petId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/pets/${petId}`);
    } catch (error) {
      console.error(`Failed to delete pet ${petId}:`, error);
      throw error;
    }
  },
}; 