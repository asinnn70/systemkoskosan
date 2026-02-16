
import React from 'react';
import { Room, Payment, RoomStatus, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, CheckCircle, AlertCircle, Clock, ChevronRight, CreditCard } from 'lucide-react';

interface DashboardProps {
  rooms: Room[];
  payments: Payment[];
  onNavigateRooms: (filter: {status?: string, expiring?: boolean}) => void;
  onNavigatePayments: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ rooms, payments, onNavigateRooms, onNavigatePayments }) => {
  const occupiedCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const availableCount = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  const maintenanceCount = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;
  
  const totalRevenue = payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === PaymentStatus.UNPAID).length;

  const now = new Date();
  const expiringSoon = rooms
    .filter(r => r.status === RoomStatus.OCCUPIED && r.contractEndDate)
    .map(r => ({
      ...r,
      daysLeft: Math.ceil((new Date(r.contractEndDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .filter(r => r.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Get 5 most recent transactions
  const recentTransactions = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const roomData = [
    { name: 'Occupied', value: occupiedCount, color: '#4f46e5' },
    { name: 'Available', value: availableCount, color: '#10b981' },
    { name: 'Maintenance', value: maintenanceCount, color: '#f59e0b' },
  ];

  const revenueData = [
    { month: 'Aug', amount: 4500000 },
    { month: 'Sep', amount: 5200000 },
    { month: 'Oct', amount: totalRevenue },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500">Statistik real-time dari 500 unit kamar Anda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          icon={<TrendingUp className="text-indigo-600" />}
          trend="Klik untuk detail riwayat"
          bgColor="bg-indigo-50"
          onClick={onNavigatePayments}
        />
        <StatCard 
          title="Kamar Terisi" 
          value={`${occupiedCount}/${rooms.length}`} 
          icon={<Users className="text-emerald-600" />}
          trend={`${Math.round((occupiedCount/rooms.length)*100)}% Okupansi`}
          bgColor="bg-emerald-50"
          onClick={() => onNavigateRooms({ status: RoomStatus.OCCUPIED })}
        />
        <StatCard 
          title="Masa Sewa Berakhir" 
          value={expiringSoon.length.toString()} 
          icon={<Clock className="text-amber-600" />}
          trend="Perlu tindak lanjut"
          bgColor="bg-amber-50"
          onClick={() => onNavigateRooms({ expiring: true })}
        />
        <StatCard 
          title="Belum Bayar" 
          value={pendingPayments.toString()} 
          icon={<AlertCircle className="text-rose-600" />}
          trend="Cek tagihan tertunda"
          bgColor="bg-rose-50"
          onClick={onNavigatePayments}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expiring Soon Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Mendekati Habis Sewa</h3>
                <button 
                  onClick={() => onNavigateRooms({ expiring: true })}
                  className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1 group"
                >
                  Lihat Semua <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="space-y-3">
                {expiringSoon.slice(0, 5).map(room => (
                  <div 
                    key={room.id} 
                    onClick={() => onNavigateRooms({ expiring: true })}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-10 rounded-full ${room.daysLeft < 7 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Kamar {room.number}</p>
                        <p className="text-xs text-slate-500">{room.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${room.daysLeft < 7 ? 'text-rose-600' : 'text-amber-600'}`}>
                        {room.daysLeft <= 0 ? 'Sudah Habis' : `${room.daysLeft} Hari Lagi`}
                      </p>
                    </div>
                  </div>
                ))}
                {expiringSoon.length === 0 && (
                  <div className="py-8 text-center text-slate-400">
                    Tidak ada kamar yang akan habis sewa.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Transaksi Terakhir</h3>
                <button 
                  onClick={onNavigatePayments}
                  className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1 group"
                >
                  Lihat Semua <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="space-y-3">
                {recentTransactions.map(payment => {
                  const room = rooms.find(r => r.id === payment.roomId);
                  return (
                    <div 
                      key={payment.id} 
                      onClick={onNavigatePayments}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Kamar {room?.number}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{payment.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-800 text-sm">Rp {(payment.amount / 1000).toLocaleString()}K</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          payment.status === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 
                          payment.status === PaymentStatus.UNPAID ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {recentTransactions.length === 0 && (
                  <div className="py-8 text-center text-slate-400">
                    Belum ada transaksi terbaru.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Tren Pendapatan</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Status Kamar</h3>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {roomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-black text-slate-800">{rooms.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Unit</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {roomData.map(d => (
                <div 
                  key={d.name} 
                  className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onNavigateRooms({ status: d.name as RoomStatus })}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  bgColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, bgColor, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100 cursor-pointer group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{value}</h4>
        <p className="text-[10px] mt-2 text-slate-400 font-semibold">{trend}</p>
      </div>
      <div className={`p-3 rounded-xl transition-transform group-hover:rotate-6 ${bgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;
