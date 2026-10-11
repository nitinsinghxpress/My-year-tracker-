import React, { useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, RotateCcw, ChevronLeft, ChevronRight, PenLine, Sparkles } from 'lucide-react';
import { DayRecord } from '../types';

interface DayBottomSheetProps {
  selectedDate: string;
  todayStr: string;
  record: DayRecord | undefined;
  onMarkStatus: (status: 'good' | 'bad' | null) => void;
  onUpdateNote: (note: string) => void;
  onNavigateDay: (direction: 'prev' | 'next') => void;
  language: 'hi' | 'en';
}

export const DayBottomSheet: React.FC<DayBottomSheetProps> = ({
  selectedDate,
  todayStr,
  record,
  onMarkStatus,
  onUpdateNote,
  onNavigateDay,
  language,
}) => {
  const isHindi = language === 'hi';
  const isFuture = selectedDate > todayStr;
  const isToday = selectedDate === todayStr;

  const currentStatus = record?.status;
  const noteText = record?.note || '';

  // Format date nicely
  const [y, m, d] = selectedDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const niceDate = dateObj.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const textareaRef = useRef<HTMLInputElement>(null);

  return (
    <aside aria-label="Day Editor" className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Day Selector Header & Navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigateDay('prev')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-['Space_Grotesk']">
                  {niceDate}
                </span>
                {isToday && (
                  <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                    {isHindi ? 'आज (Today)' : 'Today'}
                  </span>
                )}
                {currentStatus === 'good' && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Good ✨
                  </span>
                )}
                {currentStatus === 'bad' && (
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                    Bad 🌧️
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigateDay('next')}
              disabled={isToday}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {isHindi ? 'Din mark karein:' : 'Mark day rating:'}
          </span>
        </div>

        {/* Action Buttons: Good, Bad, Clear */}
        <div className="grid grid-cols-3 gap-2">
          {/* Good Button */}
          <button
            disabled={isFuture}
            onClick={() => onMarkStatus(currentStatus === 'good' ? null : 'good')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-[0.98] ${
              currentStatus === 'good'
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-lg shadow-emerald-500/30'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/80 hover:text-white'
            } ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ThumbsUp className="w-4 h-4 shrink-0" />
            <span>{isHindi ? 'Good Day' : 'Good Day'}</span>
          </button>

          {/* Bad Button */}
          <button
            disabled={isFuture}
            onClick={() => onMarkStatus(currentStatus === 'bad' ? null : 'bad')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-[0.98] ${
              currentStatus === 'bad'
                ? 'bg-rose-500 text-white ring-2 ring-rose-300 shadow-lg shadow-rose-500/30'
                : 'bg-rose-950/60 text-rose-300 border border-rose-700/60 hover:bg-rose-900/80 hover:text-white'
            } ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ThumbsDown className="w-4 h-4 shrink-0" />
            <span>{isHindi ? 'Bad Day' : 'Bad Day'}</span>
          </button>

          {/* Clear Button */}
          <button
            disabled={isFuture || (!currentStatus && !noteText)}
            onClick={() => onMarkStatus(null)}
            className="py-3 px-2 sm:px-4 rounded-xl font-medium text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-35 disabled:hover:bg-slate-800/80"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>{isHindi ? 'Clear' : 'Clear'}</span>
          </button>
        </div>

        {/* Note Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <PenLine className="w-3.5 h-3.5" />
          </div>
          <input
            ref={textareaRef}
            type="text"
            disabled={isFuture}
            value={noteText}
            onChange={(e) => onUpdateNote(e.target.value)}
            placeholder={
              isFuture
                ? (isHindi ? 'Aane wale dino ka note nahi daal sakte' : 'Cannot log future dates yet')
                : (isHindi ? 'Din ke baare me short note (e.g. workout kiya, padhai, etc.)' : 'Short note for this day (optional)')
            }
            maxLength={200}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl pl-9 pr-14 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 transition disabled:opacity-40"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-slate-500 pointer-events-none font-mono">
            {noteText.length}/200
          </span>
        </div>
      </div>
    </aside>
  );
};
