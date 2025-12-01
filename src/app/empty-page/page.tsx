"use client";

import { useMemo } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import errorLottie from "@/assets/lotties/error.json";

type ParticleStyle = {
  left: string;
  animationDelay: string;
  animationDuration: string;
  width: string;
  height: string;
  '--bubble-drift': string;
};

function generateParticles(): ParticleStyle[] {
  return Array.from({ length: 30 }).map(() => {
    const size = 4 + Math.random() * 12; // Bong bóng từ 4px đến 16px
    return {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${4 + Math.random() * 6}s`,
      width: `${size}px`,
      height: `${size}px`,
      '--bubble-drift': String((Math.random() - 0.5) * 100)
    };
  });
}

export default function EmptyPage() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="empty-page">
      <div className="empty-page__background">
        <div className="empty-page__gradient empty-page__gradient--1"></div>
        <div className="empty-page__gradient empty-page__gradient--2"></div>
        <div className="empty-page__gradient empty-page__gradient--3"></div>
        <div className="empty-page__particles">
          {particles.map((style, i) => (
            <div key={i} className="empty-page__particle" style={style}></div>
          ))}
        </div>
      </div>
      <div className="empty-page__container">
        <div className="empty-page__lottie">
          <Lottie
            animationData={errorLottie}
            loop={true}
            autoplay={true}
          />
        </div>
        <p className="empty-page__text">
          Cần nạp VND để code tiếp
        </p>
        <Link href="/" className="empty-page__back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}

