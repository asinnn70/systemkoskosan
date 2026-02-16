
import React, { useState, useEffect, useRef } from 'react';
import { getManagementInsights, chatWithAI } from '../services/gemini';
import { Room, Tenant, Payment } from '../types';
import { Send, Sparkles, Loader2, Bot } from 'lucide-react';

interface AIAssistantProps {
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ rooms, tenants, payments }) => {
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const text = await getManagementInsights(rooms, tenants, payments);
      setInsights(text || 'Gagal memuat analisis.');
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [rooms, tenants, payments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    const userMsg = input;
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setSending(true);

    const response = await chatWithAI(userMsg, { rooms, tenants, payments });
    setChatMessages(prev => [...prev, { role: 'ai', text: response || 'Maaf, saya tidak dapat merespons saat ini.' }]);
    setSending(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Smart Insights */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 overflow-y-auto">
        <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-800 uppercase tracking-tighter">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
            <Sparkles size={20} />
          </div>
          Smart Insights
        </h3>
        {loadingInsights ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">Menganalisis Properti...</p>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {insights}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Chat Interface */}
      <div className="lg:col-span-2 bg-slate-900 rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h4 className="text-white font-black text-lg">Manager Assistant</h4>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Powered by Gemini Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-500 uppercase">AI Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
          {chatMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-12">
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-slate-600" />
              </div>
              <p className="font-bold text-slate-300">Tanyakan apa saja tentang operasional kos Anda.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Draf pesan tagihan", "Tips okupansi", "Analisis pendapatan"].map(tip => (
                  <button 
                    key={tip}
                    onClick={() => setInput(tip)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase text-slate-400 rounded-full transition-colors border border-slate-700"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
              <div className={`max-w-[85%] p-4 rounded-[24px] text-sm font-medium ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-900/20' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start animate-in">
              <div className="bg-slate-800 p-4 rounded-[20px] text-indigo-400 rounded-bl-none border border-slate-700">
                <Loader2 className="animate-spin" size={18} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pesan untuk asisten AI..."
              className="w-full bg-slate-800 border-2 border-transparent text-white rounded-[24px] py-4 pl-6 pr-16 focus:border-indigo-600 focus:ring-0 placeholder-slate-500 transition-all font-medium"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
