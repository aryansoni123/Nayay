import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from '../hooks/useLenis';
import { Button } from '../components/ui/Button';
import { MessageSquare, Scale, FileText, BarChart, History, Sun, Moon, Menu, X, Maximize2, Minimize2, MapPin } from 'lucide-react';
import { LogIn } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const MainLayout: React.FC = () => {
  useLenis();
  const navigate = useNavigate(); // Brought back for the Home button!

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // --- MODAL STATES ---
  const [activeModal, setActiveModal] = useState<'laws' | 'documents' | 'meter' | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // 1. Add 'user' to your state variables at the top
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // 2. Update the handleGoogleLogin function
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token })
        });

        const data = await res.json();

        if (data.status === "success") {
          localStorage.setItem("user_numeric_id", data.user_id);

          // --- NEW: Set the user state here ---
          setUser({ name: data.name || "User", email: data.email });
          console.log("✅ Logged in as:", data.email);
        }
      } catch (error) {
        console.error("❌ Login failed:", error);
      }
    }
  });

  // 3. Create a Logout function
  const handleLogout = () => {
    localStorage.removeItem("user_numeric_id");
    setUser(null);
    navigate('/');
  };

  // --- THEME EFFECT ---
  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDarkMode]);

  const logoFilter = isDarkMode ? 'invert(1)' : 'none';

  // --- NAV ITEMS ---
  const navItems = [
    { path: '/', label: 'Home Chat', icon: <MessageSquare size={20} /> },
    { path: '/history', label: 'Case History', icon: <History size={20} /> },
    { path: '/nearby', label: 'Nearby Help', icon: <MapPin size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', flexDirection: 'column', position: 'relative' }}>

      {/* --- POP-UP MODAL OVERLAY --- */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`modal-container ${isMaximized ? 'modal-maximized' : 'modal-normal'}`}
              style={{ border: '1px solid var(--shadow-dark)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--shadow-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {activeModal === 'laws' && <Scale size={20} color="var(--text-primary)" />}
                  {activeModal === 'documents' && <FileText size={20} color="var(--text-primary)" />}
                  {activeModal === 'meter' && <BarChart size={20} color="var(--text-primary)" />}
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {activeModal === 'laws' ? 'Laws & Statutes Used' : activeModal === 'documents' ? 'Uploaded Document Vault' : 'Legal Case Meter'}
                  </h3>
                </div>

                {/* Modal Controls */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="flat" className="maximize-btn" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', background: 'transparent', boxShadow: 'none', border: '1px solid var(--text-secondary)' }} onClick={() => setIsMaximized(!isMaximized)}>
                    {isMaximized ? <Minimize2 size={16} color="var(--text-primary)" /> : <Maximize2 size={16} color="var(--text-primary)" />}
                  </Button>
                  <Button variant="flat" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', background: 'transparent', boxShadow: 'none', border: '1px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setActiveModal(null); setIsMaximized(false); }}>
                    <X size={18} color="var(--text-primary)" />
                  </Button>
                </div>
              </div>

              {/* Modal Body Content (With Lenis Scroll Fix) */}
              <div data-lenis-prevent="true" style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--surface)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {activeModal === 'laws' && <p>Extracted statutes, case laws, and legal references for this conversation will appear here...</p>}
                {activeModal === 'documents' && <p>Your uploaded PDFs, contracts, and text documents will be listed here...</p>}

                {/* RESTORED LEGAL METER PIE CHART */}
                {activeModal === 'meter' && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem 0' }}>
                    <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="220" height="220" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                        <circle cx="110" cy="110" r="90" fill="transparent" stroke="var(--shadow-dark)" strokeWidth="18" />
                        <motion.circle cx="110" cy="110" r="90" fill="transparent" stroke="var(--primary)" strokeWidth="18" strokeDasharray={2 * Math.PI * 90} initial={{ strokeDashoffset: 2 * Math.PI * 90 }} animate={{ strokeDashoffset: 2 * Math.PI * 90 - (72 / 100) * (2 * Math.PI * 90) }} transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round" />
                      </svg>
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }} style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>72%</motion.span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Win Probability</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(128,128,128,0.05)', borderRadius: '16px', border: '1px solid var(--shadow-dark)' }}><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Precedent Match</span><span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Strong</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(128,128,128,0.05)', borderRadius: '16px', border: '1px solid var(--shadow-dark)' }}><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Risk Factors</span><span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Low</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(128,128,128,0.05)', borderRadius: '16px', border: '1px solid var(--shadow-dark)' }}><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Statutory Support</span><span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Moderate</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(128,128,128,0.05)', borderRadius: '16px', border: '1px solid var(--shadow-dark)' }}><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Timeline Estimate</span><span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>12-18 Months</span></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE HEADER */}
      <header className="mobile-header" style={{ padding: '1rem 1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} color="var(--text-primary)" />
          </Button>

          {/* CLICKABLE LOGO: Navigates to Home */}
          <div onClick={() => { navigate('/'); setIsSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} title="Go to Home Chat">
            <img src="/finance.png" alt="Logo" style={{ width: '24px', height: '24px', filter: logoFilter, objectFit: 'contain' }} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Legal AI</h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActiveModal('documents')} title="Uploaded Documents">
            <FileText size={18} color="var(--text-primary)" />
          </Button>
          <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActiveModal('laws')} title="Laws Used">
            <Scale size={18} color="var(--text-primary)" />
          </Button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

        {/* SIDEBAR DRAWER */}
        <aside className={`sidebar-container neu-flat ${isSidebarOpen ? 'open' : ''} ${!isDesktopSidebarOpen ? 'sidebar-closed' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>

            {/* CLICKABLE LOGO: Navigates to Home & closes mobile sidebar */}
            <div onClick={() => { navigate('/'); setIsSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} title="Go to Home Chat">
              <img src="/finance.png" alt="Logo" style={{ width: '28px', height: '28px', filter: logoFilter, objectFit: 'contain' }} />
              <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Legal AI</h2>
            </div>

            <div className="mobile-header">
              <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsSidebarOpen(false)}>
                <X size={20} color="var(--text-primary)" />
              </Button>
            </div>
            <div className="desktop-toggle">
              <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsDesktopSidebarOpen(false)}>
                <Menu size={20} color="var(--text-primary)" />
              </Button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px 16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, color: isActive ? 'var(--primary)' : 'var(--text-secondary)', background: 'transparent', boxShadow: 'none', transition: 'all 0.2s ease'
                })}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* SIDEBAR BOTTOM CONTROLS (Updated) */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {user ? (
              // SHOW SIGN OUT IF LOGGED IN
              <Button
                variant="flat"
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1.5px solid #ff4d4d', color: '#ff4d4d', background: 'transparent' }}
              >
                <X size={20} />
                Sign Out ({user.name.split(' ')[0]})
              </Button>
            ) : (
              // SHOW SIGN IN IF NOT LOGGED IN
              <Button
                variant="primary"
                onClick={() => handleGoogleLogin()}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogIn size={20} color="var(--primary-invert)" />
                Sign In with Google
              </Button>
            )}

            {/* EXISTING THEME TOGGLE */}
            <Button variant="flat" onClick={() => setIsDarkMode(!isDarkMode)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', boxShadow: 'none', border: '1.5px solid var(--text-secondary)' }}>
              {isDarkMode ? <Sun size={20} color="var(--primary)" /> : <Moon size={20} color="var(--primary)" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT BOX */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* DESKTOP HEADER */}
          <div className="desktop-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!isDesktopSidebarOpen && (
                <>
                  <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsDesktopSidebarOpen(true)}>
                    <Menu size={20} color="var(--text-primary)" />
                  </Button>

                  {/* CLICKABLE LOGO: Navigates to Home */}
                  <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} title="Go to Home Chat">
                    <img src="/finance.png" alt="Logo" style={{ width: '24px', height: '24px', filter: logoFilter, objectFit: 'contain' }} />
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Legal AI</h3>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActiveModal('documents')} title="Uploaded Documents">
                <FileText size={18} color="var(--text-primary)" />
              </Button>
              <Button variant="flat" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1.5px solid var(--text-secondary)', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActiveModal('laws')} title="Laws Used">
                <Scale size={18} color="var(--text-primary)" />
              </Button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Outlet context={{ setActiveModal }} />
          </div>
        </main>
      </div>
    </div>
  );
};