
import { Room, RoomStatus, Tenant, Payment, PaymentStatus } from './types';

// Helper to generate 500 rooms
const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  const types = [
    { name: 'Standard', price: 1200000, features: ['Fan', 'Wifi', 'Shared Bathroom'] },
    { name: 'Deluxe', price: 1800000, features: ['AC', 'Wifi', 'Private Bathroom'] },
    { name: 'Executive', price: 2800000, features: ['AC', 'Wifi', 'Water Heater', 'Smart TV'] },
    { name: 'Suite', price: 4500000, features: ['AC', 'Wifi', 'Water Heater', 'Kitchenette', 'Balcony'] }
  ];

  const now = new Date();

  for (let i = 1; i <= 500; i++) {
    const floor = Math.floor((i - 1) / 50) + 1;
    const roomNumber = `${floor}${((i - 1) % 50 + 1).toString().padStart(2, '0')}`;
    const typeIdx = i % 4;
    const type = types[typeIdx];
    
    const rand = Math.random();
    let status = RoomStatus.AVAILABLE;
    if (rand > 0.4) status = RoomStatus.OCCUPIED;
    if (rand > 0.95) status = RoomStatus.MAINTENANCE;

    let contractEndDate: string | undefined = undefined;
    if (status === RoomStatus.OCCUPIED) {
      // Randomize expiry date between -10 days (overdue) and +60 days
      const daysOffset = Math.floor(Math.random() * 70) - 10;
      const expiry = new Date();
      expiry.setDate(now.getDate() + daysOffset);
      contractEndDate = expiry.toISOString();
    }

    rooms.push({
      id: i.toString(),
      number: roomNumber,
      type: type.name,
      price: type.price,
      status: status,
      features: type.features,
      currentTenantId: status === RoomStatus.OCCUPIED ? `t-${i}` : undefined,
      contractEndDate
    });
  }
  return rooms;
};

export const INITIAL_ROOMS: Room[] = generateRooms();

export const INITIAL_TENANTS: Tenant[] = [
  { id: 't-1', name: 'Budi Santoso', phone: '08123456789', email: 'budi@example.com', checkInDate: '2023-01-15', identityNumber: '3201234567890001' },
  { id: 't-5', name: 'Ani Wijaya', phone: '08198765432', email: 'ani@example.com', checkInDate: '2023-05-20', identityNumber: '3209876543210002' },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'p1', roomId: '1', tenantId: 't-1', amount: 1200000, date: '2023-10-01', status: PaymentStatus.PAID, period: 'October 2023' },
  { id: 'p3', roomId: '1', tenantId: 't-1', amount: 1200000, date: '2023-11-01', status: PaymentStatus.UNPAID, period: 'November 2023' },
];
