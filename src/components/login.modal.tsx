"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login:", formData);
      onClose();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal" onClick={onClose}>
      <div className="login-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose} aria-label="Đóng">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="login-modal__background">
          <div className="login-modal__bg-shape login-modal__bg-shape--1"></div>
          <div className="login-modal__bg-shape login-modal__bg-shape--2"></div>
          <div className="login-modal__bg-shape login-modal__bg-shape--3"></div>
        </div>

        <div className="login-modal__card">
          <div className="login-modal__header">
            <div className="login-modal__logo">
              <span className="login-modal__logo-icon">✈</span>
              <span className="login-modal__logo-text">Bone Travel</span>
            </div>
            <h2 className="login-modal__title">Đăng nhập</h2>
            <p className="login-modal__subtitle">Chào mừng bạn trở lại!</p>
          </div>

          <form className="login-modal__form" onSubmit={handleSubmit}>
            <div className="login-modal__form-group">
              <label htmlFor="modal-email" className="login-modal__label">
                Email hoặc số điện thoại
              </label>
              <input
                type="text"
                id="modal-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="login-modal__input"
                placeholder="Nhập email hoặc số điện thoại"
                required
              />
            </div>

            <div className="login-modal__form-group">
              <label htmlFor="modal-password" className="login-modal__label">
                Mật khẩu
              </label>
              <input
                type="password"
                id="modal-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-modal__input"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className="login-modal__options">
              <label className="login-modal__checkbox">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/empty-page" className="login-modal__forgot" onClick={onClose}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="login-modal__submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="login-modal__divider">
              <span>Hoặc</span>
            </div>

            <div className="login-modal__social">
              <button type="button" className="login-modal__social-btn login-modal__social-btn--google">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </button>
              <button type="button" className="login-modal__social-btn login-modal__social-btn--facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Đăng nhập với Facebook</span>
              </button>
            </div>

            <p className="login-modal__signup">
              Chưa có tài khoản?{" "}
              <Link href="/empty-page" className="login-modal__signup-link" onClick={onClose}>
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

