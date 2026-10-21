import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('NirvAdmin2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('nirv_admin_token', data.token);
        localStorage.setItem('nirv_admin_user', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user);
        navigate('/admin');
      } else {
        setError(data.error || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ máy chủ API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#141719', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/assets/logo_nav.svg" alt="NIRV" style={{ height: '42px', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-main)', letterSpacing: '0.04em' }}>
            Hệ thống Quản trị NIRV
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Cổng quản lý dữ liệu CMS nội bộ dành cho Quản trị viên
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#CF1322', fontSize: '0.875rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Nhập username"
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-subtle)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Mật khẩu xác thực</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Nhập mật khẩu"
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-subtle)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-solid"
            style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '0.95rem' }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
          <ShieldCheck size={14} color="#52c41a" />
          <span>Bảo mật JWT & SQLite Database Sync</span>
        </div>
      </div>
    </div>
  );
}
