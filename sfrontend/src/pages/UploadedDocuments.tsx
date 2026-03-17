import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const UploadedDocuments: React.FC = () => {
  const mockDocs = [
    { name: 'Non-Disclosure_Agreement_v2.pdf', type: 'Contract', date: 'Oct 12, 2025', size: '2.4 MB' },
    { name: 'Cease_and_Desist_Notice.docx', type: 'Legal Notice', date: 'Oct 10, 2025', size: '1.1 MB' },
    { name: 'Employee_Onboarding_Terms.pdf', type: 'HR Document', date: 'Sep 28, 2025', size: '3.8 MB' },
  ];

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }} data-lenis-prevent="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FileText size={32} color="var(--primary)" />
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Document Vault</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockDocs.map((doc, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="neu-flat"
            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="neu-pressed" style={{ padding: '1rem', borderRadius: '12px', display: 'flex' }}>
                <FileText size={24} color="var(--secondary)" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{doc.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button style={{ padding: '8px 12px' }}><Download size={18} color="var(--primary)"/></Button>
              <Button style={{ padding: '8px 12px' }}><Trash2 size={18} color="#d9534f"/></Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};