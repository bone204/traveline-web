import { HeroCarousel } from "@/components/hero.carousel";
import { ServicesSection } from "@/components/services.section";
import { StatsSection } from "@/components/stats.section";
import { TestimonialSection } from "@/components/testimonial.section";
import { LocationSection } from "@/components/location.section";
import type { LocationCardProps } from "@/components/location.card";

// Dữ liệu địa điểm trong nước
const domesticLocations: LocationCardProps[] = [
  {
    id: "da-nang",
    name: "Đà Nẵng",
    description: "Thành phố biển xinh đẹp với bãi biển Mỹ Khê và cầu Rồng",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    price: "2.5tr",
    rating: 4.8,
    location: "Miền Trung",
    href: "/empty-page",
  },
  {
    id: "ha-long",
    name: "Hạ Long",
    description: "Vịnh di sản thế giới với hàng nghìn đảo đá vôi hùng vĩ",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    price: "3.2tr",
    rating: 4.9,
    location: "Quảng Ninh",
    href: "/empty-page",
  },
  {
    id: "sapa",
    name: "Sapa",
    description: "Thị trấn sương mù với ruộng bậc thang và văn hóa dân tộc",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop",
    price: "2.8tr",
    rating: 4.7,
    location: "Lào Cai",
    href: "/empty-page",
  },
  {
    id: "phu-quoc",
    name: "Phú Quốc",
    description: "Đảo ngọc với bãi biển hoang sơ và resort sang trọng",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    price: "4.5tr",
    rating: 4.8,
    location: "Kiên Giang",
    href: "/empty-page",
  },
];

// Dữ liệu địa điểm nổi bật
const featuredLocations: LocationCardProps[] = [
  {
    id: "cappadocia",
    name: "Cappadocia, Thổ Nhĩ Kỳ",
    description: "Bay khinh khí cầu bình minh trên thung lũng đá độc đáo",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
    price: "18tr",
    rating: 4.9,
    location: "Thổ Nhĩ Kỳ",
    href: "/empty-page",
  },
  {
    id: "santorini",
    name: "Santorini, Hy Lạp",
    description: "Hòn đảo với kiến trúc trắng xanh và hoàng hôn nổi tiếng",
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop",
    price: "22tr",
    rating: 4.9,
    location: "Hy Lạp",
    href: "/empty-page",
  },
  {
    id: "maldives",
    name: "Maldives",
    description: "Thiên đường resort biển với làn nước trong xanh như pha lê",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop",
    price: "35tr",
    rating: 5.0,
    location: "Maldives",
    href: "/empty-page",
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <HeroCarousel />
      <ServicesSection />
      <StatsSection />
      <TestimonialSection />

      <LocationSection
        title="Điểm đến nổi bật"
        subtitle="Những địa điểm được yêu thích nhất"
        locations={featuredLocations}
        className="location-section--featured"
      />

      <LocationSection
        title="Du lịch trong nước"
        subtitle="Khám phá vẻ đẹp Việt Nam"
        locations={domesticLocations}
        className="location-section--domestic"
      />
    </div>
  );
}
