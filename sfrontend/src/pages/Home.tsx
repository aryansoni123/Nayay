import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// NEW IMPORT: Grab useOutletContext from react-router-dom
import { useOutletContext } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Plus, Send, Mic, Square, Activity, FileText, Scale } from 'lucide-react';

export const Home: React.FC = () => {
  // Grab the modal toggle function from MainLayout
  const { setActiveModal } = useOutletContext<{ setActiveModal: (modal: string) => void }>();

  const [hasConsent, setHasConsent] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false); // Track if user has started
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');

  // Function to trigger the "Fly Away" animation
  const handleInteraction = () => {
    if (!isChatActive) {
      setIsChatActive(true);
    }
  };

  // Replace your old const isDesktop = ... with this:
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 768;

  // File Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio & Visualizer Refs
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const caseStrength = 72;

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // --- FILE UPLOAD LOGIC ---
  const handleUploadClick = () => {
    if (!hasConsent) setShowConsentModal(true);
    else fileInputRef.current?.click();
  };

  const handleAcceptConsent = () => {
    setHasConsent(true);
    setShowConsentModal(false);
    setTimeout(() => { fileInputRef.current?.click(); }, 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleInteraction(); // Trigger UI fly-away
      const fileName = files[0].name;
      setMessages(prev => [...prev, { role: 'user', text: `Uploaded document: ${fileName}` }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: `I have received ${fileName}. Extracting text and analyzing legal parameters now...` }]);
      }, 1000);
    }
  };

  // --- REAL-TIME AUDIO VISUALIZER LOGIC ---
  const updateVolume = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avgVolume = (sum / dataArray.length) / 255;
    setVolume(avgVolume);

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const startRecording = async () => {
    try {
      handleInteraction(); // Trigger UI fly-away
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setMessages(prev => [...prev, { role: 'user', text: '🎤 [Voice Memo Recorded]' }]);
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'ai', text: 'Transcribing and analyzing your voice note...' }]);
        }, 1000);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access the microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolume(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  // --- TEXT CHAT LOGIC ---
  const handleSend = () => {
    if (!input.trim()) return;
    handleInteraction(); // Trigger UI fly-away
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Analyzing your query against relevant statutes...' }]);
    }, 1000);
  };

  return (
    <div className="home-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />

      {/* NEW: Welcome Intro Box */}
      <AnimatePresence>
        {!isChatActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              pointerEvents: 'none'
            }}
          >
            <div
              className="neu-flat"
              style={{
                // 1. DYNAMIC PADDING: scales from 2rem (mobile) to 4.5rem (desktop)
                padding: 'clamp(2rem, 5vw, 4.5rem)',
                borderRadius: '32px',
                textAlign: 'center',
                // 2. DYNAMIC WIDTH: scales from 320px (mobile) to 650px (desktop)
                width: 'clamp(320px, 60vw, 650px)',
                background: 'var(--surface)',
                border: '1px solid var(--shadow-dark)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)' // Added a soft shadow for depth
              }}
            >
              {/* 3. DYNAMIC TEXT SIZE */}
              <h1 style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                lineHeight: 1.1
              }}>
                Legal AI Advisor
              </h1>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
                maxWidth: '80%',
                margin: '0 auto',
                lineHeight: 1.5
              }}>
                Your instant partner for legal clarity and strategy.
                Upload documents or speak your case to begin.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Modal Overlay */}
      <AnimatePresence>
        {showConsentModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}
          >
            <div
              className="neu-flat"
              style={{
                padding: '1.5rem',               // Reduced padding for better mobile fit
                maxWidth: '400px',               // Slightly narrower for a cleaner look
                width: '90%',                    // Crucial: ensures 5% margin on each side of mobile
                textAlign: 'center',
                boxSizing: 'border-box',         // Keeps padding from expanding the width
                position: 'relative',
                zIndex: 101                      // Ensure it sits above EVERYTHING
              }}
            >
              <h2 style={{
                color: 'var(--primary)',
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Legal Consent Required
              </h2>

              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: 1.5,
                fontSize: '0.95rem',
                overflowWrap: 'anywhere'        // Forces long words to wrap instead of bleeding out
              }}>
                You are about to upload documents for legal analysis. By uploading these files you confirm that you have the legal right to share this information.
              </p>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexDirection: 'column',        // Default to column for mobile
                width: '100%'
              }}>
                {/* On larger screens, Tailwind or a media query can switch this to row, 
        but for your current inline setup, stacked buttons are safest for mobile. */}
                <Button
                  variant="primary"
                  onClick={handleAcceptConsent}
                  style={{ width: '100%', padding: '12px' }}
                >
                  Accept Consent
                </Button>

                <Button
                  onClick={() => setShowConsentModal(false)}
                  style={{ width: '100%', background: 'transparent', border: '1px solid var(--shadow-dark)' }}
                >
                  Decline
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESPONSIVE HEADER: Win Probability + Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 1.5rem',
        gap: '1rem',
        width: '100%',
        position: 'relative',
        minHeight: '60px' // Ensures consistent height
      }}>

        {/* THE METER: Stays centered on the line */}
        <motion.div
          className="neu-flat"
          onClick={() => setActiveModal('meter')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '8px 16px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            border: '1px solid var(--shadow-dark)',
            boxShadow: 'none'
          }}
        >
          <Activity size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Win Probability</span>
          <div className="neu-pressed" style={{ width: '60px', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caseStrength}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ background: 'var(--primary)', height: '100%', borderRadius: '4px' }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{caseStrength}%</span>
        </motion.div>

        {/* THE ACTION BUTTONS: Floats to the far right on Desktop only */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          position: isDesktop ? 'absolute' : 'static',
          right: isDesktop ? '1.5rem' : 'auto',
          marginTop: isDesktop ? '0' : '0.5rem'
        }}>
          {/* <Button
            variant="flat"
            onClick={() => setActiveModal('docs')}
            style={{ padding: '10px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--shadow-dark)' }}
          >
            <FileText size={18} color="var(--text-primary)" />
          </Button>
          <Button
            variant="flat"
            onClick={() => setActiveModal('laws')}
            style={{ padding: '10px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--shadow-dark)' }}
          >
            <Scale size={18} color="var(--text-primary)" />
          </Button> */}
        </div>
      </div>

      {/* Chat History Area */}
      <div data-lenis-prevent="true" style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
        {/* Only show messages once chat is active OR if they are the default AI message */}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              whiteSpace: 'pre-wrap',
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(128, 128, 128, 0.1)',
              color: msg.role === 'user' ? 'var(--primary-invert)' : 'var(--text-primary)',
              boxShadow: 'none',
              fontSize: '1rem',
              lineHeight: '1.5',
              wordBreak: 'break-word'
            }}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      {/* INPUT AREA WRAPPER */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%', maxWidth: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }}>
        <Button
          variant="flat"
          onClick={handleUploadClick}
          style={{ flexShrink: 0, padding: '10px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--shadow-dark)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={22} color="var(--text-primary)" />
        </Button>

        <div className="neu-pressed" style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '6px 12px', borderRadius: '40px', boxSizing: 'border-box' }}>
          {isRecording ? (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '4px', height: '24px', paddingLeft: '4px', overflow: 'hidden' }}>
              {[0.4, 0.8, 1, 0.8, 0.4].map((multiplier, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${Math.max(4, volume * 40 * multiplier)}px` }}
                  transition={{ type: 'tween', duration: 0.05 }}
                  style={{ width: '4px', background: 'var(--primary)', borderRadius: '2px', flexShrink: 0 }}
                />
              ))}
              <span style={{ marginLeft: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>Listening...</span>
            </div>
          ) : (
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.length > 0) handleInteraction();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Reply to Legal AI..."
              style={{ flex: 1, width: '100%', minWidth: 0, padding: '10px 4px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
            />
          )}

          <div style={{ flexShrink: 0 }}>
            {input.trim() && !isRecording ? (
              <Button variant="primary" onClick={handleSend} style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={18} />
              </Button>
            ) : (
              <motion.button
                onClick={toggleRecording}
                style={{
                  padding: '8px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isRecording ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={20} />}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};