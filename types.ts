
export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  MAINTENANCE = 'Maintenance'
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  PENDING = 'Pending'
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  checkInDate: string;
  identityNumber: string;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  status: RoomStatus;
  currentTenantId?: string;
  features: string[];
  contractEndDate?: string; // ISO Date string
}

export interface Payment {
  id: string;
  roomId: string;
  tenantId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  period: string; // e.g., "October 2023"
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRevenue: number;
  unpaidCount: number;
}
