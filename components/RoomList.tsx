
import React, { useState, useMemo, useEffect } from 'react';
import { Room, RoomStatus } from '../types';
import { Plus, Info, Edit2, Filter, ChevronLeft, ChevronRight, X, Bed, ShieldCheck, MapPin, Zap, Clock, Phone, Mail, Search, Check } from 'lucide-react';

interface RoomListProps {
  rooms: Room[];
  initialFilter?: { status?: string, expiring?: boolean };
}

const RoomList: React.FC<RoomListProps> = ({ rooms, initialFilter }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter?.status || 'All');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showExpiringOnly, setShowExpiringOnly] = useState(initialFilter?.expiring || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const itemsPerPage = 12;
  const now = new Date();

  // Sync initial filter if it changes from props (e.g. navigation from dashboard)
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.status) setFilterStatus(initialFilter.status);
      if (initialFilter.expiring) setShowExpiringOnly(initialFilter.expiring);
      setCurrentPage(1);
    }
  }, [initialFilter]);

  const availableFeatures = [
    { label: 'AC', value: 'AC' },
    { label: 'Wifi', value: 'Wifi' },
    { label: 'KM Dalam', value: 'Private Bathroom' },
    { label: 'KM Luar', value: 'Shared Bathroom' },
    { label: 'Water Heater', value: 'Water Heater' },
    { label: 'Smart TV', value: 'Smart TV' },
    { label: 'Fan', value: 'Fan' },
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
    setCurrentPage(1);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchType = filterType === 'All' || room.type === filterType;
      const matchStatus = filterStatus === 'All' || room.status === filterStatus;
      const matchSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchFeatures = selectedFeatures.length === 0 || 
        selectedFeatures.every(sf => room.features.includes(sf));
      
      let matchExpiring = true;
      if (showExpiringOnly) {
        if (!room.contractEndDate || room.status !== RoomStatus.OCCUPIED) {
          matchExpiring = false;
        } else {
          const daysLeft = Math.ceil((new Date(room.contractEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          matchExpiring = daysLeft <= 30;
        }
      }

      return matchType && matchStatus && matchExpiring && matchSearch && matchFeatures;
    });
  }, [rooms, filterType, filterStatus, showExpiringOnly, searchQuery, selectedFeatures]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const types = ['All', 'Standard', 'Deluxe', 'Executive', 'Suite'];
  const statuses = ['All', ...Object.values(RoomStatus)];

  const handleContact = (platform: 'wa' | 'email') => {
    alert(`Membuka ${platform.toUpperCase()} untuk menghubungi penyewa Kamar ${selectedRoom?.number}...`);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Kamar</h2>
          <p className="text-slate-500">Mengelola {rooms.length} unit kamar dengan berbagai klasifikasi.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-95 shrink-0 font-bold">
          <Plus size={20} />
          Tambah Kamar Baru
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Cari nomor kamar..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
            />
          </div>
          <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 rounded-lg">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 font-medium cursor-pointer"
              value={filterType}
              onChange={(e) => {setFilterType(e.target.value); setCurrentPage(1);}}
            >
              {types.map(t => <option key={t} value={t}>{t === 'All' ? 'Semua Tipe' : t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 rounded-lg">
            <select 
              className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 font-medium cursor-pointer"
              value={filterStatus}
              onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Semua Status' : s}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
            <input 
              type="checkbox" 
              checked={showExpiringOnly} 
              onChange={(e) => {setShowExpiringOnly(e.target.checked); setCurrentPage(1);}}
              className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
              <Clock size={14} /> Akan Habis Sewa
            </span>
          </label>
        </div>

        {/* Fasilitas Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-white/50 p-2 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-slate-400 ml-2 mr-1 tracking-widest">Fasilitas:</span>
          {availableFeatures.map(f => (
            <button
              key={f.value}
              onClick={() => toggleFeature(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                selectedFeatures.includes(f.value)
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {selectedFeatures.includes(f.value) && <Check size={12} />}
              {f.label}
            </button>
          ))}
          {selectedFeatures.length > 0 && (
            <button 
              onClick={() => setSelectedFeatures([])}
              className="text-[10px] font-black text-rose-500 uppercase hover:underline ml-2"
            >
              Reset Fasilitas
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedRooms.map((room) => {
          const daysLeft = room.contractEndDate ? Math.ceil((new Date(room.contractEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
          const isExpiring = daysLeft !== null && daysLeft <= 30;

          return (
            <div 
              key={room.id} 
              onClick={() => setSelectedRoom(room)}
              className={`bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 group ${isExpiring ? 'border-amber-400 ring-1 ring-amber-400/20 shadow-amber-50' : 'border-slate-100'}`}
            >
              <div className="h-32 bg-slate-100 relative overflow-hidden rounded-t-2xl">
                 <img 
                   src={`https://picsum.photos/seed/room-${room.id}/400/300`} 
                   alt={`Room ${room.number}`} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                 />
                 <div className="absolute top-2 left-2 flex flex-col gap-1">
                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                     room.status === RoomStatus.AVAILABLE ? 'bg-emerald-500 text-white' :
                     room.status === RoomStatus.OCCUPIED ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'
                   }`}>
                     {room.status}
                   </span>
                   {isExpiring && (
                     <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                       <Clock size={10} /> {daysLeft <= 0 ? 'HABIS' : `${daysLeft} HARI`}
                     </span>
                   )}
                 </div>
                 <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-800 shadow-sm border border-slate-100 uppercase">
                   Lantai {Math.floor(parseInt(room.number)/100)}
                 </div>
              </div>
              <div className="p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Kamar {room.number}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{room.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">Rp {room.price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.features.slice(0, 2).map(f => {
                    let label = f;
                    if (f === 'Private Bathroom') label = 'KM Dalam';
                    if (f === 'Shared Bathroom') label = 'KM Luar';
                    return (
                      <span key={f} className="text-[9px] font-black uppercase bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                        {label}
                      </span>
                    );
                  })}
                  {room.features.length > 2 && <span className="text-[9px] font-black text-slate-300">+{room.features.length - 2}</span>}
                </div>

                <div className="mt-2 flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center justify-center gap-1">
                    <Info size={12} /> Detail Unit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h4 className="text-slate-800 font-bold">Kamar tidak ditemukan</h4>
            <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-6">
          <button 
            disabled={currentPage === 1}
            onClick={(e) => {e.stopPropagation(); setCurrentPage(prev => prev - 1)}}
            className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 text-slate-600 hover:bg-slate-50 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Halaman {currentPage} / {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={(e) => {e.stopPropagation(); setCurrentPage(prev => prev + 1)}}
            className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 text-slate-600 hover:bg-slate-50 active:scale-90 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedRoom(null)}
        >
          <div 
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] scale-in-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="md:w-5/12 relative">
              <img 
                src={`https://picsum.photos/seed/room-${selectedRoom.id}/600/800`} 
                className="w-full h-64 md:h-full object-cover"
                alt="Room detail"
              />
              <button 
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 md:hidden"
              >
                <X size={20} />
              </button>
            </div>
            <div className="md:w-7/12 p-8 overflow-y-auto bg-white">
              <div className="hidden md:flex justify-end mb-4">
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedRoom.status === RoomStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-700' :
                      selectedRoom.status === RoomStatus.OCCUPIED ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedRoom.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Klasifikasi Unit</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">Unit {selectedRoom.number}</h3>
                  <p className="text-indigo-600 font-black text-lg mt-1 uppercase tracking-tighter">{selectedRoom.type} Class</p>
                </div>

                {selectedRoom.contractEndDate && selectedRoom.status === RoomStatus.OCCUPIED && (
                  <div className="p-5 bg-amber-50 rounded-[24px] border border-amber-200 shadow-sm shadow-amber-100/50">
                    <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase mb-1">
                      <Clock size={16} /> Masa Sewa Berakhir
                    </div>
                    <p className="text-2xl font-black text-amber-800">
                      {new Date(selectedRoom.contractEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold uppercase mt-1 italic">
                      Sisa: {Math.ceil((new Date(selectedRoom.contractEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} Hari Lagi
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-[20px] border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Harga Sewa</p>
                    <p className="text-xl font-black text-slate-800">Rp {selectedRoom.price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold">per bulan / lunas</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-[20px] border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Lokasi Unit</p>
                    <div className="flex items-center gap-1 text-slate-800 font-black text-xl uppercase tracking-tighter">
                      <MapPin size={18} className="text-indigo-500" />
                      Lantai {Math.floor(parseInt(selectedRoom.number)/100)}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                    <Zap size={14} className="text-amber-500" /> Fasilitas Kamar
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedRoom.features.map(f => {
                      let label = f;
                      if (f === 'Private Bathroom') label = 'Kamar Mandi Dalam';
                      if (f === 'Shared Bathroom') label = 'Kamar Mandi Luar (Shared)';
                      return (
                        <div key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50/50 p-2 rounded-xl">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <ShieldCheck size={14} />
                          </div>
                          {label}
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50/50 p-2 rounded-xl">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Bed size={14} />
                      </div>
                      Spring Bed Premium Quality
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={() => handleContact('wa')}
                    className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-[20px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                  >
                    <Phone size={18} /> Hubungi Penyewa
                  </button>
                  <button className="px-5 bg-slate-100 text-slate-700 font-bold py-4 rounded-[20px] hover:bg-slate-200 transition-all active:scale-95">
                    <Edit2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
