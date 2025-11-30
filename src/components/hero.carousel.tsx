"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  stats: { label: string; value: string }[];
  cta: { label: string; href: string };
};

const slides: Slide[] = [
  {
    title: "Vịnh Hạ Long",
    subtitle: "Di sản thiên nhiên thế giới",
    description:
      "Khám phá vẻ đẹp hùng vĩ của hơn 1.600 hòn đảo đá vôi nhô lên từ làn nước xanh ngọc, trải nghiệm du thuyền qua các hang động kỳ bí và thưởng thức hải sản tươi ngon.",
    imageUrl:
      "https://minio.halongbay.com.vn/halongbay/images/17593669111730084792tructhangvinhhalong.jpg",
    stats: [
      { label: "Nhiệt độ", value: "25-30°C" },
      { label: "Giá tour", value: "2.5tr" },
      { label: "Thời gian", value: "Quanh năm" },
    ],
    cta: { label: "Đặt tour Hạ Long", href: "/bone" },
  },
  {
    title: "Phố cổ Hội An",
    subtitle: "Thành phố đèn lồng",
    description:
      "Dạo bước trên những con phố cổ rực rỡ ánh đèn lồng, thưởng thức cao lầu đặc sản, tham quan các ngôi nhà cổ hàng trăm năm tuổi và trải nghiệm văn hóa truyền thống Việt Nam.",
    imageUrl:
      "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/10/6/1101769/Hoi-An-22.jpeg",
    stats: [
      { label: "Nhiệt độ", value: "28-32°C" },
      { label: "Giá tour", value: "1.8tr" },
      { label: "Best time", value: "Th2 - Th5" },
    ],
    cta: { label: "Khám phá Hội An", href: "/bone" },
  },
  {
    title: "Sapa - Đỉnh Fansipan",
    subtitle: "Nóc nhà Đông Dương",
    description:
      "Chinh phục đỉnh Fansipan 3.143m, ngắm ruộng bậc thang vàng óng vào mùa lúa chín, gặp gỡ các dân tộc thiểu số và trải nghiệm văn hóa vùng cao Tây Bắc.",
    imageUrl:
      "https://mia.vn/media/uploads/blog-du-lich/dien-dao-truoc-ve-dep-hung-vi-cua-fansipan-noc-nha-dong-duong-1624924043.jpg",
    stats: [
      { label: "Nhiệt độ", value: "15-20°C" },
      { label: "Giá tour", value: "3.5tr" },
      { label: "Độ cao", value: "3.143m" },
    ],
    cta: { label: "Đặt tour Sapa", href: "/bone" },
  },
  {
    title: "Đảo Phú Quốc",
    subtitle: "Thiên đường biển đảo",
    description:
      "Thư giãn trên những bãi biển cát trắng mịn màng, lặn ngắm san hô đầy màu sắc, thưởng thức hải sản tươi sống và khám phá vườn quốc gia Phú Quốc với hệ sinh thái đa dạng.",
    imageUrl:
      "https://rootytrip.com/wp-content/uploads/2024/07/phu-quoc.jpg",
    stats: [
      { label: "Nhiệt độ", value: "27-32°C" },
      { label: "Giá tour", value: "4.5tr" },
      { label: "Best time", value: "Th11 - Th3" },
    ],
    cta: { label: "Đặt tour Phú Quốc", href: "/bone" },
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const totalSlides = slides.length;
  const safeActiveIndex = useMemo(
    () => Math.min(Math.max(activeIndex, 0), totalSlides - 1),
    [activeIndex, totalSlides],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  return (
    <section className="hero-carousel" aria-label="Những hành trình mới nhất">
      <div className="hero-carousel__slides">
        {slides.map((slide, index) => {
          const isActive = index === safeActiveIndex;
          return (
            <article
              key={slide.title}
              className={`hero-slide${isActive ? " is-active" : ""}`}
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              <div className="hero-slide__overlay" />
              <div className="hero-slide__content">
                <p className="hero-slide__eyebrow">{slide.subtitle}</p>
                <h1 className="hero-slide__title">{slide.title}</h1>
                <p className="hero-slide__desc">{slide.description}</p>

                <dl className="hero-slide__stats">
                  {slide.stats.map(({ label, value }) => (
                    <div key={`${slide.title}-${label}`}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>

                <Link className="hero-slide__cta" href={slide.cta.href}>
                  <span>{slide.cta.label}</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

