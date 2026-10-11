import React from 'react';
import { Calendar, Download, Settings, Volume2, VolumeX, Sparkles, Globe } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onOpenAPK: () => void;
  onOpenSettings: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAPK,
  onOpenSettings,
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  isOnline,
}) => {
  const { isInstalled, isInstallable } = usePWAInstall();
  const isHindi = language === 'hi';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5 font-['Space_Grotesk']">
                My Year Tracker
              </h1>
              {!isOnline && (
                <span className="text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  Offline
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isHindi ? '365 Din Ka Habit & Life Journey' : '365-Day Daily Habit & Life Log'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* APK / Install Button */}
          <button
            onClick={onOpenAPK}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              isInstallable
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
            }`}
            title="Download APK / Install to Phone"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-bold">{isInstalled ? (isHindi ? 'APK Details' : 'App Installed') : 'APK / Install'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition flex items-center gap-1"
            title="Change Language (English / Hinglish)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
