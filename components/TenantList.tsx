
import React, { useState, useMemo } from 'react';
import { Tenant, Room } from '../types';
import { Search, MoreVertical, Mail, Phone, Calendar, X, User, ShieldCheck, MapPin, History, Bed } from 'lucide-react';

interface TenantListProps {
  tenants: Tenant[];
  rooms: Room[];
}

const TenantList: React.FC<TenantListProps> = ({ tenants, rooms }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const getTenantRoom = (tenantId: string) => {
    return rooms.find(r => r.currentTenantId === tenantId);
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const room = getTenantRoom(t.id);
      const roomNumber = room?.number || '';
      
      return (
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.identityNumber.includes(searchQuery) ||
        roomNumber.includes(searchQuery)
      );
    });
  }, [tenants, rooms, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Penyewa Aktif</h2>
          <p className="text-slate-500">Mengelola basis data {tenants.length} penghuni kost.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama, nomor ID, atau nomor kamar..."
            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-80 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil Penyewa</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No. Kamar</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Kontak</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tgl Check-in</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTenants.map(tenant => {
              const room = getTenantRoom(tenant.id);
              return (
                <tr 
                  key={tenant.id} 
                  className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{tenant.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">NIK: {tenant.identityNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {room ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-slate-800 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                          {room.number}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{room.type}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-300 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Mail size={12} className="text-indigo-400" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Phone size={12} className="text-emerald-400" />
                        {tenant.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase">
                      <Calendar size={12} />
                      {new Date(tenant.checkInDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-300 hover:text-indigo-600 border border-transparent hover:border-slate-100">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                  <div className="mb-2">Tidak ada penyewa yang sesuai pencarian.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedTenant(null)}
        >
          <div 
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-in-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[24px] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100">
                    {selectedTenant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedTenant.name}</h3>
                    <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-1">Status: Aktif Menghuni</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTenant(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Informasi Hunian</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Bed size={14} className="text-indigo-600" />
                        <p className="text-[10px] uppercase font-black text-indigo-600">No. Kamar</p>
                      </div>
                      <p className="text-xl font-black text-indigo-900">
                        {getTenantRoom(selectedTenant.id)?.number || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">NIK / ID</p>
                      <p className="text-sm font-black text-slate-800">{selectedTenant.identityNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Kontak & Keamanan</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">WhatsApp / Telepon</p>
                        <p className="font-black text-slate-800">{selectedTenant.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Email Terdaftar</p>
                        <p className="font-black text-slate-800">{selectedTenant.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-[20px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95">
                  <ShieldCheck size={18} /> Verifikasi NIK
                </button>
                <button className="flex-1 bg-slate-900 text-white font-black py-4 rounded-[20px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95">
                  <History size={18} /> Riwayat Sewa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantList;
