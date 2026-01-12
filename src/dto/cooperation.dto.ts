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
  name: string;
  type: string;
  bossName?: string;
  bossPhone?: string;
  bossEmail?: string;
  address?: string;
  district?: string;
  city?: string;
  province?: string;
  introduction?: string;
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
}
