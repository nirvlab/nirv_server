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
      noData: 'Hiện chưa có nội dung được công bố trong mục này.',
      noInitiatives: 'Các sáng kiến nghiên cứu cộng đồng đang trong giai đoạn phát triển và sẽ sớm được chia sẻ.',
      noNews: 'Hiện chưa có tin tức hoặc sự kiện mới. Vui lòng quay lại sau.',
      noPublications: 'Hệ thống công bố khoa học sẽ được cập nhật khi các công trình chính thức hoàn thiện.',
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
      heroSub: 'CỘNG ĐỒNG NGHIÊN CỨU TRÍ TUỆ NHÂN TẠO',
      heroTitle: 'NETWORK FOR INTELLIGENT RESEARCH VIETNAM',
      heroDesc: 'NIRV là cộng đồng kết nối những sinh viên và người trẻ quan tâm đến nghiên cứu trí tuệ nhân tạo, cùng tự do phát huy sức sáng tạo khoa học.',
      introTitle: 'VỀ CỘNG ĐỒNG NIRV',
      introStory: 'NIRV — Network for Intelligent Research Vietnam — là cộng đồng kết nối những sinh viên và người trẻ quan tâm đến nghiên cứu trí tuệ nhân tạo.\n\nChúng tôi tin rằng những người theo đuổi nghiên cứu độc lập, dù ở bất cứ đâu, đều xứng đáng có một nơi để kết nối, cùng làm việc, chia sẻ ý tưởng và tự do phát huy sức sáng tạo khoa học.\n\nVới định hướng nghiên cứu Xử lý ngôn ngữ tự nhiên (NLP), Thị giác máy tính (CV) và Mô hình ngôn ngữ lớn (LLMs), NIRV hướng đến việc góp phần xây dựng một cộng đồng nghiên cứu AI Việt Nam cởi mở, hợp tác và không ngừng phát triển.',
      visionTitle: 'TẦM NHÌN DÀI HẠN',
      missionTitle: 'SỨ MỆNH KẾT NỐI',
      keyResearchTitle: 'ĐỊNH HƯỚNG NGHIÊN CỨU TRỌNG TÂM',
      coreValuesTitle: 'TRIẾT LÝ HÀNH ĐỘNG',
      statsTitle: 'CHỈ SỐ CỘNG ĐỒNG',
      featuredSocialTitle: 'SÁNG KIẾN CỘNG ĐỒNG',
      featuredNewsTitle: 'HOẠT ĐỘNG MỚI NHẤT',
      featuredPubTitle: 'CÔNG BỐ KHOA HỌC',
      teamPreviewTitle: 'NGƯỜI SÁNG LẬP & THÀNH VIÊN',
      contactTitle: 'KẾT NỐI VỚI NIRV'
    },
    // Social Contribution
    social: {
      headerSub: 'SÁNG KIẾN VÌ CỘNG ĐỒNG',
      headerTitle: 'ĐÓNG GÓP XÃ HỘI & SỰ TIẾN BỘ CỘNG ĐỒNG',
      headerDesc: 'Các định hướng ứng dụng trí tuệ nhân tạo phụng sự cộng đồng, lan tỏa tri thức khoa học mở và hỗ trợ người trẻ làm nghiên cứu.',
      targetBeneficiaries: 'Đối tượng đồng hành',
      verifiedOutcome: 'Mục tiêu & Tác động kỳ vọng',
      timeline: 'Tiến độ hoạt động',
      objectives: 'Mục tiêu hoạt động',
      gallery: 'Hình ảnh hoạt động',
      relatedNews: 'Thông tin liên quan'
    },
    // News & Events
    news: {
      headerSub: 'THỜI SỰ & KHOA HỌC',
      headerTitle: 'TIN TỨC VÀ SỰ KIỆN',
      headerDesc: 'Cập nhật hoạt động học thuật, trao đổi chuyên môn và chia sẻ kiến thức nghiên cứu AI từ cộng đồng NIRV.',
      typeNews: 'Tin tức',
      typeEvent: 'Sự kiện & Sinh hoạt học thuật',
      upcomingEvents: 'Sự kiện sắp diễn ra',
      pastEvents: 'Sự kiện đã tổ chức',
      eventDate: 'Thời gian',
      eventLocation: 'Địa điểm',
      registerEvent: 'Đăng ký tham gia',
      searchPlaceholder: 'Tìm kiếm bài viết, chủ đề trao đổi...'
    },
    // Publications
    publications: {
      headerSub: 'ẤN PHẨM & CÔNG TRÌNH',
      headerTitle: 'CÔNG BỐ KHOA HỌC & NGHIÊN CỨU',
      headerDesc: 'Các bài báo khoa học, báo cáo chuyên đề và công trình nghiên cứu được các thành viên cộng đồng thực hiện và công bố.',
      searchPlaceholder: 'Tìm kiếm theo tên công trình, tác giả, hội nghị, từ khóa...',
      statsTotal: 'Tổng số công trình đã công bố',
      statsCitations: 'Lượt trích dẫn được ghi nhận',
      statsByYear: 'Phân bố theo năm',
      statsByVenue: 'Phân loại nơi công bố',
      statsByRanking: 'Phân loại xếp hạng',
      filterYear: 'Năm công bố',
      filterType: 'Loại hình',
      filterRanking: 'Hạng',
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
      downloadPdf: 'Tải PDF',
      viewPublisher: 'Xem trang xuất bản'
    },
    // Team
    team: {
      headerSub: 'CỘNG ĐỒNG NGHIÊN CỨU',
      headerTitle: 'NHÀ SÁNG LẬP & THÀNH VIÊN',
      headerDesc: 'Không gian kết nối những người trẻ đam mê nghiên cứu khoa học, cùng học hỏi, chia sẻ và phát triển các ý tưởng trí tuệ nhân tạo.',
      leadership: 'Nhà sáng lập cộng đồng',
      researchers: 'Thành viên & Cộng tác viên nghiên cứu',
      advisors: 'Cố vấn chuyên môn',
      researchInterests: 'Định hướng nghiên cứu',
      bio: 'Giới thiệu',
      affiliation: 'Đơn vị / Nơi hoạt động',
      profiles: 'Liên kết & Hồ sơ khoa học'
    },
    // Footer
    footer: {
      orgName: 'Cộng đồng Nghiên cứu NIRV — Network for Intelligent Research Vietnam',
      addressLabel: 'Địa điểm',
      emailLabel: 'Email liên hệ',
      phoneLabel: 'Điện thoại',
      quickLinks: 'Liên kết nhanh',
      researchFocus: 'Định hướng nghiên cứu',
      copyright: 'Bản quyền © 2026 NIRV — Network for Intelligent Research Vietnam. Mọi quyền được bảo lưu.'
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
      noData: 'No records are currently published in this section.',
      noInitiatives: 'Community research initiatives are currently under development and will be shared soon.',
      noNews: 'No news or events published at this moment. Please check back later.',
      noPublications: 'Scientific publications will be listed here as projects are formally completed.',
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
      heroSub: 'AI RESEARCH COMMUNITY',
      heroTitle: 'NETWORK FOR INTELLIGENT RESEARCH VIETNAM',
      heroDesc: 'NIRV is a research community connecting students and emerging researchers in artificial intelligence to freely develop scientific creativity.',
      introTitle: 'ABOUT THE NIRV COMMUNITY',
      introStory: 'NIRV — Network for Intelligent Research Vietnam — is a research community connecting students and emerging researchers interested in artificial intelligence.\n\nWe believe independent researchers, wherever they are, deserve a place to belong, collaborate, exchange ideas, and freely develop their scientific creativity.\n\nWith research interests spanning Natural Language Processing (NLP), Computer Vision (CV), and Large Language Models (LLMs), NIRV aspires to contribute to an open, collaborative, and growing AI research community in Vietnam.',
      visionTitle: 'COMMUNITY ASPIRATION',
      missionTitle: 'COMMUNITY MISSION',
      keyResearchTitle: 'RESEARCH FOCUS AREAS',
      coreValuesTitle: 'GUIDING PHILOSOPHY',
      statsTitle: 'COMMUNITY HIGHLIGHTS',
      featuredSocialTitle: 'COMMUNITY INITIATIVES',
      featuredNewsTitle: 'LATEST ACTIVITIES',
      featuredPubTitle: 'SCHOLARLY WORKS',
      teamPreviewTitle: 'FOUNDER & MEMBERS',
      contactTitle: 'CONNECT WITH NIRV'
    },
    // Social Contribution
    social: {
      headerSub: 'COMMUNITY CONTRIBUTION',
      headerTitle: 'SOCIAL CONTRIBUTION & ADVANCEMENT',
      headerDesc: 'Empowering emerging talent, disseminating open scientific knowledge, and exploring AI applications for societal benefit.',
      targetBeneficiaries: 'Community Partners',
      verifiedOutcome: 'Goals & Envisioned Impact',
      timeline: 'Activity Timeline',
      objectives: 'Key Objectives',
      gallery: 'Activity Gallery',
      relatedNews: 'Related Updates'
    },
    // News & Events
    news: {
      headerSub: 'ACTIVITIES & DISCUSSIONS',
      headerTitle: 'NEWS AND EVENTS',
      headerDesc: 'Academic discussions, knowledge sharing sessions, and research updates from the NIRV community.',
      typeNews: 'News',
      typeEvent: 'Events & Seminars',
      upcomingEvents: 'Upcoming Events',
      pastEvents: 'Past Events',
      eventDate: 'Date & Time',
      eventLocation: 'Location',
      registerEvent: 'Register for Event',
      searchPlaceholder: 'Search topics, articles, seminars...'
    },
    // Publications
    publications: {
      headerSub: 'RESEARCH REPOSITORY',
      headerTitle: 'PUBLICATIONS & SCHOLARLY WORKS',
      headerDesc: 'Peer-reviewed papers, scientific reports, and research works authored or co-authored by community members.',
      searchPlaceholder: 'Search by paper title, author, venue, keywords...',
      statsTotal: 'Total Verified Works',
      statsCitations: 'Recorded Citations',
      statsByYear: 'Publications by Year',
      statsByVenue: 'Publications by Venue Type',
      statsByRanking: 'Classification by Ranking Tier',
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
      headerSub: 'RESEARCH COMMUNITY',
      headerTitle: 'FOUNDER & COMMUNITY MEMBERS',
      headerDesc: 'A home for independent student researchers and emerging scholars to connect, collaborate, and grow together.',
      leadership: 'Community Founder',
      researchers: 'Research Members & Collaborators',
      advisors: 'Academic Mentors',
      researchInterests: 'Research Focus Areas',
      bio: 'Profile',
      affiliation: 'Affiliation / Activity Base',
      profiles: 'Scholarly Profiles & Links'
    },
    // Footer
    footer: {
      orgName: 'NIRV — Network for Intelligent Research Vietnam',
      addressLabel: 'Location',
      emailLabel: 'Contact Email',
      phoneLabel: 'Telephone',
      quickLinks: 'Quick Links',
      researchFocus: 'Research Focus Areas',
      copyright: 'Copyright © 2026 NIRV — Network for Intelligent Research Vietnam. All rights reserved.'
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
