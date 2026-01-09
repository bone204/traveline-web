export enum RentalBillStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface GuestBillResponse {
  billId: number;
  code: string;
  status: RentalBillStatus;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  licensePlate?: string;
  vehicleName?: string;
  location?: string;
}

export interface SubmitEvidenceRequest {
  token: string;
  files: File[];
  latitude: number;
  longitude: number;
}
