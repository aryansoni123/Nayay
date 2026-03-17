import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Plus, User, CheckCircle, ShieldCheck, ShieldAlert, Lock, Fingerprint } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Themis Enterprise. I am your specialized legal AI. How can I assist with your corporate or individual legal inquiries today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Analyzing your request against our enterprise knowledge base and relevant Indian statutes. This may take a moment in Pro Mode...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-color)] relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--text-primary)]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--text-primary)]/5 blur-[100px] rounded-full" />

      {/* Chat Messages - RELIABLE SCROLL IMPLEMENTATION */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-10 py-12 space-y-10 scroll-smooth custom-scrollbar"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-4 sm:gap-6 max-w-[95%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)]'}`}>
                {msg.role === 'user' ? <User size={18} /> : <ShieldCheck size={18} />}
              </div>
              <div className={`space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] text-[13px] sm:text-[15px] font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-color)] rounded-tr-none' 
                    : 'glass text-[var(--text-primary)]/90 border border-[var(--glass-border)] rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <div className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] px-3">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Query Bar */}
      <div className="p-4 sm:p-10 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/95 to-transparent flex-shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute inset-0 bg-[var(--text-primary)]/5 blur-2xl rounded-[40px] opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
          <div className="relative glass border border-[var(--glass-border)] rounded-[32px] p-2 flex items-center gap-1 sm:gap-3 shadow-2xl">
            <button 
              onClick={() => setShowConsent(true)}
              className="p-3.5 sm:p-4 hover:bg-[var(--text-primary)]/10 rounded-2xl transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
              title="Upload Evidence"
            >
              <Plus size={22} />
            </button>
            
            <div className="flex-1 min-w-0 flex items-center">
              {isRecording ? (
                <div className="flex-1 flex items-center gap-4 px-3">
                  <div className="recording-bar flex items-center gap-1">
                    <div className="recording-dot w-1 h-4 bg-red-500 rounded-full animate-[recording-wave_1s_ease-in-out_infinite]" />
                    <div className="recording-dot w-1 h-4 bg-red-500 rounded-full animate-[recording-wave_1s_ease-in-out_infinite_0.2s]" />
                    <div className="recording-dot w-1 h-4 bg-red-500 rounded-full animate-[recording-wave_1s_ease-in-out_infinite_0.4s]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">Enterprise Voice Capture...</span>
                </div>
              ) : (
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire about statutes, precedents or case merits..."
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-[14px] font-bold py-3 px-2 placeholder:text-[var(--text-secondary)]/40"
                />
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 pr-1 flex-shrink-0">
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3.5 sm:p-4 rounded-2xl transition-all ${isRecording ? 'bg-red-500/10 text-red-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10'}`}
              >
                <Mic size={22} className={isRecording ? 'animate-pulse' : ''} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-3.5 sm:p-4 rounded-2xl transition-all ${input.trim() ? 'bg-[var(--text-primary)] text-[var(--bg-color)] shadow-xl hover:scale-105 active:scale-95' : 'text-[var(--text-secondary)]/20 cursor-not-allowed'}`}
              >
                <Send size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REFINED CONSENT DIALOG */}
      <AnimatePresence>
        {showConsent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConsent(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-lg glass rounded-[48px] border border-[var(--glass-border)] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--text-primary)]/20 to-transparent" />
              
              <div className="p-10 sm:p-12 space-y-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-[32px] flex items-center justify-center shadow-2xl mb-2"><ShieldAlert size={36} /></div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)]">Secure Ingestion Protocol</h3>
                  <div className="h-px w-12 bg-[var(--glass-border)]" />
                </div>
                
                <div className="space-y-6">
                  {[
                    { icon: <Lock size={16} />, title: 'Enterprise Encryption', desc: 'Documents are processed via AES-256 isolated environments.' },
                    { icon: <Fingerprint size={16} />, title: 'Grounding Only', desc: 'Extracted data is volatile and used strictly for RAG context.' },
                    { icon: <CheckCircle size={16} />, title: 'Legal Authority', desc: 'You confirm legal ownership of all uploaded materials.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-color)] transition-all">{item.icon}</div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">{item.title}</div>
                        <div className="text-[13px] font-medium text-[var(--text-secondary)] leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button onClick={() => setShowConsent(false)} className="flex-[2] py-5 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">Confirm & Upload</button>
                  <button onClick={() => setShowConsent(false)} className="flex-1 py-5 border border-[var(--glass-border)] rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all">Decline</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .glass { background: var(--glass-bg); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
        @keyframes recording-wave { 0%, 100% { height: 8px; } 50% { height: 20px; } }
      `}</style>
    </div>
  );
};
