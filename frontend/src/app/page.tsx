'use client';

import { useState, useEffect } from 'react';
import { Pet } from '../shared/types';
import { petService } from '../shared/services/petService';
import HeroSection from '../features/home/components/HeroSection';
import StatsSection from '../features/home/components/StatsSection';
import ServicesSection from '../features/home/components/ServicesSection';
import GalleryPreview from '../features/gallery/components/GalleryPreview';
import CTASection from '../features/home/components/CTASection';
import Footer from '../shared/components/layout/Footer';

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const petsData = await petService.getPets();
        setPets(petsData);
      } catch (error) {
        console.error('Failed to load pets for preview:', error);
        setPets([]); // 에러 시 빈 배열로 설정
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <GalleryPreview pets={pets} />
      <CTASection />
      <Footer />
    </div>
  );
}
