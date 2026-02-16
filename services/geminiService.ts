
import { GoogleGenAI } from "@google/genai";
import { Room, Tenant, Payment, RoomStatus } from "../types";

// Fixed: Correct initialization with exact named parameter for API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const summarizeData = (rooms: Room[], tenants: Tenant[], payments: Payment[]) => {
  const total = rooms.length;
  const occupied = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const available = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  const maintenance = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;
  
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

  const floorStats = rooms.reduce((acc: any, r) => {
    const floor = r.number.charAt(0);
    acc[floor] = acc[floor] || { total: 0, occupied: 0 };
    acc[floor].total++;
    if (r.status === RoomStatus.OCCUPIED) acc[floor].occupied++;
    return acc;
  }, {});

  return {
    summary: { total, occupied, available, maintenance, expiringSoon: expiringCount },
    typeDistribution,
    floorStats,
    tenantCount: tenants.length,
    recentPaymentCount: payments.length
  };
};

export const getManagementInsights = async (rooms: Room[], tenants: Tenant[], payments: Payment[]) => {
  const summary = summarizeData(rooms, tenants, payments);
  
  // Fixed: Direct usage of generateContent as per documentation guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Analyze this boarding house summary (500 rooms total) and provide 3-4 professional insights for the owner.
      Data Summary: ${JSON.stringify(summary)}
      
      Focus on scaling advice, maintenance scheduling, and specifically how to handle the ${summary.summary.expiringSoon} rooms whose contracts end in 30 days. 
      Suggest retention strategies or marketing tips to avoid vacancy.
      Use bullet points and a supportive, expert tone.
    `
  });

  return response.text;
};

export const chatWithAI = async (message: string, context: any) => {
  const summary = summarizeData(context.rooms, context.tenants, context.payments);
  
  // Fixed: Direct usage of generateContent as per documentation guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      You are an AI Manager for a large-scale "Kos-kosan" with 500 rooms.
      Current properties summary: ${JSON.stringify(summary)}
      User Message: ${message}
      
      Help the owner manage this large scale operation. Be concise and professional. 
      If asked about expiring rooms, refer to the ${summary.summary.expiringSoon} rooms ending within 30 days.
    `
  });
  return response.text;
};
