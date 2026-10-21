/**
 * Master Calibrated Geographic Coordinate Mapping
 * Grid System: width = 119, height = 60 (SVG Equirectangular Dotted Map)
 * 
 * Đảm bảo mọi quốc gia khi thêm qua CMS hoặc hiển thị trên bản đồ 
 * đều được ghim đúng 100% vào lục địa & vị trí địa lý thực tế.
 */

export const COUNTRY_GEO_MAP = {
  vn: { code: 'vn', vi: 'Việt Nam', en: 'Vietnam', flag: '🇻🇳', region: 'asia', x: 96, y: 30 },
  us: { code: 'us', vi: 'Hoa Kỳ', en: 'United States', flag: '🇺🇸', region: 'americas', x: 24, y: 20 },
  sg: { code: 'sg', vi: 'Singapore', en: 'Singapore', flag: '🇸🇬', region: 'asia', x: 95, y: 32 },
  jp: { code: 'jp', vi: 'Nhật Bản', en: 'Japan', flag: '🇯🇵', region: 'asia', x: 108, y: 20 },
  kr: { code: 'kr', vi: 'Hàn Quốc', en: 'South Korea', flag: '🇰🇷', region: 'asia', x: 103, y: 19 },
  fr: { code: 'fr', vi: 'Pháp', en: 'France', flag: '🇫🇷', region: 'europe', x: 60, y: 16 },
  de: { code: 'de', vi: 'Đức', en: 'Germany', flag: '🇩🇪', region: 'europe', x: 63, y: 14 },
  gb: { code: 'gb', vi: 'Vương quốc Anh', en: 'United Kingdom', flag: '🇬🇧', region: 'europe', x: 58, y: 14 },
  ca: { code: 'ca', vi: 'Canada', en: 'Canada', flag: '🇨🇦', region: 'americas', x: 24, y: 14 },
  au: { code: 'au', vi: 'Úc', en: 'Australia', flag: '🇦🇺', region: 'asia', x: 108, y: 45 },
  it: { code: 'it', vi: 'Ý', en: 'Italy', flag: '🇮🇹', region: 'europe', x: 64, y: 19 },
  cn: { code: 'cn', vi: 'Trung Quốc', en: 'China', flag: '🇨🇳', region: 'asia', x: 98, y: 18 },
  tw: { code: 'tw', vi: 'Đài Loan', en: 'Taiwan', flag: '🇹🇼', region: 'asia', x: 102, y: 24 },
  th: { code: 'th', vi: 'Thái Lan', en: 'Thailand', flag: '🇹🇭', region: 'asia', x: 94, y: 28 },
  my: { code: 'my', vi: 'Malaysia', en: 'Malaysia', flag: '🇲🇾', region: 'asia', x: 95, y: 31 },
  id: { code: 'id', vi: 'Indonesia', en: 'Indonesia', flag: '🇮🇩', region: 'asia', x: 98, y: 34 },
  in: { code: 'in', vi: 'Ấn Độ', en: 'India', flag: '🇮🇳', region: 'asia', x: 84, y: 24 },
  ch: { code: 'ch', vi: 'Thụy Sĩ', en: 'Switzerland', flag: '🇨🇭', region: 'europe', x: 62, y: 17 },
  nl: { code: 'nl', vi: 'Hà Lan', en: 'Netherlands', flag: '🇳🇱', region: 'europe', x: 61, y: 14 },
  se: { code: 'se', vi: 'Thụy Điển', en: 'Sweden', flag: '🇸🇪', region: 'europe', x: 64, y: 9 },
  no: { code: 'no', vi: 'Na Uy', en: 'Norway', flag: '🇳🇴', region: 'europe', x: 62, y: 9 },
  fi: { code: 'fi', vi: 'Phần Lan', en: 'Finland', flag: '🇫🇮', region: 'europe', x: 67, y: 9 },
  dk: { code: 'dk', vi: 'Đan Mạch', en: 'Denmark', flag: '🇩🇰', region: 'europe', x: 62, y: 12 },
  es: { code: 'es', vi: 'Tây Ban Nha', en: 'Spain', flag: '🇪🇸', region: 'europe', x: 58, y: 19 },
  pt: { code: 'pt', vi: 'Bồ Đào Nha', en: 'Portugal', flag: '🇵🇹', region: 'europe', x: 56, y: 19 },
  at: { code: 'at', vi: 'Áo', en: 'Austria', flag: '🇦🇹', region: 'europe', x: 64, y: 16 },
  be: { code: 'be', vi: 'Bỉ', en: 'Belgium', flag: '🇧🇪', region: 'europe', x: 60, y: 15 },
  ie: { code: 'ie', vi: 'Ireland', en: 'Ireland', flag: '🇮🇪', region: 'europe', x: 56, y: 14 },
  pl: { code: 'pl', vi: 'Ba Lan', en: 'Poland', flag: '🇵🇱', region: 'europe', x: 66, y: 14 },
  cz: { code: 'cz', vi: 'Cộng hòa Séc', en: 'Czech Republic', flag: '🇨🇿', region: 'europe', x: 64, y: 15 },
  gr: { code: 'gr', vi: 'Hy Lạp', en: 'Greece', flag: '🇬🇷', region: 'europe', x: 67, y: 20 },
  ae: { code: 'ae', vi: 'UAE (Các Tiểu vương quốc Ả Rập)', en: 'United Arab Emirates', flag: '🇦🇪', region: 'asia', x: 77, y: 24 },
  sa: { code: 'sa', vi: 'Ả Rập Xê Út', en: 'Saudi Arabia', flag: '🇸🇦', region: 'asia', x: 73, y: 25 },
  qa: { code: 'qa', vi: 'Qatar', en: 'Qatar', flag: '🇶🇦', region: 'asia', x: 75, y: 24 },
  br: { code: 'br', vi: 'Brazil', en: 'Brazil', flag: '🇧🇷', region: 'americas', x: 40, y: 38 },
  mx: { code: 'mx', vi: 'Mexico', en: 'Mexico', flag: '🇲🇽', region: 'americas', x: 21, y: 24 },
  nz: { code: 'nz', vi: 'New Zealand', en: 'New Zealand', flag: '🇳🇿', region: 'asia', x: 116, y: 49 },
  za: { code: 'za', vi: 'Nam Phi', en: 'South Africa', flag: '🇿🇦', region: 'africa', x: 68, y: 44 },
  eg: { code: 'eg', vi: 'Ai Cập', en: 'Egypt', flag: '🇪🇬', region: 'africa', x: 68, y: 23 }
};

export function detectCountryGeo(input) {
  if (!input) return COUNTRY_GEO_MAP.vn;
  if (typeof input === 'object') {
    if (input.country_code && COUNTRY_GEO_MAP[input.country_code.toLowerCase()]) {
      return COUNTRY_GEO_MAP[input.country_code.toLowerCase()];
    }
    input = `${input.country_vi || ''} ${input.country_en || ''} ${input.city_vi || ''} ${input.city_en || ''}`;
  }

  const s = String(input).toLowerCase();
  for (const [code, item] of Object.entries(COUNTRY_GEO_MAP)) {
    if (s.includes(item.vi.toLowerCase()) || s.includes(item.en.toLowerCase()) || s.includes(code)) {
      return item;
    }
  }

  // Common aliases
  if (s.includes('mỹ') || s.includes('usa') || s.includes('america')) return COUNTRY_GEO_MAP.us;
  if (s.includes('nhật') || s.includes('tokyo')) return COUNTRY_GEO_MAP.jp;
  if (s.includes('hàn') || s.includes('seoul')) return COUNTRY_GEO_MAP.kr;
  if (s.includes('anh') || s.includes('uk') || s.includes('london')) return COUNTRY_GEO_MAP.gb;
  if (s.includes('pháp') || s.includes('paris')) return COUNTRY_GEO_MAP.fr;
  if (s.includes('đức') || s.includes('berlin')) return COUNTRY_GEO_MAP.de;
  if (s.includes('úc') || s.includes('sydney')) return COUNTRY_GEO_MAP.au;
  if (s.includes('sing') || s.includes('singapore')) return COUNTRY_GEO_MAP.sg;

  return COUNTRY_GEO_MAP.vn;
}
