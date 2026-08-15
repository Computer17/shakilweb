export interface CountryCode {
  name: string;
  nameBn: string;
  code: string;
  dialCode: string;
  flag: string;
  sample: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'Bangladesh', nameBn: 'বাংলাদেশ', code: 'BD', dialCode: '+880', flag: '🇧🇩', sample: '01890193985' },
  { name: 'India', nameBn: 'ভারত', code: 'IN', dialCode: '+91', flag: '🇮🇳', sample: '9876543210' },
  { name: 'Saudi Arabia', nameBn: 'সৌদি আরব', code: 'SA', dialCode: '+966', flag: '🇸🇦', sample: '501234567' },
  { name: 'United Arab Emirates', nameBn: 'সংযুক্ত আরব আমিরাত (UAE)', code: 'AE', dialCode: '+971', flag: '🇦🇪', sample: '501234567' },
  { name: 'United States', nameBn: 'যুক্তরাষ্ট্র (USA)', code: 'US', dialCode: '+1', flag: '🇺🇸', sample: '2025550143' },
  { name: 'United Kingdom', nameBn: 'যুক্তরাজ্য (UK)', code: 'GB', dialCode: '+44', flag: '🇬🇧', sample: '7911123456' },
  { name: 'Kuwait', nameBn: 'কুয়েত', code: 'KW', dialCode: '+965', flag: '🇰🇼', sample: '91234567' },
  { name: 'Qatar', nameBn: 'কাতার', code: 'QA', dialCode: '+974', flag: '🇶🇦', sample: '33123456' },
  { name: 'Oman', nameBn: 'ওমান', code: 'OM', dialCode: '+968', flag: '🇴🇲', sample: '91234567' },
  { name: 'Bahrain', nameBn: 'বাহরাইন', code: 'BH', dialCode: '+973', flag: '🇧🇭', sample: '36001234' },
  { name: 'Malaysia', nameBn: 'মালয়েশিয়া', code: 'MY', dialCode: '+60', flag: '🇲🇾', sample: '123456789' },
  { name: 'Singapore', nameBn: 'সিঙ্গাপুর', code: 'SG', dialCode: '+65', flag: '🇸🇬', sample: '81234567' },
  { name: 'Pakistan', nameBn: 'পাকিস্তান', code: 'PK', dialCode: '+92', flag: '🇵🇰', sample: '3001234567' },
  { name: 'Canada', nameBn: 'কানাডা', code: 'CA', dialCode: '+1', flag: '🇨🇦', sample: '4165550198' },
  { name: 'Italy', nameBn: 'ইতালি', code: 'IT', dialCode: '+39', flag: '🇮🇹', sample: '3123456789' },
  { name: 'Germany', nameBn: 'জার্মানি', code: 'DE', dialCode: '+49', flag: '🇩🇪', sample: '15123456789' },
  { name: 'France', nameBn: 'ফ্রান্স', code: 'FR', dialCode: '+33', flag: '🇫🇷', sample: '612345678' },
  { name: 'Australia', nameBn: 'অস্ট্রেলিয়া', code: 'AU', dialCode: '+61', flag: '🇦🇺', sample: '412345678' },
  { name: 'Japan', nameBn: 'জাপান', code: 'JP', dialCode: '+81', flag: '🇯🇵', sample: '9012345678' },
  { name: 'South Korea', nameBn: 'দক্ষিণ কোরিয়া', code: 'KR', dialCode: '+82', flag: '🇰🇷', sample: '1012345678' },
  { name: 'Spain', nameBn: 'স্পেন', code: 'ES', dialCode: '+34', flag: '🇪🇸', sample: '612345678' },
  { name: 'Portugal', nameBn: 'পর্তুগাল', code: 'PT', dialCode: '+351', flag: '🇵🇹', sample: '912345678' },
  { name: 'Turkey', nameBn: 'তুরস্ক', code: 'TR', dialCode: '+90', flag: '🇹🇷', sample: '5012345678' },
  { name: 'Maldives', nameBn: 'মালদ্বীপ', code: 'MV', dialCode: '+960', flag: '🇲🇻', sample: '7912345' },
  { name: 'Nepal', nameBn: 'নেপাল', code: 'NP', dialCode: '+977', flag: '🇳🇵', sample: '9841234567' },
];

export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0]; // Bangladesh (+880)
