"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, ProgressBar, Spinner, Alert } from "react-bootstrap";
import { useRegisterMutation } from "@/api/cooperations.api";
import { administrativeApi, AdminUnit } from "@/api/administrative.api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { RegisterCooperationDto } from "@/dto/cooperation.dto";

export default function PartnerRegistrationPage() {
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterCooperationDto>({
    name: "",
    type: "hotel",
    representativeName: "",
    representativePhone: "",
    representativeEmail: "",
    address: "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    introduction: "",
    brandLogo: "",
    businessLicense: "",
    representativeIdCard: "",
    taxId: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
    paymentQr: "",
    serviceData: {},
    apiBaseUrl: "",
    apiKey: "",
    apiEndpointCheck: "",
    acceptedTerms: false,
  });

  const [provinces, setProvinces] = useState<AdminUnit[]>([]);
  const [districts, setDistricts] = useState<AdminUnit[]>([]);
  const [wards, setWards] = useState<AdminUnit[]>([]);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    administrativeApi.getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (formData.provinceId) {
      administrativeApi.getDistricts(formData.provinceId).then(setDistricts);
      setWards([]);
      setFormData(prev => ({ ...prev, districtId: "", wardCode: "" }));
    }
  }, [formData.provinceId]);

  useEffect(() => {
    if (formData.districtId) {
      administrativeApi.getWards(formData.districtId).then(setWards);
      setFormData(prev => ({ ...prev, wardCode: "" }));
    }
  }, [formData.districtId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [field]: true }));
    try {
      const res = await administrativeApi.uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: res.url }));
      toast.success("Tải lên thành công!");
    } catch (error) {
      toast.error("Tải lên thất bại!");
    } finally {
      setIsUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.type || !formData.representativeName) {
        toast.error("Vui lòng điền các trường bắt buộc");
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      toast.error("Bạn phải đồng ý với điều khoản hợp tác.");
      return;
    }
    try {
      await register(formData).unwrap();
      toast.success("Đăng ký thành công! Vui lòng chờ Admin phê duyệt.");
      router.push("/");
    } catch (error: any) {
      toast.error(error?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  const getCommissionRate = () => {
    switch(formData.type) {
      case 'hotel': return "7%";
      case 'transportation': case 'bus': case 'train': case 'flight': case 'tour': return "5%";
      case 'delivery': return "3%";
      case 'restaurant': return "0.5%";
      default: return "5%";
    }
  };

  const renderSection1 = () => (
    <div className="section-1 animate__animated animate__fadeIn">
      <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-info-circle me-2"></i>SECTION 1 – Thông tin cơ bản</h5>
      <Row>
        <Col md={12} className="mb-3">
          <Form.Group>
            <Form.Label className="small fw-bold">Tên đơn vị / Thương hiệu *</Form.Label>
            <Form.Control required name="name" value={formData.name} onChange={handleChange} placeholder="VD: Khách sạn Sài Gòn Xanh" />
          </Form.Group>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label className="small fw-bold">Loại hình kinh doanh *</Form.Label>
            <Form.Select name="type" value={formData.type} onChange={handleChange}>
              <option value="hotel">Khách sạn / Lưu trú</option>
              <option value="restaurant">Nhà hàng / Ẩm thực</option>
              <option value="transportation">Vận chuyển / Xe khách</option>
              <option value="tour">Tour du lịch</option>
              <option value="delivery">Chuyển phát nhanh</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="mb-4">
          <Form.Group>
            <Form.Label className="small fw-bold">Logo đại diện thương hiệu</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control type="file" onChange={(e: any) => handleFileUpload(e, 'brandLogo')} className="me-2" />
              {isUploading['brandLogo'] && <Spinner animation="border" size="sm" variant="primary" />}
              {formData.brandLogo && <i className="bi bi-check-circle-fill text-success ms-2"></i>}
            </div>
          </Form.Group>
        </Col>
        <Col md={12} className="mb-4">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Người đại diện</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Họ và tên *</Form.Label>
                <Form.Control required name="representativeName" value={formData.representativeName} onChange={handleChange} placeholder="Nguyễn Văn A" />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Số điện thoại *</Form.Label>
                <Form.Control required name="representativePhone" value={formData.representativePhone} onChange={handleChange} placeholder="090..." />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Email *</Form.Label>
                <Form.Control required type="email" name="representativeEmail" value={formData.representativeEmail} onChange={handleChange} placeholder="email@..." />
              </Form.Group>
            </Col>
          </Row>
        </Col>
        <Col md={12} className="mb-3">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Địa chỉ trụ sở</h6>
          <Row>
            <Col md={4} className="mb-3">
              <Form.Label className="small fw-bold">Tỉnh/Thành *</Form.Label>
              <Form.Select required name="provinceId" value={formData.provinceId} onChange={handleChange}>
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label className="small fw-bold">Quận/Huyện *</Form.Label>
              <Form.Select required name="districtId" value={formData.districtId} onChange={handleChange} disabled={!formData.provinceId}>
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label className="small fw-bold">Phường/Xã *</Form.Label>
              <Form.Select required name="wardCode" value={formData.wardCode} onChange={handleChange} disabled={!formData.districtId}>
                <option value="">Chọn Phường/Xã</option>
                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold">Địa chỉ chi tiết</Form.Label>
                <Form.Control name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, tên đường..." />
              </Form.Group>
            </Col>
          </Row>
        </Col>
        <Col md={12} className="mt-4">
          <Form.Group>
            <Form.Label className="small fw-bold">Giới thiệu ngắn về đơn vị</Form.Label>
            <Form.Control as="textarea" rows={3} name="introduction" value={formData.introduction} onChange={handleChange} placeholder="Giới thiệu về quy mô, thế mạnh..." />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  const renderSection2 = () => (
    <div className="section-2 animate__animated animate__fadeIn">
      <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-shield-check me-2"></i>SECTION 2 – Pháp lý & Thanh toán</h5>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label className="small fw-bold">Giấy phép kinh doanh (Ảnh/PDF)</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control type="file" onChange={(e: any) => handleFileUpload(e, 'businessLicense')} />
              {isUploading['businessLicense'] && <Spinner animation="border" size="sm" className="ms-2" />}
            </div>
          </Form.Group>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label className="small fw-bold">Mã số thuế</Form.Label>
            <Form.Control name="taxId" value={formData.taxId} onChange={handleChange} placeholder="MST đơn vị" />
          </Form.Group>
        </Col>
        <Col md={6} className="mb-4">
          <Form.Group>
            <Form.Label className="small fw-bold">CCCD người đại diện</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control type="file" onChange={(e: any) => handleFileUpload(e, 'representativeIdCard')} />
              {isUploading['representativeIdCard'] && <Spinner animation="border" size="sm" className="ms-2" />}
            </div>
          </Form.Group>
        </Col>
        <Col md={12} className="mb-4">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Thông tin nhận thanh toán</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label className="small fw-bold">Ngân hàng</Form.Label>
              <Form.Control name="bankName" value={formData.bankName} onChange={handleChange} placeholder="VD: Vietcombank" />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label className="small fw-bold">Số tài khoản</Form.Label>
              <Form.Control name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="001100..." />
            </Col>
            <Col md={12} className="mb-3">
              <Form.Label className="small fw-bold">Tên chủ tài khoản</Form.Label>
              <Form.Control name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} placeholder="NGUYEN VAN A" />
            </Col>
            <Col md={12}>
              <Form.Label className="small fw-bold">Mã QR thanh toán (nếu có)</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control type="file" onChange={(e: any) => handleFileUpload(e, 'paymentQr')} />
                {isUploading['paymentQr'] && <Spinner animation="border" size="sm" className="ms-2" />}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );

  const handleServiceDataChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      serviceData: { ...prev.serviceData, [key]: value }
    }));
  };

  const renderSection3 = () => (
    <div className="section-3 animate__animated animate__fadeIn">
      <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-box me-2"></i>SECTION 3 – Thông tin dịch vụ</h5>
      <Alert variant="info" className="mb-4">Thông tin chi tiết về loại hình <strong>{formData.type === 'hotel' ? 'Khách sạn' : formData.type === 'restaurant' ? 'Nhà hàng' : formData.type === 'transportation' ? 'Vận chuyển' : formData.type === 'tour' ? 'Tour du lịch' : 'Chuyển phát'}</strong></Alert>
      
      {formData.type === 'hotel' && (
        <Row>
          <Col md={12} className="mb-3">
            <Form.Label className="small fw-bold">Loại phòng cung cấp (Mô tả sơ bộ)</Form.Label>
            <Form.Control as="textarea" placeholder="Nêu danh sách các loại phòng và giá tham khảo..." onChange={(e) => handleServiceDataChange('roomListDescription', e.target.value)} />
          </Col>
          <Col md={12} className="mb-3">
            <h6 className="fw-bold mt-3">Tích hợp API (Nếu có hệ thống riêng)</h6>
            <Form.Group className="mb-2">
              <Form.Label className="small">Base URL</Form.Label>
              <Form.Control name="apiBaseUrl" value={formData.apiBaseUrl} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">API Key</Form.Label>
              <Form.Control name="apiKey" value={formData.apiKey} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>
      )}

      {formData.type === 'restaurant' && (
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label className="small fw-bold">Số lượng bàn</Form.Label>
            <Form.Control type="number" onChange={(e) => handleServiceDataChange('totalTables', e.target.value)} />
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label className="small fw-bold">Khung giờ hoạt động</Form.Label>
            <Form.Control placeholder="08:00 - 22:00" onChange={(e) => handleServiceDataChange('openingHours', e.target.value)} />
          </Col>
        </Row>
      )}

      {(formData.type === 'transportation' || formData.type === 'bus' || formData.type === 'train' || formData.type === 'flight') && (
        <Row>
          <Col md={12} className="mb-3">
            <Form.Label className="small fw-bold">Các tuyến phục vụ chính</Form.Label>
            <Form.Control placeholder="Điểm đi - Điểm đến" onChange={(e) => handleServiceDataChange('routes', e.target.value)} />
          </Col>
          <Col md={12}>
            <Form.Label className="small fw-bold">Giá vé và loại ghế tham khảo</Form.Label>
            <Form.Control as="textarea" onChange={(e) => handleServiceDataChange('pricingInfo', e.target.value)} />
          </Col>
        </Row>
      )}

      {formData.type === 'tour' && (
        <Row>
          <Col md={12} className="mb-3">
            <Form.Label className="small fw-bold">Danh sách Tour tiêu biểu</Form.Label>
            <Form.Control as="textarea" placeholder="Tên tour - Thời gian - Giá" onChange={(e) => handleServiceDataChange('typicalTours', e.target.value)} />
          </Col>
        </Row>
      )}

      {formData.type === 'delivery' && (
        <Row>
          <Col md={12} className="mb-3">
            <Form.Label className="small fw-bold">Khu vực phục vụ (Tỉnh/Thành)</Form.Label>
            <Form.Control placeholder="Nêu rõ các phạm vi hoạt động..." onChange={(e) => handleServiceDataChange('coverageArea', e.target.value)} />
          </Col>
        </Row>
      )}
    </div>
  );

  const renderSection4 = () => (
    <div className="section-4 animate__animated animate__fadeIn">
      <h5 className="fw-bold mb-4 text-primary"><i className="bi bi-file-earmark-text me-2"></i>SECTION 4 – Điều khoản & Hoa hồng</h5>
      <Card className="bg-light border-0 mb-4">
        <Card.Body>
          <h6 className="fw-bold text-dark">Chính sách hoa hồng của hệ thống</h6>
          <p className="mb-0">Dựa trên loại hình <strong>{formData.type}</strong>, mức hoa hồng hệ thống áp dụng cho mỗi giao dịch thành công là: <span className="badge bg-warning text-dark fs-6">{getCommissionRate()}</span></p>
          <small className="text-muted mt-2 d-block">* Lưu ý: Mức hoa hồng này có thể được điều chỉnh lại sau khi Admin xem xét hồ sơ và thương thảo hợp đồng.</small>
        </Card.Body>
      </Card>
      
      <div className="terms-container p-3 border mb-4 rounded bg-white" style={{ height: "200px", overflowY: "scroll", fontSize: "0.9rem" }}>
        <p className="fw-bold">ĐIỀU KHOẢN HỢP TÁC KINH DOANH</p>
        <p>1. Định nghĩa: Đối tác là đơn vị cung cấp dịch vụ trực tiếp cho người dùng cuối trên nền tảng Traveline...</p>
        <p>2. Trách nhiệm: Đối tác cam kết cung cấp dịch vụ đúng chất lượng, hình ảnh và giá cả đã công khai...</p>
        <p>3. Thanh toán: Traveline sẽ đóng vai trò trung gian thanh toán và thực hiện đối soát, chi trả cho đối tác định kỳ...</p>
        <p>4. Bảo mật: Hai bên cam kết bảo mật thông tin kinh doanh và dữ liệu người dùng của nhau...</p>
        <p>5. Chấm dứt: Hợp đồng có thể bị chấm dứt nếu một trong hai bên vi phạm nghiêm trọng các điều khoản...</p>
      </div>

      <Form.Group className="mb-4">
        <Form.Check 
          type="checkbox"
          id="acceptedTerms"
          name="acceptedTerms"
          checked={formData.acceptedTerms}
          onChange={handleChange}
          label={<span className="fw-bold text-dark">Tôi đồng ý với điều khoản hợp tác và mức hoa hồng của hệ thống *</span>}
        />
      </Form.Group>
    </div>
  );

  return (
    <div className="partner-registration-page py-5" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", minHeight: "100vh", marginTop: "80px" }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: "24px", overflow: "hidden" }}>
              <Card.Body className="p-0">
                <Row className="g-0">
                  <Col md={4} className="bg-primary p-4 p-md-5 text-white d-none d-md-flex flex-column justify-content-between" style={{ background: "linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)" }}>
                    <div>
                      <h2 className="fw-bold mb-4">Gia nhập Traveline Partner</h2>
                      <p className="opacity-75">Hợp tác cùng chúng tôi để tiếp cận hàng triệu khách du lịch và tối ưu doanh thu dịch vụ của bạn.</p>
                    </div>
                    
                    <div className="stepper-vertical mt-5">
                      {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`step-item d-flex align-items-center mb-4 ${step >= s ? 'active' : ''}`}>
                          <div className={`step-number me-3 ${step === s ? 'pulse' : ''}`} style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= s ? "#fff" : "rgba(255,255,255,0.2)", color: step >= s ? "#0ea5e9" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{s}</div>
                          <span className={`small fw-bold ${step >= s ? 'text-white' : 'text-white-50'}`}>
                            {s === 1 ? 'Thông tin cơ bản' : s === 2 ? 'Pháp lý & Thanh toán' : s === 3 ? 'Thông tin dịch vụ' : 'Điều khoản & Gửi'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Col>
                  
                  <Col md={8} className="p-4 p-md-5 bg-white">
                    <div className="d-md-none mb-4">
                      <ProgressBar now={(step / 4) * 100} variant="primary" style={{ height: "8px" }} />
                      <div className="text-center mt-2 small fw-bold text-primary">Bước {step} của 4</div>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      {step === 1 && renderSection1()}
                      {step === 2 && renderSection2()}
                      {step === 3 && renderSection3()}
                      {step === 4 && renderSection4()}

                      <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                        <Button 
                          variant="outline-secondary" 
                          onClick={prevStep} 
                          disabled={step === 1 || isRegistering}
                          className="px-4 py-2"
                          style={{ borderRadius: "10px" }}
                        >
                          Quay lại
                        </Button>
                        
                        {step < 4 ? (
                          <Button 
                            variant="primary" 
                            onClick={nextStep}
                            className="px-4 py-2 bg-gradient"
                            style={{ borderRadius: "10px", fontWeight: "600" }}
                          >
                            Tiếp tục <i className="bi bi-arrow-right ms-2"></i>
                          </Button>
                        ) : (
                          <Button 
                            type="submit" 
                            disabled={isRegistering || !formData.acceptedTerms}
                            variant="success"
                            className="px-5 py-2"
                            style={{ borderRadius: "10px", fontWeight: "bold" }}
                          >
                            {isRegistering ? <><Spinner animation="border" size="sm" className="me-2" /> Đang gửi...</> : "Gửi hồ sơ đăng ký"}
                          </Button>
                        )}
                      </div>
                    </Form>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <p className="text-center text-muted mt-4 small">
              <i className="bi bi-shield-lock me-1"></i> Thông tin của bạn được cam kết bảo mật theo tiêu chuẩn quốc tế.
            </p>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .pulse {
          animation: shadow-pulse 2s infinite;
        }
        @keyframes shadow-pulse {
          0% { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.4); }
          100% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
        }
        .bg-gradient {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        }
        .step-item.active .step-number {
          box-shadow: 0 0 15px rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}
