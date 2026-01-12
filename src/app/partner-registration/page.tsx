"use client";

import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useRegisterMutation } from "@/api/cooperations.api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { RegisterCooperationDto } from "@/dto/cooperation.dto";

export default function PartnerRegistrationPage() {
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterCooperationDto>({
    name: "",
    type: "hotel",
    bossName: "",
    bossPhone: "",
    bossEmail: "",
    address: "",
    district: "",
    city: "",
    province: "",
    introduction: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      toast.success("Đăng ký thành công! Vui lòng chờ Admin phê duyệt.");
      router.push("/");
    } catch (error: any) {
      toast.error(error?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="partner-registration-page py-5" style={{ background: "#f8fafc", minHeight: "100vh", marginTop: "80px" }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <h1 className="fw-bold mb-2" style={{ color: "#0f172a" }}>Đăng ký đối tác</h1>
                  <p className="text-muted">Hợp tác cùng Traveline để phát triển kinh doanh bền vững</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12} className="mb-4">
                      <h5 className="fw-bold mb-3" style={{ color: "#0ea5e9" }}>Thông tin cơ bản</h5>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Tên đơn vị / Thương hiệu *</Form.Label>
                        <Form.Control
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="VD: Khách sạn Sài Gòn Xanh"
                          className="py-2 px-3"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Loại hình kinh doanh *</Form.Label>
                        <Form.Select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="py-2 px-3"
                        >
                          <option value="hotel">Khách sạn / Lưu trú</option>
                          <option value="restaurant">Nhà hàng / Ẩm thực</option>
                          <option value="transportation">Vận chuyển / Xe khách</option>
                          <option value="tour">Tour du lịch</option>
                          <option value="delivery">Giao hàng / Chuyển phát</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-4">
                      <h5 className="fw-bold mb-3" style={{ color: "#0ea5e9" }}>Người đại diện</h5>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase">Họ và tên</Form.Label>
                            <Form.Control
                              name="bossName"
                              value={formData.bossName}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A"
                              className="py-2 px-3"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase">Số điện thoại</Form.Label>
                            <Form.Control
                              name="bossPhone"
                              value={formData.bossPhone}
                              onChange={handleChange}
                              placeholder="0901234567"
                              className="py-2 px-3"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="bossEmail"
                          value={formData.bossEmail}
                          onChange={handleChange}
                          placeholder="email@partner.com"
                          className="py-2 px-3"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-4">
                      <h5 className="fw-bold mb-3" style={{ color: "#0ea5e9" }}>Địa chỉ & Giới thiệu</h5>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Địa chỉ chi tiết</Form.Label>
                        <Form.Control
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Số 123, đường ABC..."
                          className="py-2 px-3"
                        />
                      </Form.Group>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase">Tỉnh / Thành</Form.Label>
                            <Form.Control
                              name="province"
                              value={formData.province}
                              onChange={handleChange}
                              placeholder="Hà Nội / HCM..."
                              className="py-2 px-3"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase">Thành phố / Huyện</Form.Label>
                            <Form.Control
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="py-2 px-3"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-uppercase">Quận / Xã</Form.Label>
                            <Form.Control
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              className="py-2 px-3"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-uppercase">Giới thiệu ngắn</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="introduction"
                          value={formData.introduction}
                          onChange={handleChange}
                          placeholder="Mô tả về đơn vị của bạn..."
                          className="py-2 px-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      style={{ 
                        background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
                        border: "none",
                        padding: "0.75rem",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "1.1rem"
                      }}
                    >
                      {isLoading ? "Đang gửi đăng ký..." : "Gửi hồ sơ đăng ký"}
                    </Button>
                    <p className="text-center small text-muted mt-2">
                      Bằng việc gửi hồ sơ, bạn đồng ý với các Điều khoản & Chính sách của Traveline.
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
