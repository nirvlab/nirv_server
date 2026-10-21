/**
 * NIRV Global Footprint & Visited Locations Data
 * Dữ liệu hành trình các quốc gia và hội nghị khoa học của cộng đồng NIRV.
 * 
 * Trạng thái hiện tại: Đã làm sạch tạm thời (chỉ giữ Trụ sở khởi đầu Việt Nam).
 * Khi triển khai chính thức, ban quản trị có thể trực tiếp vào CMS (/admin)
 * hoặc thêm vào mảng visitedLocations dưới đây để báo cáo hội nghị mới.
 */

export const footprintStats = {
  countriesCount: 1,
  conferencesCount: 0,
  papersPresented: 0,
  collaboratorsCount: 0
};

export const visitedLocations = [
  {
    id: 'vn-hcm',
    country_vi: 'Việt Nam',
    country_en: 'Vietnam',
    flag: '🇻🇳',
    region: 'asia',
    city_vi: 'TP. Hồ Chí Minh & Hà Nội',
    city_en: 'Ho Chi Minh City & Hanoi',
    conference_vi: 'Cộng đồng Nghiên cứu NIRV (Trụ sở sáng lập & Điểm khởi đầu)',
    conference_en: 'NIRV Research Community (Founding Hub & Headquarters)',
    topic_vi: 'Không gian học thuật kết nối người trẻ đam mê nghiên cứu Trí tuệ Nhân tạo',
    topic_en: 'Open academic research network for emerging AI researchers in Vietnam',
    role_vi: 'Trụ sở chính & Đơn vị điều phối',
    role_en: 'Headquarters & Core Organizing Body',
    year: '2025 - 2026',
    date_vi: 'Khởi đầu',
    date_en: 'Inception',
    delegation_vi: 'Ban Nghiên cứu NIRV',
    delegation_en: 'NIRV Core Team',
    x: 97,
    y: 29,
    isHome: true,
    featured: true
  }
];
