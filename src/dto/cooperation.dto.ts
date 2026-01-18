export enum CooperationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  STOPPED = "STOPPED",
}

export enum CommissionType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
}

export interface RegisterCooperationDto {
  // Section 1: Basic
  name: string;
  type: string;
  address?: string;
  provinceId?: string;
  districtId?: string;
  wardCode?: string;
  introduction?: string;
  brandLogo?: string;
  representativeName?: string;
  representativePhone?: string;
  representativeEmail?: string;

  // Section 2: Legal & Payment
  businessLicense?: string;
  representativeIdCard?: string;
  taxId?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  paymentQr?: string;

  // Section 3: Service
  serviceData?: any;
  apiBaseUrl?: string;
  apiKey?: string;
  apiEndpointCheck?: string;

  // Section 4: Terms
  acceptedTerms?: boolean;

  // Aliases
  bossName?: string;
  bossPhone?: string;
  bossEmail?: string;
}

export interface Cooperation {
  id: number;
  name: string;
  type: string;
  code?: string;
  status: CooperationStatus;
  commissionType?: CommissionType;
  commissionValue?: string;
  taxId?: string;
  representativeName?: string;
  representativePhone?: string;
  representativeEmail?: string;
  currentContractUrl?: string;
  createdAt: string;
  brandLogo?: string;
  businessLicense?: string;
  representativeIdCard?: string;
  paymentQr?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
}
