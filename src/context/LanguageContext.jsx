import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LanguageContext = createContext();

export const translations = {
  vi: {
    // Exact Required Navigation Labels
    nav: {
      about: 'VỀ NIRV',
      social: 'ĐÓNG GÓP XÃ HỘI',
      news: 'TIN TỨC & SỰ KIỆN',
      publications: 'ẤN PHẨM',
      team: 'ĐỘI NGŨ'
    },
    // Common
    common: {
      readMore: 'Xem chi tiết',
      viewAll: 'Xem tất cả',
      explore: 'Khám phá ngay',
      search: 'Tìm kiếm...',
      filter: 'Bộ lọc',
      clearFilter: 'Xóa bộ lọc',
      all: 'Tất cả',
      loading: 'Đang tải dữ liệu...',
      noData: 'Không tìm thấy dữ liệu phù hợp.',
      back: 'Quay lại',
      share: 'Chia sẻ',
      publishedOn: 'Đăng ngày',
      updatedAt: 'Cập nhật',
      author: 'Tác giả',
      category: 'Chuyên mục',
      tags: 'Thẻ chủ đề',
      relatedContent: 'Nội dung liên quan'
    },
    // About NIRV
    about: {
      heroSub: 'VIỆN NGHIÊN CỨU ĐỔI MỚI & TRÍ TUỆ NHÂN TẠO',
      heroTitle: 'TIÊN PHONG NGHIÊN CỨU CÔNG NGHỆ LÕI VÌ SỰ TIẾN BỘ CỘNG ĐỒNG',
      heroDesc: 'Đổi mới sáng tạo, phát triển các giải pháp trí tuệ nhân tạo, khoa học dữ liệu và công nghệ số giải quyết các thách thức xã hội cấp bách.',
      visionTitle: 'TẦM NHÌN CHIẾN LƯỢC',
      missionTitle: 'SỨ MỆNH KHOA HỌC',
      keyResearchTitle: 'LĨNH VỰC NGHIÊN CỨU TRỌNG ĐIỂM',
      coreValuesTitle: 'GIÁ TRỊ CỐT LÕI',
      statsTitle: 'DẤU ẤN VÀ CHỈ SỐ HOẠT ĐỘNG',
      featuredSocialTitle: 'ĐÓNG GÓP XÃ HỘI NỔI BẬT',
      featuredNewsTitle: 'TIN TỨC & SỰ KIỆN MỚI NHẤT',
      featuredPubTitle: 'CÔNG BỐ KHOA HỌC MỚI XUẤT BẢN',
      teamPreviewTitle: 'HỘI ĐỒNG LÃNH ĐẠO & NHÀ KHOA HỌC',
      contactTitle: 'KẾT NỐI VỚI CHÚNG TÔI'
    },
    // Social Contribution
    social: {
      headerSub: 'TRÁCH NHIỆM & KIẾN TẠO XÃ HỘI SỐ',
      headerTitle: 'ĐÓNG GÓP XÃ HỘI VÀ PHÁT TRIỂN BỀN VỮNG',
      headerDesc: 'Các sáng kiến nghiên cứu ứng dụng công nghệ trực tiếp phục vụ sức khỏe, giáo dục bình đẳng và ứng phó biến đổi khí hậu.',
      targetBeneficiaries: 'Đối tượng thụ hưởng',
      verifiedOutcome: 'Kết quả & Tác động thực chứng',
      timeline: 'Tiến độ dự án',
      objectives: 'Mục tiêu chiến lược',
      gallery: 'Hình ảnh hoạt động thực địa',
      relatedNews: 'Tin tức liên quan đến sáng kiến'
    },
    // News & Events
    news: {
      headerSub: 'DÒNG THỜI SỰ & KHOA HỌC',
      headerTitle: 'TIN TỨC VÀ SỰ KIỆN',
      headerDesc: 'Cập nhật các hoạt động học thuật, hội nghị quốc tế và đột phá công nghệ mới nhất từ NIRV.',
      typeNews: 'Tin tức & Hoạt động',
      typeEvent: 'Sự kiện & Hội thảo',
      upcomingEvents: 'Sự kiện sắp diễn ra',
      pastEvents: 'Sự kiện đã tổ chức',
      eventDate: 'Thời gian',
      eventLocation: 'Địa điểm',
      registerEvent: 'Đăng ký tham dự',
      searchPlaceholder: 'Tìm kiếm bài viết, hội thảo, chuyên đề...'
    },
    // Publications
    publications: {
      headerSub: 'THƯ VIỆN NGHIÊN CỨU HỌC THUẬT',
      headerTitle: 'ẤN PHẨM & CÔNG BỐ KHOA HỌC',
      headerDesc: 'Hệ thống công trình nghiên cứu trên các tạp chí và hội nghị uy tín chuẩn quốc tế (Q1, CORE A*).',
      searchPlaceholder: 'Tìm kiếm theo tên bài báo, tác giả, hội nghị, từ khóa...',
      statsTotal: 'Tổng số công trình',
      statsCitations: 'Lượt trích dẫn ghi nhận',
      statsByYear: 'Phân bố theo năm xuất bản',
      statsByVenue: 'Phân loại nơi công bố',
      statsByRanking: 'Xếp hạng chất lượng khoa học',
      filterYear: 'Năm công bố',
      filterType: 'Loại hình ấn phẩm',
      filterRanking: 'Hạng xếp hạng (Ranking)',
      sortBy: 'Sắp xếp theo',
      sortNewest: 'Mới nhất',
      sortOldest: 'Cũ nhất',
      sortTitle: 'Tiêu đề A-Z',
      sortCitations: 'Số lượt trích dẫn',
      authors: 'Tác giả',
      venue: 'Nơi công bố',
      doi: 'Mã định danh DOI',
      citations: 'Trích dẫn',
      source: 'Nguồn',
      abstract: 'Tóm tắt (Abstract)',
      downloadPdf: 'Tải toàn văn PDF',
      viewPublisher: 'Xem trang xuất bản'
    },
    // Team
    team: {
      headerSub: 'NHÂN LỰC KHOA HỌC TINH HOA',
      headerTitle: 'ĐỘI NGŨ LÃNH ĐẠO & NHÀ KHOA HỌC',
      headerDesc: 'Hội tụ các chuyên gia, nhà khoa học hàng đầu với cam kết cống hiến vì sự nghiệp nghiên cứu phát triển.',
      leadership: 'Ban Lãnh đạo Viện',
      researchers: 'Nghiên cứu viên & Trưởng nhóm Khoa học',
      advisors: 'Hội đồng Cố vấn Quốc tế',
      researchInterests: 'Lĩnh vực nghiên cứu',
      bio: 'Tiểu sử khoa học',
      affiliation: 'Đơn vị công tác',
      profiles: 'Hồ sơ học thuật & Liên kết ngoài'
    },
    // Footer
    footer: {
      orgName: 'Viện Nghiên cứu Đổi mới & Trí tuệ Nhân tạo NIRV',
      addressLabel: 'Địa chỉ trụ sở',
      emailLabel: 'Email liên hệ',
      phoneLabel: 'Điện thoại',
      quickLinks: 'Liên kết nhanh',
      researchFocus: 'Trọng tâm nghiên cứu',
      copyright: 'Bản quyền © 2026 Viện Nghiên cứu NIRV. Mọi quyền được bảo lưu.'
    }
  },
  en: {
    // Exact Required Navigation Labels
    nav: {
      about: 'ABOUT NIRV',
      social: 'SOCIAL CONTRIBUTION',
      news: 'NEWS & EVENTS',
      publications: 'PUBLICATION',
      team: 'MY TEAM'
    },
    // Common
    common: {
      readMore: 'Read More',
      viewAll: 'View All',
      explore: 'Explore Now',
      search: 'Search...',
      filter: 'Filters',
      clearFilter: 'Clear Filters',
      all: 'All',
      loading: 'Loading data...',
      noData: 'No matching records found.',
      back: 'Back',
      share: 'Share',
      publishedOn: 'Published on',
      updatedAt: 'Updated',
      author: 'Author',
      category: 'Category',
      tags: 'Topic Tags',
      relatedContent: 'Related Content'
    },
    // About NIRV
    about: {
      heroSub: 'INSTITUTE OF RESEARCH & ARTIFICIAL INTELLIGENCE',
      heroTitle: 'PIONEERING FRONTIER RESEARCH FOR SOCIETAL ADVANCEMENT',
      heroDesc: 'Spearheading artificial intelligence, data science, and core digital technologies to address critical global and national challenges.',
      visionTitle: 'STRATEGIC VISION',
      missionTitle: 'SCIENTIFIC MISSION',
      keyResearchTitle: 'CORE RESEARCH DOMAINS',
      coreValuesTitle: 'CORE INSTITUTIONAL VALUES',
      statsTitle: 'KEY INSTITUTIONAL METRICS',
      featuredSocialTitle: 'FEATURED SOCIAL INITIATIVES',
      featuredNewsTitle: 'LATEST NEWS & EVENTS',
      featuredPubTitle: 'RECENT SCIENTIFIC PUBLICATIONS',
      teamPreviewTitle: 'LEADERSHIP & RESEARCH FACULTY',
      contactTitle: 'GET IN TOUCH WITH NIRV'
    },
    // Social Contribution
    social: {
      headerSub: 'RESPONSIBILITY & DIGITAL SOCIETY EMPOWERMENT',
      headerTitle: 'SOCIAL CONTRIBUTION & SUSTAINABILITY',
      headerDesc: 'Actionable research initiatives directly advancing public healthcare, educational equity, and climate resilience.',
      targetBeneficiaries: 'Beneficiaries',
      verifiedOutcome: 'Verified Impact & Outcomes',
      timeline: 'Project Timeline',
      objectives: 'Strategic Objectives',
      gallery: 'Fieldwork & Implementation Gallery',
      relatedNews: 'Related Initiative Updates'
    },
    // News & Events
    news: {
      headerSub: 'CURRENT AFFAIRS & DISCOVERIES',
      headerTitle: 'NEWS AND EVENTS',
      headerDesc: 'Latest scientific milestones, international symposia, and technology breakthroughs from NIRV.',
      typeNews: 'News & Activities',
      typeEvent: 'Events & Symposia',
      upcomingEvents: 'Upcoming Events',
      pastEvents: 'Past Events',
      eventDate: 'Date & Time',
      eventLocation: 'Location',
      registerEvent: 'Register for Event',
      searchPlaceholder: 'Search articles, symposia, workshops...'
    },
    // Publications
    publications: {
      headerSub: 'ACADEMIC RESEARCH REPOSITORY',
      headerTitle: 'PUBLICATIONS & SCHOLARLY WORKS',
      headerDesc: 'Rigorous research published in premier peer-reviewed international journals and conferences (Q1, CORE A*).',
      searchPlaceholder: 'Search by paper title, author, venue, keywords...',
      statsTotal: 'Total Works',
      statsCitations: 'Verified Citations',
      statsByYear: 'Publications by Year',
      statsByVenue: 'Publications by Venue Type',
      statsByRanking: 'Classification by Ranking',
      filterYear: 'Publication Year',
      filterType: 'Venue Type',
      filterRanking: 'Ranking Tier',
      sortBy: 'Sort By',
      sortNewest: 'Newest First',
      sortOldest: 'Oldest First',
      sortTitle: 'Title A-Z',
      sortCitations: 'Citation Count',
      authors: 'Authors',
      venue: 'Venue / Journal',
      doi: 'Digital Object Identifier (DOI)',
      citations: 'Citations',
      source: 'Source',
      abstract: 'Abstract',
      downloadPdf: 'Download PDF',
      viewPublisher: 'Publisher Link'
    },
    // Team
    team: {
      headerSub: 'DISTINGUISHED SCIENTIFIC FACULTY',
      headerTitle: 'LEADERSHIP & RESEARCH TEAM',
      headerDesc: 'Dedicated scientists, research leaders, and international fellows advancing technological sovereignty and knowledge.',
      leadership: 'Institute Leadership',
      researchers: 'Principal Investigators & Research Staff',
      advisors: 'International Advisory Board',
      researchInterests: 'Research Focus',
      bio: 'Scientific Biography',
      affiliation: 'Affiliation',
      profiles: 'Scholarly Profiles & External Links'
    },
    // Footer
    footer: {
      orgName: 'NIRV Institute of Research & Artificial Intelligence',
      addressLabel: 'Campus Address',
      emailLabel: 'Contact Email',
      phoneLabel: 'Telephone',
      quickLinks: 'Quick Links',
      researchFocus: 'Research Focus Areas',
      copyright: 'Copyright © 2026 NIRV Institute. All rights reserved.'
    }
  }
};

// Route matching for language switching
export const routeMap = {
  vi: {
    about: '/vi',
    social: '/vi/dong-gop-xa-hoi',
    news: '/vi/tin-tuc-su-kien',
    publications: '/vi/an-pham',
    team: '/vi/doi-ngu'
  },
  en: {
    about: '/en',
    social: '/en/social-contribution',
    news: '/en/news-events',
    publications: '/en/publication',
    team: '/en/my-team'
  }
};

export const LanguageProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect current language from pathname
  const isEn = location.pathname.startsWith('/en');
  const [lang, setLangState] = useState(isEn ? 'en' : 'vi');

  useEffect(() => {
    const currentIsEn = location.pathname.startsWith('/en');
    setLangState(currentIsEn ? 'en' : 'vi');
  }, [location.pathname]);

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      if (val && val[k] !== undefined) {
        val = val[k];
      } else {
        return key;
      }
    }
    return val;
  };

  // Switch language while preserving corresponding page route
  const switchLanguage = (targetLang) => {
    if (targetLang === lang) return;

    const pathname = location.pathname;
    let targetPath = `/${targetLang}`;

    // Map specific public sub-routes
    if (lang === 'vi') {
      if (pathname.startsWith('/vi/dong-gop-xa-hoi')) {
        const slug = pathname.replace('/vi/dong-gop-xa-hoi', '');
        targetPath = `/en/social-contribution${slug}`;
      } else if (pathname.startsWith('/vi/tin-tuc-su-kien')) {
        const slug = pathname.replace('/vi/tin-tuc-su-kien', '');
        targetPath = `/en/news-events${slug}`;
      } else if (pathname.startsWith('/vi/an-pham')) {
        targetPath = `/en/publication`;
      } else if (pathname.startsWith('/vi/doi-ngu')) {
        targetPath = `/en/my-team`;
      } else {
        targetPath = `/en`;
      }
    } else {
      if (pathname.startsWith('/en/social-contribution')) {
        const slug = pathname.replace('/en/social-contribution', '');
        targetPath = `/vi/dong-gop-xa-hoi${slug}`;
      } else if (pathname.startsWith('/en/news-events')) {
        const slug = pathname.replace('/en/news-events', '');
        targetPath = `/vi/tin-tuc-su-kien${slug}`;
      } else if (pathname.startsWith('/en/publication')) {
        targetPath = `/vi/an-pham`;
      } else if (pathname.startsWith('/en/my-team')) {
        targetPath = `/vi/doi-ngu`;
      } else {
        targetPath = `/vi`;
      }
    }

    setLangState(targetLang);
    navigate(targetPath);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, switchLanguage, routeMap }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
