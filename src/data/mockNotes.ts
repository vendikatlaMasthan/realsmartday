export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'AI Summary' | 'Idea' | 'Meeting' | 'Architecture' | 'Personal';
  isPinned: boolean;
  hasAISummary?: boolean;
  updatedAt: string;
  wordCount: number;
}

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'SmartDay Architecture: Hybrid Cache & Local First',
    content:
      'Designing SmartDay with a local-first SQLite offline store backed by optimistic mutation queues. Key benefits:\n- Sub-16ms UI response time\n- Zero sync stalls on spotty network connections\n- AI contextual embeddings cached on-device for instant search relevance.',
    category: 'Architecture',
    isPinned: true,
    hasAISummary: true,
    updatedAt: '12 mins ago',
    wordCount: 164,
  },
  {
    id: 'note-2',
    title: 'AI Synthesis: Team Retro Key Takeaways',
    content:
      'Key findings from sprint 24:\n1. Mobile bundle payload reduced by 34% after tree-shaking asset loaders.\n2. Design token consistency improved cross-platform contrast audit score to 99.4%.\n3. Action item: Implement floating tab blur navigation for iOS/Android.',
    category: 'AI Summary',
    isPinned: true,
    hasAISummary: true,
    updatedAt: '2 hours ago',
    wordCount: 118,
  },
  {
    id: 'note-3',
    title: 'Voice Note Transcript: Micro-habits Stacking',
    content:
      'Concept notes on James Clear habit loop: Tie habit cue to existing ritual (e.g. coffee brewing -> 2 mins priority planning). Visual feedback in app must be immediate with micro-vibration.',
    category: 'Idea',
    isPinned: false,
    updatedAt: 'Yesterday',
    wordCount: 89,
  },
  {
    id: 'note-4',
    title: 'Product Requirements: Universal File Converter',
    content:
      'Core specifications for in-app document & asset processing:\n- PDF to Docx, Markdown to PDF\n- Image format transcoding with lossless compression (WebP, PNG, JPEG)\n- Client-side pre-flight verification before dispatching AI synthesis engine.',
    category: 'Meeting',
    isPinned: false,
    updatedAt: 'Sep 8',
    wordCount: 142,
  },
  {
    id: 'note-5',
    title: 'Personal Learning: React Native New Architecture (Fabric)',
    content:
      'Notes on Fabric renderer and TurboModules C++ JSI bindings. Avoid serializing large JSON over legacy bridge; use direct memory pointers for instant 120Hz gesture response.',
    category: 'Architecture',
    isPinned: false,
    updatedAt: 'Sep 6',
    wordCount: 120,
  },
];
