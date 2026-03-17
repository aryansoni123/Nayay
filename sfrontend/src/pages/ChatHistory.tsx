import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, ChevronRight } from 'lucide-react';

export const ChatHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockHistory = [
    { title: 'Breach of Contract Analysis: Vendor Dispute', date: 'Today, 10:45 AM', messages: 14 },
    { title: 'Review NDA clauses for new hire', date: 'Yesterday, 3:20 PM', messages: 6 },
    { title: 'Intellectual Property Infringement Assessment', date: 'Oct 08, 2025', messages: 22 },
    { title: 'Commercial Lease Agreement Formatting', date: 'Sep 30, 2025', messages: 8 },
  ];

  const filteredHistory = mockHistory.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }} data-lenis-prevent="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <History size={32} color="var(--primary)" />
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Conversation History</h1>
      </div>

      <div className="neu-pressed" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text"
          placeholder="Search past legal queries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.5rem 1rem', color: 'var(--text-primary)', outline: 'none' }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredHistory.map((chat, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.01 }}
            className="neu-flat"
            style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{chat.title}</h4>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{chat.date} • {chat.messages} messages</span>
            </div>
            <div className="neu-pressed" style={{ padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <ChevronRight size={20} color="var(--primary)" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};