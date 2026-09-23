# SmartDay

> **Mobile-First Personal Productivity & Student OS**  
> An offline-first, beautifully designed productivity suite built with Expo, React Native, and TypeScript. Seamlessly balances academic schedules, task management, focus sessions, habit rings, and AI-assisted daily briefings.

---

## Highlights & Capabilities

- **Smart Student Dashboard**: Today's Focus briefing, daily rings, upcoming class schedule with room locations, and countdown to exams.
- **AI-Powered Assistance**: Automatic task categorization (Work / Personal / Urgent), morning focus summaries, and natural timetable parsing powered by Google Gemini (`@google/genai`) with reliable offline rule fallbacks.
- **Deep Focus Sessions**: Configurable Pomodoro focus timer with task binding, fullscreen distraction-free view, and session history logging.
- **Timetable & Exam Tracker**: Import raw college timetables into structured class sessions; track exams with venue details and countdown timers.
- **Habits & Streak Rings**: Daily habit tracking with streak counters and visual multi-ring progress.
- **Quick Notes & Document Tools**: Fast markdown scratchpad linked to tasks, plus built-in document converter utilities.
- **4 Custom Presentation Skins**: Instant switching across 4 unique visual languages:
  - **Ember (Emerald Student OS)**: Deep forest academic palette designed for lecture and study environments.
  - **Halo**: Soft diffuse cards, floating dock, and clean sky-blue accents.
  - **Grove**: Organic topographic contour map styling with earth-olive tones.
  - **Noir**: Minimalist pure OLED deep slate with vibrant teal highlights.
- **Local-First & Private**: Works completely offline with local device persistence and one-click JSON data export/backup.
- **Web & Mobile Ready**: Desktop keyboard shortcuts (`N` for new task, `F` for focus, `/` for search) and responsive touch layouts for mobile and web.

---

## Architecture & Directory Structure

```text
├── App.tsx                     # Main application entry, navigation state, skin provider
├── app.json                    # Expo project configuration
├── index.ts                    # Application bootstrap
├── metadata.json               # Platform permissions and capabilities
├── package.json                # Dependencies and run scripts
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── assets/                 # Icons, backgrounds, and static media
    ├── components/
    │   ├── common/             # Reusable UI primitives (Buttons, Inputs, Cards)
    │   ├── files/              # File converter modal and document utilities
    │   ├── habits/             # Habit item cards, creation modals, and rings
    │   ├── home/               # Dashboard cards, schedule modals, AI focus header
    │   ├── navigation/         # Bottom tab bar and floating action controls
    │   ├── notes/              # Quick note modals and markdown scratchpad
    │   ├── tasks/              # Task cards, filter chips, and checkbox items
    │   └── ui/                 # Focus session modal, search dialog, toast alerts
    ├── context/
    │   ├── SmartDayContext.tsx # Central app state (tasks, schedule, exams, habits, notes)
    │   └── ThemeContext.tsx    # Light/Dark mode state management
    ├── data/                   # Default configuration and initial seed data
    ├── i18n/                   # Multi-language translations and localization
    ├── screens/
    │   ├── HomeScreen.tsx      # Main student dashboard & daily overview
    │   ├── PlanScreen.tsx      # Schedule timeline, calendar view & timetable parser
    │   ├── TasksScreen.tsx     # Categorized task lists with filter quadrants
    │   ├── SessionsScreen.tsx  # Focus timer, Pomodoro intervals & history
    │   ├── HabitsScreen.tsx    # Habit tracking and streak analysis
    │   ├── NotesScreen.tsx     # Notes library, pinning, and search
    │   ├── MetricsScreen.tsx   # Productivity charts, focus heatmaps & reports
    │   └── YouScreen.tsx       # User profile, theme/skin selector, data export
    ├── services/
    │   └── aiService.ts        # Gemini API integration and deterministic offline fallbacks
    ├── skins/
    │   ├── SkinContext.tsx     # Dynamic skin provider with animated transitions
    │   └── types.ts            # Color palettes, radii, and themes (Ember, Halo, Grove, Noir)
    ├── storage/
    │   ├── index.ts            # Persistent storage engine with JSON serialization
    │   └── seedData.ts         # Pre-loaded academic records, courses, and schedules
    └── types/
        └── index.ts            # TypeScript data contracts and interface definitions
```

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Expo (v57)** | Cross-platform runtime for Web, Android, and iOS |
| **React Native (0.86)** | Core native UI primitives and responsive layout |
| **React 19** | Concurrent rendering and modern state patterns |
| **TypeScript (v6)** | End-to-end type safety and domain models |
| **@google/genai** | Gemini 3.8 Flash integration for AI categorization & daily summaries |
| **@expo/vector-icons** | Consistent iconography across platforms |
| **expo-linear-gradient** | Smooth card and hero gradients |
| **Local Storage** | Zero-latency on-device data persistence |

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `bun` package manager

### 2. Installation

Clone or extract the repository, then install project dependencies:

```bash
npm install
```

### 3. Environment Variables (Optional)

To enable Gemini-powered features (smart task classification, automated daily focus summaries, and AI news digestion), create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: An API key is completely optional. If no key is configured, SmartDay seamlessly switches to built-in deterministic heuristic algorithms so all features continue working offline.

### 4. Running the Development Server

Start the application on port 3000:

```bash
npm run dev
```

You can open the web preview in your browser at `http://localhost:3000` or run it on device emulators:

```bash
# Android
npm run android

# iOS
npm run ios

# Web export build
npm run build
```

---

## Keyboard Shortcuts (Web / Desktop)

When viewing SmartDay on desktop or web, the following global hotkeys are enabled:

- `N` — Open **New Task** modal
- `F` — Start **Focus Session**
- `/` — Focus global **Search** bar
- `Esc` — Close open modal or dialog

---

## Data Privacy & Export

All user data (tasks, course schedules, exams, notes, habits, and focus logs) is stored locally on device. You can export or backup your entire workspace anytime via **You > Data Management > Export JSON Data**.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
