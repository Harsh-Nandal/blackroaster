import HeroSection from '@/components/home/HeroSection'
import CategorySection from '@/components/home/CategorySection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import RoomInspirationSection from '@/components/home/RoomInspirationSection'
import WhyUsSection from '@/components/home/WhyUsSection'
import StatsSection from '@/components/home/StatsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ProjectsSection from '@/components/home/ProjectsSection'
import CTASection from '@/components/home/CTASection'

export const metadata = {
  title: 'BlackRoaster — Premium PVC Wall Panels | Elevate Every Wall, Every Room',
  description:
    'Premium PVC wall panels for modern interiors. 3D wall panels, ceiling panels, fluted, stone and wood finish — delivered pan India with custom sizing.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <RoomInspirationSection />
      <WhyUsSection />
      <StatsSection />
      <ProjectsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
