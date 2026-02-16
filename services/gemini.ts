import { GoogleGenAI } from "@google/genai";
import { Room, Tenant, Payment, RoomStatus } from "../types";

// Standard initialization as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Summarizes the current state of the kos-kosan for AI context
 */
const prepareContextSummary = (rooms: Room[], tenants: Tenant[], payments: Payment[]) => {
  const total = rooms.length;
  const occupied = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const available = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  
  const now = new Date();
  const expiringCount = rooms.filter(r => 
    r.status === RoomStatus.OCCUPIED && 
    r.contractEndDate && 
    Math.ceil((new Date(r.contractEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 30
  ).length;

  const typeDistribution = rooms.reduce((acc: any, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: { 
      total, 
      occupied, 
      available, 
      expiringSoon: expiringCount,
      occupancyRate: `${Math.round((occupied / total) * 100)}%`
    },
    typeDistribution,
    tenantCount: tenants.length,
    recentPaymentCount: payments.length
  };
};

/**
 * Gets automated management insights based on current data
 */
export const getManagementInsights = async (rooms: Room[], tenants: Tenant[], payments: Payment[]) => {
  const context = prepareContextSummary(rooms, tenants, payments);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Anda adalah Manajer Operasional AI untuk KosManager Pro. 
        Analisis ringkasan data berikut: ${JSON.stringify(context)}
        
        Berikan 3-4 poin insight profesional untuk pemilik kos:
        1. Evaluasi tingkat hunian saat ini.
        2. Strategi untuk menangani ${context.summary.expiringSoon} kamar yang akan habis sewa dalam 30 hari.
        3. Rekomendasi peningkatan layanan atau harga berdasarkan distribusi tipe kamar.
        
        Gunakan Bahasa Indonesia yang profesional dan berikan solusi praktis.
      `
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Maaf, gagal memuat analisis cerdas saat ini.";
  }
};

/**
 * Handles chat interactions with the user
 */
export const chatWithAI = async (message: string, data: {rooms: Room[], tenants: Tenant[], payments: Payment[]}) => {
  const context = prepareContextSummary(data.rooms, data.tenants, data.payments);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Anda adalah asisten pintar "KosManager AI". Tugas Anda membantu pemilik kos mengelola bisnisnya.
        Ringkasan Properti Saat Ini: ${JSON.stringify(context)}
        Pesan Pengguna: ${message}
        
        Jawablah dengan singkat, padat, dan membantu. Jika ditanya tentang penagihan, buatkan draf pesan WhatsApp yang sopan namun tegas.
      `
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Koneksi ke asisten AI terganggu. Silakan coba beberapa saat lagi.";
  }
};