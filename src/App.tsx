import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { MonthGrid } from './components/MonthGrid';
import { DayBottomSheet } from './components/DayBottomSheet';
import { APKModal } from './components/APKModal';
import { SettingsModal } from './components/SettingsModal';
import { useSound } from './hooks/useSound';
import { usePWAInstall } from './hooks/usePWAInstall';
import { YearTrackerState, DayRecord, FilterType } from './types';
import { Smartphone, Download, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'yearTracker.v1';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function App() {
  const todayStr = useMemo(() => fmtDate(new Date()), []);

  // Initialize state from localStorage
  const [state, setState] = useState<YearTrackerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.start) {
          // Normalize legacy structure where e.s was status and e.n was note
          const normalizedDays: Record<string, DayRecord> = {};
          if (parsed.days) {
            Object.keys(parsed.days).forEach((d) => {
              const item = parsed.days[d];
              if (item) {
                normalizedDays[d] = {
                  status: item.status || item.s || undefined,
                  note: item.note || item.n || undefined,
                };
              }
            });
          }
          return {
            start: parsed.start,
            days: normalizedDays,
            soundEnabled: parsed.soundEnabled ?? true,
            language: parsed.language || 'hi',
          };
        }
      }
    } catch {
      // Fallback
    }

    // Default start date is beginning of current year, or today
    const currentYear = new Date().getFullYear();
    const defaultStart = `${currentYear}-01-01`;

    return {
      start: defaultStart,
      days: {},
      soundEnabled: true,
      language: 'hi',
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const { playPop } = useSound(state.soundEnabled);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      // Save in compatible shape with user's original schema { start, days: { [ds]: { s, n, status, note } } }
      const persistentDays: Record<string, Record<string, unknown>> = {};
      Object.keys(state.days).forEach((d) => {
        const rec = state.days[d];
        if (rec && (rec.status || rec.note)) {
          persistentDays[d] = {
            s: rec.status,
            n: rec.note,
            status: rec.status,
            note: rec.note,
          };
        }
      });

      const payload = {
        start: state.start,
        days: persistentDays,
        soundEnabled: state.soundEnabled,
        language: state.language,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  // Online status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute 365 days range
  const daysRange = useMemo(() => {
    const s = parseDate(state.start);
    const out: string[] = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i);
      out.push(fmtDate(d));
    }
    return out;
  }, [state.start]);

  // Ensure selectedDate is valid
  useEffect(() => {
    if (!daysRange.includes(selectedDate)) {
      if (daysRange.includes(todayStr)) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(daysRange[0]);
      }
    }
  }, [daysRange, todayStr, selectedDate]);

  // Compute stats
  const { goodCount, badCount, currentDayNum, streak, bestStreak } = useMemo(() => {
    let g = 0;
    let b = 0;
    daysRange.forEach((d) => {
      const e = state.days[d];
      if (e?.status === 'good') g++;
      if (e?.status === 'bad') b++;
    });

    const idx = daysRange.indexOf(todayStr);
    const dayNum = idx >= 0 ? idx + 1 : todayStr < daysRange[0] ? 0 : 365;

    // Calculate current streak
    let curStreak = 0;
    let i = idx >= 0 ? idx : todayStr > daysRange[364] ? 364 : -1;
    // If today is not marked yet, allow streak calculation from yesterday
    if (i >= 0 && !state.days[daysRange[i]]?.status && daysRange[i] === todayStr) {
      i--;
    }
    for (; i >= 0; i--) {
      const e = state.days[daysRange[i]];
      if (e?.status === 'good') {
        curStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak in the year
    let maxStreak = 0;
    let run = 0;
    daysRange.forEach((d) => {
      if (d > todayStr) return;
      const e = state.days[d];
      if (e?.status === 'good') {
        run++;
        if (run > maxStreak) maxStreak = run;
      } else {
        run = 0;
      }
    });

    return {
      goodCount: g,
      badCount: b,
      currentDayNum: dayNum,
      streak: curStreak,
      bestStreak: Math.max(maxStreak, curStreak),
    };
  }, [daysRange, state.days, todayStr]);

  // Actions
  const handleMarkStatus = useCallback(
    (status: 'good' | 'bad' | null) => {
      playPop(status ? status : 'clear');
      setState((prev) => {
        const nextDays = { ...prev.days };
        const existing = nextDays[selectedDate] || {};
        if (status) {
          nextDays[selectedDate] = { ...existing, status };
        } else {
          if (existing.note) {
            nextDays[selectedDate] = { note: existing.note };
          } else {
            delete nextDays[selectedDate];
          }
        }
        return { ...prev, days: nextDays };
      });
    },
    [selectedDate, playPop]
  );

  const handleUpdateNote = useCallback(
    (note: string) => {
      setState((prev) => {
        const nextDays = { ...prev.days };
        const existing = nextDays[selectedDate] || {};
        if (note.trim()) {
          nextDays[selectedDate] = { ...existing, note };
        } else {
          if (existing.status) {
            nextDays[selectedDate] = { status: existing.status };
          } else {
            delete nextDays[selectedDate];
          }
        }
        return { ...prev, days: nextDays };
      });
    },
    [selectedDate]
  );

  const handleSelectDate = useCallback(
    (d: string) => {
      setSelectedDate(d);
      playPop('tap');
    },
    [playPop]
  );

  const handleNavigateDay = useCallback(
    (direction: 'prev' | 'next') => {
      playPop('tap');
      const currentIndex = daysRange.indexOf(selectedDate);
      if (currentIndex === -1) return;
      if (direction === 'prev' && currentIndex > 0) {
        setSelectedDate(daysRange[currentIndex - 1]);
      } else if (direction === 'next' && currentIndex < daysRange.length - 1) {
        const nextDate = daysRange[currentIndex + 1];
        if (nextDate <= todayStr) {
          setSelectedDate(nextDate);
        }
      }
    },
    [daysRange, selectedDate, todayStr, playPop]
  );

  const handleJumpToToday = useCallback(() => {
    playPop('tap');
    if (daysRange.includes(todayStr)) {
      setSelectedDate(todayStr);
      const el = document.getElementById(`day-${todayStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [daysRange, todayStr, playPop]);

  const handleToggleLanguage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      language: prev.language === 'hi' ? 'en' : 'hi',
    }));
  }, []);

  const handleToggleSound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const handleUpdateStartDate = useCallback(
    (newDate: string) => {
      setState((prev) => ({ ...prev, start: newDate }));
    },
    []
  );

  const handleRestoreState = useCallback((restored: YearTrackerState) => {
    setState({
      start: restored.start,
      days: restored.days || {},
      soundEnabled: restored.soundEnabled ?? true,
      language: restored.language || 'hi',
    });
  }, []);

  const handleResetAll = useCallback(() => {
    setState((prev) => ({ ...prev, days: {} }));
  }, []);

  const isHindi = state.language === 'hi';

  return (
    <div className="min-h-screen bg-[#0b1118] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Header
        onOpenAPK={() => setIsAPKModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        language={state.language || 'hi'}
        onToggleLanguage={handleToggleLanguage}
        soundEnabled={Boolean(state.soundEnabled)}
        onToggleSound={handleToggleSound}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 pt-5 pb-8 space-y-6">
        {/* Intro Subtitle & Motivation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {isHindi ? '365 Din Ka Habit & Progress Tracker' : '365-Day Consistency Challenge'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHindi
                ? 'Har din Good ya Bad mark karo. Apne saal ko behtareen banao.'
                : 'Log every single day as Good or Bad. Track your consistency all year.'}
            </p>
          </div>

          {/* Quick Install Banner for Mobile users */}
          <button
            onClick={() => setIsAPKModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-semibold text-emerald-400 transition shrink-0 group"
          >
            <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span>{isHindi ? 'Android APK / App Install Karein' : 'Get Android APK / Install App'}</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded">
              PWA
            </span>
          </button>
        </div>

        {/* Stats & Progress Section */}
        <StatsCards
          goodCount={goodCount}
          badCount={badCount}
          currentDayNum={currentDayNum}
          streak={streak}
          bestStreak={bestStreak}
          filter={filter}
          onFilterChange={setFilter}
          onJumpToToday={handleJumpToToday}
          language={state.language || 'hi'}
        />

        {/* 12-Month Calendar Grid */}
        <MonthGrid
          days={daysRange}
          daysData={state.days}
          todayStr={todayStr}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          filter={filter}
          language={state.language || 'hi'}
        />
      </main>

      {/* Floating Day Action Bottom Sheet */}
      <DayBottomSheet
        selectedDate={selectedDate}
        todayStr={todayStr}
        record={state.days[selectedDate]}
        onMarkStatus={handleMarkStatus}
        onUpdateNote={handleUpdateNote}
        onNavigateDay={handleNavigateDay}
        language={state.language || 'hi'}
      />

      {/* Android APK Modal */}
      <APKModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
        language={state.language || 'hi'}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        startDate={state.start}
        onUpdateStartDate={handleUpdateStartDate}
        language={state.language || 'hi'}
        onToggleLanguage={handleToggleLanguage}
        soundEnabled={Boolean(state.soundEnabled)}
        onToggleSound={handleToggleSound}
        state={state}
        onRestoreState={handleRestoreState}
        onResetAll={handleResetAll}
      />
    </div>
  );
}
