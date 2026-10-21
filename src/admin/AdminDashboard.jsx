import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, HeartHandshake, Newspaper, BookOpen, Users, Settings,
  Image as ImageIcon, LogOut, Plus, Trash2, Edit2, Eye, Check, X,
  ExternalLink, Upload, AlertCircle, RefreshCw, MapPin, Globe
} from 'lucide-react';
import { CountryFlag, getCountryCode } from '../components/WorldFootprintMap';
import { COUNTRY_GEO_MAP, detectCountryGeo } from '../data/countryCoordinates';

const PRESET_DESTINATIONS = Object.values(COUNTRY_GEO_MAP).map(item => ({
  country_code: item.code,
  country_vi: item.vi,
  country_en: item.en,
  flag: item.flag,
  region: item.region,
  x: item.x,
  y: item.y
}));

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [publications, setPublications] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [settings, setSettings] = useState({});
  const [mediaList, setMediaList] = useState([]);
  const [footprintList, setFootprintList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });

  // Modal editing states
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'initiative', 'news', 'pub', 'team', 'footprint'
  const [previewItem, setPreviewItem] = useState(null);

  const token = localStorage.getItem('nirv_admin_token');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  // Fetch data on tab change
  const loadData = () => {
    setLoading(true);
    if (activeTab === 'stats') {
      fetch('/api/admin/stats', { headers: authHeaders })
        .then(res => res.json())
        .then(res => { if (res.success) setStats(res.data); })
        .finally(() => setLoading(false));
    } else if (activeTab === 'initiatives') {
      fetch('/api/admin/initiatives', { headers: authHeaders })
        .then(res => res.json())
        .then(res => { if (res.success) setInitiatives(res.data); })
        .finally(() => setLoading(false));
    } else if (activeTab === 'news') {
      fetch('/api/admin/news-events', { headers: authHeaders })
        .then(res => res.json())
        .then(res => { if (res.success) setNewsEvents(res.data); })
        .finally(() => setLoading(false));
    } else if (activeTab === 'publications') {
      fetch('/api/admin/publications', { headers: authHeaders })
        .then(res => res.json())
        .then(res => { if (res.success) setPublications(res.data); })
        .finally(() => setLoading(false));
    } else if (activeTab === 'team') {
      fetch('/api/admin/team', { headers: authHeaders })
        .then(res => res.json())
        .then(res => { if (res.success) setTeamMembers(res.data); })
        .finally(() => setLoading(false));
    } else if (activeTab === 'footprint' || activeTab === 'settings') {
      fetch('/api/admin/settings', { headers: authHeaders })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setSettings(res.data);
            if (res.data.footprint_destinations) {
              try {
                const list = JSON.parse(res.data.footprint_destinations);
                if (Array.isArray(list)) setFootprintList(list);
              } catch (e) {}
            }
          }
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'media') {
      fetch('/api/admin/media', { headers: authHeaders })
        .then(res => res.json())
        .then(res => { if (res.success) setMediaList(res.data); })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('nirv_admin_token');
    localStorage.removeItem('nirv_admin_user');
    if (onLogout) onLogout();
    navigate('/admin/login');
  };

  // Generic Save Handler for CRUD
  const handleSaveItem = async (type, item) => {
    try {
      const isEdit = !!item.id;
      let endpoint = '';
      if (type === 'initiative') endpoint = isEdit ? `/api/admin/initiatives/${item.id}` : '/api/admin/initiatives';
      if (type === 'news') endpoint = isEdit ? `/api/admin/news-events/${item.id}` : '/api/admin/news-events';
      if (type === 'pub') endpoint = isEdit ? `/api/admin/publications/${item.id}` : '/api/admin/publications';
      if (type === 'team') endpoint = isEdit ? `/api/admin/team/${item.id}` : '/api/admin/team';

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success) {
        notify(data.message || 'Lưu thành công!');
        setModalType(null);
        setEditingItem(null);
        loadData();
      } else {
        notify(data.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (err) {
      notify('Lỗi máy chủ', 'error');
    }
  };

  // Generic Delete Handler
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này? Thao tác không thể hoàn tác.')) return;
    try {
      let endpoint = '';
      if (type === 'initiative') endpoint = `/api/admin/initiatives/${id}`;
      if (type === 'news') endpoint = `/api/admin/news-events/${id}`;
      if (type === 'pub') endpoint = `/api/admin/publications/${id}`;
      if (type === 'team') endpoint = `/api/admin/team/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        notify(data.message || 'Đã xóa bản ghi!');
        loadData();
      }
    } catch (err) {
      notify('Lỗi xóa bản ghi', 'error');
    }
  };

  const handleSaveFootprint = async (updatedList) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...settings,
          footprint_destinations: JSON.stringify(updatedList)
        })
      });
      const d = await res.json();
      if (d.success) {
        setFootprintList(updatedList);
        notify('Đã cập nhật danh sách vùng đất & hội nghị quốc tế thành công!');
      } else {
        notify(d.error || 'Lỗi khi lưu điểm đến.', 'error');
      }
    } catch (err) {
      notify('Lỗi máy chủ khi cập nhật điểm đến.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) notify('Đã cập nhật cài đặt hệ thống thành công!');
    } catch (err) {
      notify('Lỗi lưu cài đặt', 'error');
    }
  };

  // Media File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        notify('Đã tải tệp lên thành công!');
        loadData();
      } else {
        notify(data.error || 'Lỗi tải lên', 'error');
      }
    } catch (err) {
      notify('Lỗi tải tệp lên', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F7' }}>
      {/* 1. Admin Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#141719', color: '#FFFFFF', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/assets/logo_nav.svg" alt="NIRV" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em' }}>NIRV CMS</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Quản trị hệ thống</div>
          </div>
        </div>

        <nav style={{ padding: '20px 12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'stats', label: 'Tổng quan hệ thống', icon: BarChart2 },
            { id: 'initiatives', label: 'Đóng góp xã hội', icon: HeartHandshake },
            { id: 'news', label: 'Tin tức & Sự kiện', icon: Newspaper },
            { id: 'publications', label: 'Ấn phẩm nghiên cứu', icon: BookOpen },
            { id: 'team', label: 'Hồ sơ Đội ngũ', icon: Users },
            { id: 'footprint', label: 'Vùng đất đã đến', icon: MapPin },
            { id: 'settings', label: 'Cài đặt Tổ chức', icon: Settings },
            { id: 'media', label: 'Quản lý Đa phương tiện', icon: ImageIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
            Đăng nhập: <strong>{user?.name || 'Administrator'}</strong>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: '#FF6B6B',
              padding: '8px 0',
              fontWeight: 600
            }}
          >
            <LogOut size={16} /> Đăng xuất an toàn
          </button>
        </div>
      </aside>

      {/* 2. Main Content View */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Top Navbar */}
        <header style={{ height: '64px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-main)' }}>
            {activeTab === 'stats' && 'Bảng điều khiển Tổng quan'}
            {activeTab === 'initiatives' && 'Quản lý Dự án Đóng góp Xã hội'}
            {activeTab === 'news' && 'Quản lý Tin tức & Sự kiện'}
            {activeTab === 'publications' && 'Quản lý Ấn phẩm & Báo cáo Nghiên cứu'}
            {activeTab === 'team' && 'Quản lý Nhân sự & Nhà khoa học'}
            {activeTab === 'footprint' && 'Quản lý Vùng đất & Hội nghị Quốc tế'}
            {activeTab === 'settings' && 'Cài đặt Thông tin & Tôn chỉ Viện NIRV'}
            {activeTab === 'media' && 'Thư viện Tệp & Hình ảnh Đa phương tiện'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="/vi"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gray"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              Xem Cổng thông tin công khai <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {/* Feedback message banner */}
        {message.text && (
          <div
            style={{
              padding: '12px 32px',
              backgroundColor: message.type === 'error' ? '#FFF1F0' : '#F6FFED',
              borderBottom: `1px solid ${message.type === 'error' ? '#FFA39E' : '#B7EB8F'}`,
              color: message.type === 'error' ? '#CF1322' : '#389E0D',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {message.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ padding: '32px' }}>
          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === 'stats' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ấn phẩm nghiên cứu</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0' }}>{stats.publications?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>Đã xuất bản: {stats.publications?.published || 0} | Bản nháp: {stats.publications?.draft || 0}</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Dự án Đóng góp xã hội</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1B5E20', margin: '8px 0' }}>{stats.initiatives?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>Đang hiển thị: {stats.initiatives?.published || 0} dự án</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tin tức & Sự kiện</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#D46B08', margin: '8px 0' }}>{stats.news_events?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>Đã đăng tải: {stats.news_events?.published || 0} bài</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Nhân sự & Nhà khoa học</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-text-main)', margin: '8px 0' }}>{stats.team?.total || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>Hồ sơ hoạt động: {stats.team?.published || 0} chuyên gia</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>Hướng dẫn Quản trị Dữ liệu NIRV</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                  Hệ thống quản lý nội dung độc lập (Private CMS) lưu trữ trực tiếp vào cơ sở dữ liệu SQLite chuẩn ACID.
                  Mọi thao tác tạo mới, chỉnh sửa, chuyển trạng thái "Đã xuất bản" (Published) hoặc "Bản nháp" (Draft) sẽ tự động phản ánh ngay lập tức trên các trang công khai song ngữ (VI/EN) và tính toán lại toàn bộ biểu đồ, số liệu thống kê.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INITIATIVES CRUD */}
          {activeTab === 'initiatives' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Tổng số: <strong>{initiatives.length}</strong> dự án</div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({
                      title_vi: '', title_en: '', slug: '', summary_vi: '', summary_en: '',
                      content_vi: '', content_en: '', category_vi: 'Y tế Số', category_en: 'Digital Healthcare',
                      beneficiaries_vi: '', beneficiaries_en: '', metric_value: '', metric_label_vi: '', metric_label_en: '',
                      cover_image: '', status: 'published', order_index: initiatives.length + 1
                    });
                    setModalType('initiative');
                  }}
                  className="btn-solid"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm Dự án Mới
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Ảnh</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Tên Sáng kiến (VI / EN)</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Chuyên mục</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Chỉ số Tác động</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initiatives.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <img src={item.cover_image} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{item.title_vi}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.title_en}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="badge badge-primary">{item.category_vi}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{item.metric_value}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.metric_label_vi}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${item.status === 'published' ? 'badge-primary' : 'badge-gray'}`}>
                            {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingItem(item); setModalType('initiative'); }}
                            style={{ padding: '6px', color: '#1890FF', marginRight: '8px' }}
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('initiative', item.id)}
                            style={{ padding: '6px', color: '#FF4D4F' }}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NEWS & EVENTS CRUD */}
          {activeTab === 'news' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Tổng số: <strong>{newsEvents.length}</strong> bài viết & sự kiện</div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({
                      type: 'news', title_vi: '', title_en: '', slug: '', summary_vi: '', summary_en: '',
                      content_vi: '', content_en: '', category_vi: 'Nghiên cứu & Đổi mới', category_en: 'Research & Innovation',
                      tags: 'AI, NIRV', cover_image: '', author_vi: 'Ban Khoa học NIRV', author_en: 'NIRV Science Board',
                      event_date: '', event_location_vi: '', event_location_en: '', event_registration_url: '',
                      is_featured: 0, status: 'published', published_at: new Date().toISOString()
                    });
                    setModalType('news');
                  }}
                  className="btn-solid"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm Bài viết / Sự kiện
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Loại</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Tiêu đề (VI / EN)</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Chuyên mục</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Ngày công bố / Sự kiện</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trạng thái</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsEvents.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${item.type === 'event' ? 'badge-dark' : 'badge-primary'}`}>
                            {item.type === 'event' ? 'Sự kiện' : 'Tin tức'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{item.title_vi}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.title_en}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{item.category_vi}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {new Date(item.event_date || item.published_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${item.status === 'published' ? 'badge-primary' : 'badge-gray'}`}>
                            {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingItem(item); setModalType('news'); }}
                            style={{ padding: '6px', color: '#1890FF', marginRight: '8px' }}
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('news', item.id)}
                            style={{ padding: '6px', color: '#FF4D4F' }}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLICATIONS CRUD */}
          {activeTab === 'publications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Tổng số: <strong>{publications.length}</strong> công trình</div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({
                      title: '', authors: '', year: 2026, venue: '', publication_type: 'Journal',
                      ranking_category: 'Q1', doi: '', publisher_url: '', pdf_url: '',
                      abstract_vi: '', abstract_en: '', keywords: '', citation_count: 0,
                      citation_source: 'Google Scholar', topic_tags: '', is_featured: 0, status: 'published'
                    });
                    setModalType('pub');
                  }}
                  className="btn-solid"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm Ấn phẩm Nghiên cứu
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Năm</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Tiêu đề & Tác giả</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Nơi công bố</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Xếp hạng</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Trích dẫn</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>{item.year}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#2e7d32' }}>{item.authors}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{item.venue}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {item.ranking_category && <span className="badge badge-ranking">{item.ranking_category}</span>}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>{item.citation_count}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingItem(item); setModalType('pub'); }}
                            style={{ padding: '6px', color: '#1890FF', marginRight: '8px' }}
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('pub', item.id)}
                            style={{ padding: '6px', color: '#FF4D4F' }}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TEAM CRUD */}
          {activeTab === 'team' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Tổng số: <strong>{teamMembers.length}</strong> chuyên gia</div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({
                      name: '', title_vi: 'TS.', title_en: 'Ph.D.', role_vi: 'Nghiên cứu viên', role_en: 'Research Fellow',
                      group_category: 'researchers', affiliation_vi: 'Viện Nghiên cứu NIRV', affiliation_en: 'NIRV Institute',
                      research_interests_vi: '', research_interests_en: '', bio_vi: '', bio_en: '',
                      avatar: '', email: '', google_scholar: '', orcid: '', github: '', website: '',
                      order_index: teamMembers.length + 1, status: 'published'
                    });
                    setModalType('team');
                  }}
                  className="btn-solid"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm Thành viên Đội ngũ
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Ảnh</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Họ và tên</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Chức vụ & Vai trò</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Nhóm</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Email</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <img src={member.avatar} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-main)' }}>{member.name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{member.role_vi}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{member.role_en}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${member.group_category === 'leadership' ? 'badge-primary' : 'badge-gray'}`}>
                            {member.group_category === 'leadership' ? 'Lãnh đạo' : 'Nghiên cứu viên'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{member.email}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingItem(member); setModalType('team'); }}
                            style={{ padding: '6px', color: '#1890FF', marginRight: '8px' }}
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('team', member.id)}
                            style={{ padding: '6px', color: '#FF4D4F' }}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FOOTPRINT DESTINATIONS CRUD */}
          {activeTab === 'footprint' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                  Tổng số: <strong>{footprintList.length}</strong> điểm đến ({footprintList.filter(d => !d.isHome).length} hội nghị quốc tế)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem({
                      country_vi: 'Hoa Kỳ',
                      country_en: 'United States',
                      flag: '🇺🇸',
                      region: 'americas',
                      city_vi: 'San Francisco',
                      city_en: 'San Francisco',
                      conference_vi: '',
                      conference_en: '',
                      topic_vi: '',
                      topic_en: '',
                      year: '2026',
                      date_vi: '',
                      date_en: '',
                      delegation_vi: 'Đoàn nghiên cứu NIRV',
                      delegation_en: 'NIRV Delegation',
                      conferencesCount: 1,
                      papersCount: 1,
                      x: 28,
                      y: 18
                    });
                    setModalType('footprint');
                  }}
                  className="btn-solid"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Thêm Điểm đến / Hội nghị Quốc tế
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Quốc gia</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Thành phố</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Hội nghị & Mục tiêu</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Năm</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>Vai trò</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {footprintList.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          Chưa có hội nghị quốc tế nào được thêm. Điểm khởi đầu mặc định là Việt Nam 🇻🇳.
                        </td>
                      </tr>
                    ) : (
                      footprintList.map((loc) => (
                        <tr key={loc.id || loc.country_en} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            <span style={{ marginRight: '10px', display: 'inline-block', verticalAlign: 'middle' }}>
                              <CountryFlag loc={loc} size="sm" />
                            </span>
                            {loc.country_vi} ({loc.country_en})
                          </td>
                          <td style={{ padding: '12px 16px' }}>{loc.city_vi}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{loc.conference_vi}</div>
                            {loc.topic_vi && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{loc.topic_vi}</div>}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{loc.year}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {loc.isHome ? (
                              <span className="badge badge-primary">Trụ sở khởi đầu</span>
                            ) : (
                              <span className="badge badge-gray">Hội nghị quốc tế</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {!loc.isHome && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa điểm đến ${loc.country_vi}?`)) {
                                    const updated = footprintList.filter(l => l.id !== loc.id);
                                    handleSaveFootprint(updated);
                                  }
                                }}
                                style={{ padding: '6px', color: '#FF4D4F' }}
                                title="Xóa điểm đến này"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '36px', borderRadius: '8px', border: '1px solid var(--color-border)', maxWidth: '800px' }}>
              <form onSubmit={handleSaveSettings}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '24px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '8px' }}>
                  Thông tin Định danh & Liên hệ
                </h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên Viện (Tiếng Việt)</label>
                    <input
                      type="text"
                      value={settings.org_name_vi || ''}
                      onChange={(e) => setSettings({ ...settings, org_name_vi: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên Viện (English)</label>
                    <input
                      type="text"
                      value={settings.org_name_en || ''}
                      onChange={(e) => setSettings({ ...settings, org_name_en: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Khẩu hiệu / Tagline (VI)</label>
                    <input
                      type="text"
                      value={settings.tagline_vi || ''}
                      onChange={(e) => setSettings({ ...settings, tagline_vi: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Khẩu hiệu / Tagline (EN)</label>
                    <input
                      type="text"
                      value={settings.tagline_en || ''}
                      onChange={(e) => setSettings({ ...settings, tagline_en: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tầm nhìn Chiến lược (VI)</label>
                  <textarea
                    rows={3}
                    value={settings.vision_vi || ''}
                    onChange={(e) => setSettings({ ...settings, vision_vi: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tầm nhìn Chiến lược (EN)</label>
                  <textarea
                    rows={3}
                    value={settings.vision_en || ''}
                    onChange={(e) => setSettings({ ...settings, vision_en: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sứ mệnh Khoa học (VI)</label>
                  <textarea
                    rows={3}
                    value={settings.mission_vi || ''}
                    onChange={(e) => setSettings({ ...settings, mission_vi: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sứ mệnh Khoa học (EN)</label>
                  <textarea
                    rows={3}
                    value={settings.mission_en || ''}
                    onChange={(e) => setSettings({ ...settings, mission_en: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email liên hệ</label>
                    <input
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-solid" style={{ marginTop: '16px' }}>
                  Lưu thay đổi Cài đặt
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: MEDIA ASSETS */}
          {activeTab === 'media' && (
            <div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
                  Tải tệp tin / Hình ảnh lên máy chủ
                </h3>
                <label className="btn-solid" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <Upload size={16} /> Chọn tệp để tải lên (JPG, PNG, WEBP, PDF...)
                  <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div className="grid-4">
                {mediaList.map((media) => (
                  <div key={media.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '140px', backgroundColor: '#F0EEEE', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {media.mimetype.startsWith('image') ? (
                        <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{media.original_name}</span>
                      )}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={media.original_name}>
                        {media.original_name}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(media.url);
                          notify('Đã sao chép đường dẫn URL tệp!');
                        }}
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '8px' }}
                      >
                        Sao chép URL: {media.url}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CRUD EDIT MODAL */}
      {modalType && editingItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {editingItem.id ? 'Chỉnh sửa bản ghi' : 'Thêm mới bản ghi'}
              </h3>
              <button type="button" onClick={() => setModalType(null)} style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal fields for Initiative */}
            {modalType === 'initiative' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveItem('initiative', editingItem); }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên dự án (Tiếng Việt) *</label>
                    <input type="text" required value={editingItem.title_vi} onChange={(e) => setEditingItem({ ...editingItem, title_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên dự án (English) *</label>
                    <input type="text" required value={editingItem.title_en} onChange={(e) => setEditingItem({ ...editingItem, title_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Chuyên mục (VI)</label>
                    <input type="text" value={editingItem.category_vi} onChange={(e) => setEditingItem({ ...editingItem, category_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chuyên mục (EN)</label>
                    <input type="text" value={editingItem.category_en} onChange={(e) => setEditingItem({ ...editingItem, category_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Số liệu tác động (Ví dụ: 120.000+)</label>
                    <input type="text" value={editingItem.metric_value} onChange={(e) => setEditingItem({ ...editingItem, metric_value: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mô tả chỉ số (VI)</label>
                    <input type="text" value={editingItem.metric_label_vi} onChange={(e) => setEditingItem({ ...editingItem, metric_label_vi: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tóm tắt ngắn (VI)</label>
                  <textarea rows={2} value={editingItem.summary_vi} onChange={(e) => setEditingItem({ ...editingItem, summary_vi: e.target.value })} className="form-textarea" />
                </div>

                <div className="form-group">
                  <label className="form-label">Tóm tắt ngắn (EN)</label>
                  <textarea rows={2} value={editingItem.summary_en} onChange={(e) => setEditingItem({ ...editingItem, summary_en: e.target.value })} className="form-textarea" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết (VI)</label>
                  <textarea rows={4} value={editingItem.content_vi} onChange={(e) => setEditingItem({ ...editingItem, content_vi: e.target.value })} className="form-textarea" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết (EN)</label>
                  <textarea rows={4} value={editingItem.content_en} onChange={(e) => setEditingItem({ ...editingItem, content_en: e.target.value })} className="form-textarea" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">URL Ảnh đại diện</label>
                    <input type="text" value={editingItem.cover_image} onChange={(e) => setEditingItem({ ...editingItem, cover_image: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái xuất bản</label>
                    <select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })} className="form-select">
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="draft">Bản nháp (Draft)</option>
                      <option value="archived">Lưu trữ (Archived)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setModalType(null)} className="btn-outline-gray">Hủy bỏ</button>
                  <button type="submit" className="btn-solid">Lưu thay đổi</button>
                </div>
              </form>
            )}

            {/* Modal fields for News / Event */}
            {modalType === 'news' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveItem('news', editingItem); }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Loại bài đăng</label>
                    <select value={editingItem.type} onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })} className="form-select">
                      <option value="news">Tin tức (News)</option>
                      <option value="event">Sự kiện (Event)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đánh dấu Nổi bật (Featured)</label>
                    <select value={editingItem.is_featured ? 1 : 0} onChange={(e) => setEditingItem({ ...editingItem, is_featured: Number(e.target.value) })} className="form-select">
                      <option value={0}>Không</option>
                      <option value={1}>Có (Hiển thị đầu trang)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tiêu đề (Tiếng Việt) *</label>
                    <input type="text" required value={editingItem.title_vi} onChange={(e) => setEditingItem({ ...editingItem, title_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tiêu đề (English) *</label>
                    <input type="text" required value={editingItem.title_en} onChange={(e) => setEditingItem({ ...editingItem, title_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                {editingItem.type === 'event' && (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Thời gian diễn ra sự kiện</label>
                      <input type="datetime-local" value={editingItem.event_date ? editingItem.event_date.slice(0, 16) : ''} onChange={(e) => setEditingItem({ ...editingItem, event_date: e.target.value })} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Địa điểm sự kiện</label>
                      <input type="text" value={editingItem.event_location_vi || ''} onChange={(e) => setEditingItem({ ...editingItem, event_location_vi: e.target.value })} className="form-input" />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tóm tắt nội dung (VI)</label>
                  <textarea rows={2} value={editingItem.summary_vi} onChange={(e) => setEditingItem({ ...editingItem, summary_vi: e.target.value })} className="form-textarea" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung đầy đủ (VI)</label>
                  <textarea rows={4} value={editingItem.content_vi} onChange={(e) => setEditingItem({ ...editingItem, content_vi: e.target.value })} className="form-textarea" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">URL Ảnh bìa</label>
                    <input type="text" value={editingItem.cover_image} onChange={(e) => setEditingItem({ ...editingItem, cover_image: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái xuất bản</label>
                    <select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })} className="form-select">
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="draft">Bản nháp (Draft)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setModalType(null)} className="btn-outline-gray">Hủy bỏ</button>
                  <button type="submit" className="btn-solid">Lưu thay đổi</button>
                </div>
              </form>
            )}

            {/* Modal fields for Publication */}
            {modalType === 'pub' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveItem('pub', editingItem); }}>
                <div className="form-group">
                  <label className="form-label">Tên bài báo / Ấn phẩm (Paper Title) *</label>
                  <input type="text" required value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Danh sách Tác giả (Authors) *</label>
                  <input type="text" required value={editingItem.authors} onChange={(e) => setEditingItem({ ...editingItem, authors: e.target.value })} className="form-input" />
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Năm xuất bản (Year) *</label>
                    <input type="number" required value={editingItem.year} onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loại hình</label>
                    <select value={editingItem.publication_type} onChange={(e) => setEditingItem({ ...editingItem, publication_type: e.target.value })} className="form-select">
                      <option value="Journal">Journal (Tạp chí)</option>
                      <option value="Conference">Conference (Hội nghị)</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Book Chapter">Book Chapter</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Xếp hạng (Ranking Category)</label>
                    <input type="text" placeholder="Q1, CORE A*, Scopus..." value={editingItem.ranking_category || ''} onChange={(e) => setEditingItem({ ...editingItem, ranking_category: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nơi xuất bản / Venue (Journal / Conference name) *</label>
                  <input type="text" required value={editingItem.venue} onChange={(e) => setEditingItem({ ...editingItem, venue: e.target.value })} className="form-input" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Mã DOI</label>
                    <input type="text" value={editingItem.doi || ''} onChange={(e) => setEditingItem({ ...editingItem, doi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số trích dẫn kiểm chứng</label>
                    <input type="number" value={editingItem.citation_count || 0} onChange={(e) => setEditingItem({ ...editingItem, citation_count: Number(e.target.value) })} className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tóm tắt Abstract (EN)</label>
                  <textarea rows={3} value={editingItem.abstract_en || ''} onChange={(e) => setEditingItem({ ...editingItem, abstract_en: e.target.value })} className="form-textarea" />
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái xuất bản</label>
                  <select value={editingItem.status} onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })} className="form-select">
                    <option value="published">Đã xuất bản (Published)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setModalType(null)} className="btn-outline-gray">Hủy bỏ</button>
                  <button type="submit" className="btn-solid">Lưu ấn phẩm</button>
                </div>
              </form>
            )}

            {/* Modal fields for Team Member */}
            {modalType === 'team' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveItem('team', editingItem); }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input type="text" required value={editingItem.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Học hàm / Học vị (VI)</label>
                    <input type="text" placeholder="TS., ThS., KS., CN..." value={editingItem.title_vi || ''} onChange={(e) => setEditingItem({ ...editingItem, title_vi: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Chức vụ (VI) *</label>
                    <input type="text" required placeholder="Ví dụ: Đồng trưởng nhóm nghiên cứu, Trưởng nhóm..." value={editingItem.role_vi || ''} onChange={(e) => setEditingItem({ ...editingItem, role_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chức vụ (EN) *</label>
                    <input type="text" required placeholder="Ví dụ: Co-Lead Researcher, Research Fellow..." value={editingItem.role_en || ''} onChange={(e) => setEditingItem({ ...editingItem, role_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phân nhóm *</label>
                    <select value={editingItem.group_category || 'researchers'} onChange={(e) => setEditingItem({ ...editingItem, group_category: e.target.value })} className="form-select">
                      <option value="leadership">Ban Lãnh đạo & Sáng lập (Leadership)</option>
                      <option value="researchers">Thành viên & Cộng tác viên (Researchers)</option>
                      <option value="advisors">Hội đồng Cố vấn (Advisors)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thứ tự hiển thị (Order Index)</label>
                    <input type="number" value={editingItem.order_index ?? 0} onChange={(e) => setEditingItem({ ...editingItem, order_index: Number(e.target.value) })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Đơn vị công tác (VI)</label>
                    <input type="text" placeholder="Ví dụ: Viện Nghiên cứu NIRV, Trường ĐH KHTN..." value={editingItem.affiliation_vi || ''} onChange={(e) => setEditingItem({ ...editingItem, affiliation_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn vị công tác (EN)</label>
                    <input type="text" placeholder="Ví dụ: NIRV Research Community..." value={editingItem.affiliation_en || ''} onChange={(e) => setEditingItem({ ...editingItem, affiliation_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Định hướng nghiên cứu (VI)</label>
                    <input type="text" placeholder="Xử lý ngôn ngữ tự nhiên (NLP), Thị giác máy tính (CV)..." value={editingItem.research_interests_vi || ''} onChange={(e) => setEditingItem({ ...editingItem, research_interests_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Research Interests (EN)</label>
                    <input type="text" placeholder="Natural Language Processing (NLP), Computer Vision (CV)..." value={editingItem.research_interests_en || ''} onChange={(e) => setEditingItem({ ...editingItem, research_interests_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                {/* Field giới thiệu ngắn về thành viên */}
                <div className="form-group">
                  <label className="form-label">
                    Giới thiệu ngắn / Tiểu sử (VI) <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>★ Hiển thị trên thẻ thành viên</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Giới thiệu tóm tắt kinh nghiệm, quá trình đồng hành, đóng góp chuyên môn, vai trò tại NIRV..."
                    value={editingItem.bio_vi || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, bio_vi: e.target.value })}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Biography (EN)</label>
                  <textarea
                    rows={2}
                    placeholder="Short summary of background, contributions, or research role..."
                    value={editingItem.bio_en || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, bio_en: e.target.value })}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Email liên hệ</label>
                    <input type="email" placeholder="example@gmail.com" value={editingItem.email || ''} onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Google Scholar</label>
                    <input type="url" placeholder="https://scholar.google.com/..." value={editingItem.google_scholar || ''} onChange={(e) => setEditingItem({ ...editingItem, google_scholar: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input type="url" placeholder="https://github.com/..." value={editingItem.github || ''} onChange={(e) => setEditingItem({ ...editingItem, github: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ảnh chân dung thành viên</label>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#FAFBFD', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    {/* Live Circular Preview */}
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        minWidth: '90px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '3px solid var(--color-primary)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(238, 0, 51, 0.2)'
                      }}
                    >
                      {editingItem.avatar ? (
                        <img
                          src={editingItem.avatar}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                        />
                      ) : (
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {editingItem.name ? editingItem.name.slice(0, 2).toUpperCase() : 'NIRV'}
                        </span>
                      )}
                    </div>

                    {/* Upload button & URL input */}
                    <div style={{ flexGrow: 1 }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--color-border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                          marginBottom: '10px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <Upload size={16} color="var(--color-primary)" /> Chọn ảnh từ máy tính (Tự động canh tròn)
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const size = 400;
                                canvas.width = size;
                                canvas.height = size;
                                const ctx = canvas.getContext('2d');
                                const minDim = Math.min(img.width, img.height);
                                const sx = (img.width - minDim) / 2;
                                const sy = (img.height - minDim) / 2;
                                ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                                setEditingItem(prev => ({ ...prev, avatar: dataUrl }));
                              };
                              img.src = evt.target.result;
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        value={editingItem.avatar || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, avatar: e.target.value })}
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setModalType(null)} className="btn-outline-gray">Hủy bỏ</button>
                  <button type="submit" className="btn-solid">Lưu nhân sự</button>
                </div>
              </form>
            )}

            {/* Modal fields for Footprint Destination */}
            {modalType === 'footprint' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const geo = detectCountryGeo(editingItem);
                const updated = [...footprintList, {
                  ...editingItem,
                  country_code: editingItem.country_code || geo.code,
                  region: editingItem.region || geo.region,
                  x: editingItem.x ?? geo.x,
                  y: editingItem.y ?? geo.y,
                  id: 'dest-' + Date.now()
                }];
                await handleSaveFootprint(updated);
                setModalType(null);
              }}>
                {/* Visual continent & coordinate safety confirmation */}
                {(() => {
                  const geo = detectCountryGeo(editingItem);
                  const regionName = geo.region === 'asia' ? 'Châu Á (Asia & Pacific)' : geo.region === 'europe' ? 'Châu Âu (Europe)' : geo.region === 'americas' ? 'Châu Mỹ (Americas)' : 'Châu Phi (Africa)';
                  return (
                    <div style={{ backgroundColor: '#F0F5FF', border: '1px solid #ADC6FF', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.85rem', color: '#1D39C4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="var(--color-primary)" />
                      <span>Định vị lục địa chuẩn xác: <strong>{regionName}</strong> • Tọa độ bản đồ: <code>x: {geo.x}, y: {geo.y}</code></span>
                    </div>
                  );
                })()}

                <div className="form-group">
                  <label className="form-label">Chọn nhanh Quốc gia phổ biến (35+ nước gợi ý)</label>
                  <select
                    className="form-select"
                    onChange={(e) => {
                      const found = PRESET_DESTINATIONS.find(p => p.country_en === e.target.value);
                      if (found) {
                        setEditingItem({
                          ...editingItem,
                          country_code: found.country_code,
                          country_vi: found.country_vi,
                          country_en: found.country_en,
                          flag: found.flag,
                          region: found.region,
                          x: found.x,
                          y: found.y
                        });
                      }
                    }}
                  >
                    <option value="">-- Chọn quốc gia gợi ý sẵn --</option>
                    {PRESET_DESTINATIONS.map(p => (
                      <option key={p.country_en} value={p.country_en}>
                        {p.flag} {p.country_vi} ({p.country_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Quốc gia (VI) *</label>
                    <input type="text" required value={editingItem.country_vi} onChange={(e) => setEditingItem({ ...editingItem, country_vi: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quốc gia (EN) *</label>
                    <input type="text" required value={editingItem.country_en} onChange={(e) => setEditingItem({ ...editingItem, country_en: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Biểu tượng cờ (Emoji) *</label>
                    <input type="text" required value={editingItem.flag} onChange={(e) => setEditingItem({ ...editingItem, flag: e.target.value })} className="form-input" placeholder="🇺🇸" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thành phố *</label>
                    <input type="text" required value={editingItem.city_vi} onChange={(e) => setEditingItem({ ...editingItem, city_vi: e.target.value, city_en: e.target.value })} className="form-input" placeholder="San Francisco" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tên Hội nghị / Sự kiện (VI) *</label>
                    <input type="text" required value={editingItem.conference_vi} onChange={(e) => setEditingItem({ ...editingItem, conference_vi: e.target.value, conference_en: e.target.value })} className="form-input" placeholder="Hội nghị Quốc tế ACL 2026" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Năm báo cáo *</label>
                    <input type="text" required value={editingItem.year} onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })} className="form-input" placeholder="2026" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Số bài báo cáo</label>
                    <input type="number" min="1" value={editingItem.papersCount || 1} onChange={(e) => setEditingItem({ ...editingItem, papersCount: Number(e.target.value) })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đoàn nghiên cứu</label>
                    <input type="text" value={editingItem.delegation_vi || 'Đoàn nghiên cứu NIRV'} onChange={(e) => setEditingItem({ ...editingItem, delegation_vi: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Chủ đề / Đóng góp nghiên cứu</label>
                  <input type="text" value={editingItem.topic_vi || ''} onChange={(e) => setEditingItem({ ...editingItem, topic_vi: e.target.value, topic_en: e.target.value })} className="form-input" placeholder="Báo cáo phương pháp tối ưu hóa LLMs..." />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setModalType(null)} className="btn-outline-gray">Hủy bỏ</button>
                  <button type="submit" className="btn-solid">Lưu Vùng đất mới</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
