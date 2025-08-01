'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [hasError, setHasError] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    // 이미 로드되었거나 에러가 발생한 경우 다시 시도하지 않음
    if (hasLoaded.current || hasError) {
      return;
    }

    const loadPets = async () => {
      try {
        hasLoaded.current = true;
        const petsData = await petService.getPets();
        setPets(petsData);
      } catch (error) {
        console.error('Failed to load pets for preview:', error);
        setPets([]); // 에러 시 빈 배열로 설정
        setHasError(true); // 에러 상태로 설정하여 재시도 방지
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, [hasError]);

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
