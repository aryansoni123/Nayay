import React from 'react';
import { motion } from 'framer-motion';
import { Scale, BookOpen } from 'lucide-react';

export const LawsUsed: React.FC = () => {
  const mockLaws = [
    { act: 'Indian Contract Act, 1872', section: 'Section 73', desc: 'Compensation for loss or damage caused by breach of contract.', relevance: 'High' },
    { act: 'Information Technology Act, 2000', section: 'Section 43A', desc: 'Compensation for failure to protect data.', relevance: 'Medium' },
    { act: 'Copyright Act, 1957', section: 'Section 14', desc: 'Meaning of copyright and exclusive rights.', relevance: 'Low' },
  ];

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }} data-lenis-prevent="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Scale size={32} color="var(--primary)" />
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Referenced Laws</h1>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The AI has identified the following statutes as highly relevant to your recent queries.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {mockLaws.map((law, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="neu-flat"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} /> {law.act}
              </h3>
              <span className="neu-pressed" style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
                Relevance: {law.relevance}
              </span>
            </div>
            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{law.section}</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{law.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};