import React from 'react';
import { motion } from 'framer-motion';

export const LegalMeter: React.FC = () => {
  const caseStrength = 72; // This would come from your AI evaluation state
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (caseStrength / 100) * circumference;

  return (
    <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '3rem' }}>Legal Position Analysis</h1>
      
      <div className="neu-flat" style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
        <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="130" cy="130" r="120" 
            fill="none" stroke="var(--surface)" strokeWidth="20"
            style={{ filter: 'drop-shadow(inset 2px 2px 4px var(--shadow-dark))' }}
          />
          <motion.circle 
            cx="130" cy="130" r="120" 
            fill="none" stroke="var(--primary)" strokeWidth="20"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{caseStrength}%</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Case Strength</div>
        </div>
      </div>

      <div className="neu-flat" style={{ marginTop: '4rem', padding: '2rem', width: '100%', maxWidth: '600px' }}>
        <h3 style={{ color: 'var(--secondary)' }}>Supporting Reasoning</h3>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, marginTop: '1rem' }}>
          Based on the uploaded contracts and referenced communications, your position is strong regarding breach of contract. The primary vulnerability lies in the notice period documentation (Section 4.2).
        </p>
      </div>
    </div>
  );
};