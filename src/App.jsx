import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Public Pages
import AboutPage from './pages/AboutPage';
import SocialContributionPage from './pages/SocialContributionPage';
import InitiativeDetailPage from './pages/InitiativeDetailPage';
import NewsEventsPage from './pages/NewsEventsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import PublicationPage from './pages/PublicationPage';
import MyTeamPage from './pages/MyTeamPage';

// Admin CMS Pages
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

// Public Layout Wrapper with Header & Footer
function PublicLayout({ children }) {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Protected Admin Route Component
function ProtectedAdmin() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nirv_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const token = localStorage.getItem('nirv_admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        {/* Root Redirect to /vi */}
        <Route path="/" element={<Navigate to="/vi" replace />} />

        {/* Vietnamese Public Routes */}
        <Route path="/vi" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/vi/dong-gop-xa-hoi" element={<PublicLayout><SocialContributionPage /></PublicLayout>} />
        <Route path="/vi/dong-gop-xa-hoi/:slug" element={<PublicLayout><InitiativeDetailPage /></PublicLayout>} />
        <Route path="/vi/tin-tuc-su-kien" element={<PublicLayout><NewsEventsPage /></PublicLayout>} />
        <Route path="/vi/tin-tuc-su-kien/:slug" element={<PublicLayout><NewsDetailPage /></PublicLayout>} />
        <Route path="/vi/an-pham" element={<PublicLayout><PublicationPage /></PublicLayout>} />
        <Route path="/vi/doi-ngu" element={<PublicLayout><MyTeamPage /></PublicLayout>} />

        {/* English Public Routes */}
        <Route path="/en" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/en/social-contribution" element={<PublicLayout><SocialContributionPage /></PublicLayout>} />
        <Route path="/en/social-contribution/:slug" element={<PublicLayout><InitiativeDetailPage /></PublicLayout>} />
        <Route path="/en/news-events" element={<PublicLayout><NewsEventsPage /></PublicLayout>} />
        <Route path="/en/news-events/:slug" element={<PublicLayout><NewsDetailPage /></PublicLayout>} />
        <Route path="/en/publication" element={<PublicLayout><PublicationPage /></PublicLayout>} />
        <Route path="/en/my-team" element={<PublicLayout><MyTeamPage /></PublicLayout>} />

        {/* Private Administration CMS (Secured, No Public Link) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdmin />} />

        {/* Catch-all fallback to /vi */}
        <Route path="*" element={<Navigate to="/vi" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
