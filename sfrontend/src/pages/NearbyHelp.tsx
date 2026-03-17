import React, { useState, useEffect } from 'react';
import { MapPin, ShieldAlert, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export const NearbyHelp: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error("Location access denied or failed:", err); // Fixes the 'err' warning!
        setError("Unable to retrieve your location. Please check your browser permissions.");
        setLoading(false);
      }
    );
  }, []);

  // --- THE MAGIC MAP URL ---
  // If we have coords, it searches exactly there. If blocked, it defaults to Indore.
  const mapUrl = location 
    ? `https://maps.google.com/maps?q=lawyers+and+police+stations+near+${location.lat},${location.lng}&z=14&output=embed`
    : `https://maps.google.com/maps?q=lawyers+and+police+stations+near+Indore,+Madhya+Pradesh&z=13&output=embed`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MapPin size={28} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Nearby Help</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Locating verified legal aid and emergency services in your area.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="neu-flat" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', border: '1px solid var(--shadow-dark)' }}>
          <Scale size={18} color="var(--text-primary)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Lawyers & Firms</span>
        </div>
        <div className="neu-flat" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', border: '1px solid var(--shadow-dark)' }}>
          <ShieldAlert size={18} color="var(--text-primary)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Police Stations</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="neu-flat" 
        style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--shadow-dark)', position: 'relative' }}
      >
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--shadow-dark)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p>Requesting location access...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error && !location ? (
          /* Fixes the 'error' warning by actually showing the error to the user! */
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', textAlign: 'center', zIndex: 10 }}>
              {error} Showing fallback location.
            </div>
            <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        ) : (
          <iframe 
            src={mapUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </motion.div>
    </div>
  );
};