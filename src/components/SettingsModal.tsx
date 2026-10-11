import React, { useRef, useState } from 'react';
import { X, Calendar, Download, Upload, Trash2, Volume2, Globe, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { YearTrackerState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  onUpdateStartDate: (newDate: string) => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  state: YearTrackerState;
  onRestoreState: (state: YearTrackerState) => void;
  onResetAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  startDate,
  onUpdateStartDate,
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  state,
  onRestoreState,
  onResetAll,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isHindi = language === 'hi';

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `year_tracker_backup_${startDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.start && typeof parsed.days === 'object') {
          onRestoreState(parsed);
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Could not parse backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{isHindi ? 'Settings & Preferences' : 'Settings & Backup'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Start Date Setting */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              {isHindi ? 'Tracker Start Date (शुरुआती तारीख):' : 'Tracker Start Date (Day 1):'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                if (e.target.value) {
                  onUpdateStartDate(e.target.value);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              {isHindi
                ? 'Is date se agle 365 din ka calendar generate hota hai.'
                : 'Your 365-day tracking cycle begins on this date.'}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const year = new Date().getFullYear();
                onUpdateStartDate(`${year}-01-01`);
              }}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg text-xs text-slate-300 transition text-center"
            >
              Jan 1, {new Date().getFullYear()}
            </button>
            <button
              onClick={() => {
                const d = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                onUpdateStartDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
              }}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg text-xs text-slate-300 transition text-center"
            >
              {isHindi ? 'Aaj se shuru' : 'Today'}
            </button>
          </div>

          <hr className="border-slate-800" />

          {/* Language & Sound Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-medium text-slate-300">
                  {isHindi ? 'Bhasha (Language)' : 'Language'}
                </span>
              </div>
              <button
                onClick={onToggleLanguage}
                className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-750 transition"
              >
                {language === 'hi' ? 'हिंदी (Hinglish)' : 'English'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">
                  {isHindi ? 'Sound Feedback (आवाज़)' : 'Tactile Sound Effects'}
                </span>
              </div>
              <button
                onClick={onToggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {soundEnabled ? (isHindi ? 'On है' : 'Enabled') : (isHindi ? 'Off है' : 'Muted')}
              </button>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Backup & Restore */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 block">
              {isHindi ? 'Backup & Restore (डेटा सुरक्षा)' : 'Backup & Data Export'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isHindi ? 'Export JSON' : 'Export JSON'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isHindi ? 'Import JSON' : 'Import JSON'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            {importSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'Backup restore ho gaya!' : 'Data restored successfully!'}</span>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Reset All */}
          <div className="space-y-2 pt-1">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'Reset All (सारा डेटा मिटाएं)' : 'Reset All Progress'}</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{isHindi ? 'Kya aap sure hain?' : 'Are you absolutely sure?'}</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  {isHindi
                    ? 'Saare marked days aur notes permanently delete ho jayenge.'
                    : 'All marked days, streaks, and notes will be permanently erased.'}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onResetAll();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition"
                  >
                    {isHindi ? 'Haan, Delete Karein' : 'Yes, Erase All'}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition"
                  >
                    {isHindi ? 'Cancel' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
