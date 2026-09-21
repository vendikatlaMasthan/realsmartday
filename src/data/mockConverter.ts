export interface ConversionPreset {
  id: string;
  sourceFormat: string;
  targetFormat: string;
  category: 'document' | 'image' | 'audio' | 'code';
  icon: string;
  badge?: string;
}

export interface RecentConversion {
  id: string;
  fileName: string;
  originalSize: string;
  convertedSize: string;
  fromType: string;
  toType: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
}

export const conversionPresets: ConversionPreset[] = [
  { id: '1', sourceFormat: 'PDF', targetFormat: 'DOCX', category: 'document', icon: 'document-text-outline', badge: 'AI OCR' },
  { id: '2', sourceFormat: 'MD', targetFormat: 'PDF', category: 'document', icon: 'reader-outline' },
  { id: '3', sourceFormat: 'PNG', targetFormat: 'WEBP', category: 'image', icon: 'image-outline', badge: 'Lossless' },
  { id: '4', sourceFormat: 'HEIC', targetFormat: 'JPEG', category: 'image', icon: 'camera-outline' },
  { id: '5', sourceFormat: 'M4A', targetFormat: 'MP3', category: 'audio', icon: 'mic-outline' },
  { id: '6', sourceFormat: 'JSON', targetFormat: 'CSV', category: 'code', icon: 'code-slash-outline', badge: 'Table' },
];

export const mockRecentConversions: RecentConversion[] = [
  {
    id: 'rc-1',
    fileName: 'Q3_Financial_Briefing.pdf',
    originalSize: '4.8 MB',
    convertedSize: '1.2 MB',
    fromType: 'PDF',
    toType: 'DOCX',
    timestamp: '15 mins ago',
    status: 'completed',
  },
  {
    id: 'rc-2',
    fileName: 'System_Architecture_Diagram.png',
    originalSize: '2.4 MB',
    convertedSize: '480 KB',
    fromType: 'PNG',
    toType: 'WEBP',
    timestamp: '2 hours ago',
    status: 'completed',
  },
  {
    id: 'rc-3',
    fileName: 'Voice_Memo_Sprint_Planning.m4a',
    originalSize: '18.2 MB',
    convertedSize: '6.4 MB',
    fromType: 'M4A',
    toType: 'MP3',
    timestamp: 'Yesterday',
    status: 'completed',
  },
];
