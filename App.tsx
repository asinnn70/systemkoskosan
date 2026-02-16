
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RoomList from './components/RoomList';
import TenantList from './components/TenantList';
import AIAssistant from './components/AIAssistant';
import { INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_PAYMENTS } from './constants';
import { Room, Tenant, Payment, PaymentStatus } from './types';
import { Search, Bell, User as UserIcon, Filter } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [payments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [roomFilter, setRoomFilter] = useState<{status?: string, expiring?: boolean}>({});
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  const handleNavigateToRooms = (filter: {status?: string, expiring?: boolean}) => {
    setRoomFilter(filter);
    setActiveTab('rooms');
  };

  const filteredPayments = useMemo(() => {
    if (paymentFilter === 'All') return payments;
    return payments.filter(p => p.status === paymentFilter);
  }, [payments, paymentFilter]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          rooms={rooms} 
          payments={payments} 
          onNavigateRooms={handleNavigateToRooms}
          onNavigatePayments={() => setActiveTab('payments')}
        />;
      case 'rooms':
        return <RoomList 
          rooms={rooms} 
          initialFilter={roomFilter} 
        />;
      case 'tenants':
        return <TenantList tenants={tenants} rooms={rooms} />;
      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Riwayat Pembayaran</h2>
              <div className="flex gap-2">
                <select 
                  className="text-sm border-slate-200 rounded-lg px-3 py-2 focus:ring-indigo-500"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="All">Semua Status</option>
                  {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">No. Kamar</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Periode</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Jumlah</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayments.map(p => {
                    const room = rooms.find(r => r.id === p.roomId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-medium text-slate-800">Kamar {room?.number}</td>
                        <td className="px-6 py-4 text-slate-600">{p.period}</td>
                        <td className="px-6 py-4 font-bold">Rp {p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Tidak ada data pembayaran.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'ai-assistant':
        return <AIAssistant rooms={rooms} tenants={tenants} payments={payments} />;
      default:
        return <Dashboard rooms={rooms} payments={payments} onNavigateRooms={handleNavigateToRooms} onNavigatePayments={() => setActiveTab('payments')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kamar, penyewa, atau transaksi..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">Owner Kos</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-105 cursor-pointer">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
