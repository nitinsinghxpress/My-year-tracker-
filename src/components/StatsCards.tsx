import React from 'react';
import { Flame, CheckCircle2, XCircle, CalendarDays, Target, Filter } from 'lucide-react';
import { FilterType } from '../types';

interface StatsCardsProps {
  goodCount: number;
  badCount: number;
  currentDayNum: number;
  streak: number;
  bestStreak: number;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onJumpToToday: () => void;
  language: 'hi' | 'en';
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  goodCount,
  badCount,
  currentDayNum,
  streak,
  bestStreak,
  filter,
  onFilterChange,
  onJumpToToday,
  language,
}) => {
  const isHindi = language === 'hi';
  const totalRecorded = goodCount + badCount;
  const winRate = totalRecorded > 0 ? Math.round((goodCount / totalRecorded) * 100) : 0;
  const goodPct = Math.round((goodCount / 365) * 100);
  const badPct = Math.round((badCount / 365) * 100);

  return (
    <div className="space-y-4">
      {/* 4 Primary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Good Days */}
        <div className="bg-slate-900/90 border border-emerald-900/40 hover:border-emerald-500/50 rounded-xl p-3.5 transition group shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">{isHindi ? 'Good Days' : 'Good Days'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
              {goodCount}
            </span>
            <span className="text-[11px] text-slate-500">/ 365</span>
          </div>
          <span className="text-[11px] text-emerald-500/80 font-medium">
            {goodPct}% of year
          </span>
        </div>

        {/* Bad Days */}
        <div className="bg-slate-900/90 border border-rose-950/50 hover:border-rose-500/40 rounded-xl p-3.5 transition group shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">{isHindi ? 'Bad Days' : 'Bad Days'}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-rose-400 font-['Space_Grotesk']">
              {badCount}
            </span>
            <span className="text-[11px] text-slate-500">/ 365</span>
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium">
            {badPct}% of year
          </span>
        </div>

        {/* Day of 365 */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition group shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">{isHindi ? 'Aaj Ka Din' : 'Day of 365'}</span>
            <CalendarDays className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-100 font-['Space_Grotesk']">
              {currentDayNum}
            </span>
            <span className="text-[11px] text-slate-500">/ 365</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {Math.max(0, 365 - currentDayNum)} days left
          </span>
        </div>

        {/* Good Streak */}
        <div className="bg-slate-900/90 border border-amber-950/40 hover:border-amber-500/40 rounded-xl p-3.5 transition group shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">{isHindi ? 'Good Streak' : 'Current Streak'}</span>
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-400 font-['Space_Grotesk']">
              {streak}
            </span>
            <span className="text-[11px] text-slate-500">days</span>
          </div>
          <span className="text-[11px] text-amber-500/80 font-medium">
            Best: {bestStreak} days
          </span>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isHindi ? 'Year Progress:' : 'Year Progress:'}{' '}
              <strong className="text-slate-200">{goodCount + badCount}</strong> / 365 marked
            </span>
          </div>
          {totalRecorded > 0 && (
            <span className="text-emerald-400 font-semibold text-[11px]">
              {winRate}% {isHindi ? 'Good Ratio' : 'Positive Ratio'}
            </span>
          )}
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(goodCount / 365) * 100}%` }}
            title={`Good days: ${goodCount}`}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-300"
            style={{ width: `${(badCount / 365) * 100}%` }}
            title={`Bad days: ${badCount}`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {goodCount} Good
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> {badCount} Bad
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" /> {365 - totalRecorded} Unmarked
            </span>
          </div>
          <button
            onClick={onJumpToToday}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
          >
            {isHindi ? 'Aaj par jao' : 'Jump to Today'} →
          </button>
        </div>
      </div>

      {/* Filter and View Options */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>{isHindi ? 'Filter:' : 'Filter:'}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(['all', 'good', 'bad', 'unmarked', 'notes'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                filter === type
                  ? 'bg-slate-200 text-slate-900 font-bold shadow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {type === 'all' && (isHindi ? 'Sabhi (All)' : 'All')}
              {type === 'good' && (isHindi ? 'Sirf Good' : 'Good')}
              {type === 'bad' && (isHindi ? 'Sirf Bad' : 'Bad')}
              {type === 'unmarked' && (isHindi ? 'Pending' : 'Unmarked')}
              {type === 'notes' && (isHindi ? 'Notes wale' : 'With Notes')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
