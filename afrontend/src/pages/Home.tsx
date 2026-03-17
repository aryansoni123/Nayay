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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--text-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--text-primary)]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-10 py-12 space-y-12 scroll-smooth custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto w-full space-y-12">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start w-full"
            >
              <div className="flex gap-6 items-start w-full">
                {/* Minimalist Dot Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-white text-black' : 'bg-white/10 border border-white/10 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <ShieldCheck size={14} />}
                </div>
                
                {/* Clean Text (No Bubble) */}
                <div className="flex-1 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-50">
                    {msg.role === 'user' ? 'User' : 'Themis AI'}
                  </div>
                  <div className={`text-[15px] sm:text-[16px] leading-[1.8] font-medium tracking-tight ${
                    msg.role === 'user' ? 'text-white' : 'text-white/80'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-30">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="h-32" />
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
                <div className="flex-1 flex items-center gap-4 px-3 h-12">
                  <div className="recording-bar">
                    <div className="recording-dot" style={{ animationDelay: '0s' }} />
                    <div className="recording-dot" style={{ animationDelay: '0.2s' }} />
                    <div className="recording-dot" style={{ animationDelay: '0.4s' }} />
                    <div className="recording-dot" style={{ animationDelay: '0.6s' }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">Capturing Audio...</span>
                </div>
              ) : (
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Themis AI..."
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

      {/* CONSENT DIALOG */}
      <AnimatePresence>
        {showConsent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConsent(false)} className="absolute inset-0 bg-[var(--glass-overlay)] backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-lg glass rounded-[48px] border border-[var(--glass-border)] shadow-2xl overflow-hidden p-10 sm:p-12 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-2xl flex items-center justify-center shadow-xl"><ShieldAlert size={32} /></div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)]">Secure Protocol</h3>
              </div>
              <p className="text-[14px] font-medium text-center leading-relaxed text-[var(--text-primary)]/80">
                Initiating secure document ingestion. This evidence will ground the analysis engine in your specific case parameters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowConsent(false)} className="flex-[2] py-5 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all">Agree & Upload</button>
                <button onClick={() => setShowConsent(false)} className="flex-1 py-5 border border-[var(--glass-border)] rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] active:scale-95 transition-all">Decline</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
