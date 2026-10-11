import React from 'react';
import { DayRecord, FilterType } from '../types';

interface MonthGridProps {
  days: string[]; // 365 formatted dates 'YYYY-MM-DD'
  daysData: Record<string, DayRecord>;
  todayStr: string;
  selectedDate: string;
  onSelectDate: (d: string) => void;
  filter: FilterType;
  language: 'hi' | 'en';
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_HI = [
  'जनवरी (Jan)', 'फ़रवरी (Feb)', 'मार्च (Mar)', 'अप्रैल (Apr)', 'मई (May)', 'जून (Jun)',
  'जुलाई (Jul)', 'अगस्त (Aug)', 'सितंबर (Sep)', 'अक्टूबर (Oct)', 'नवंबर (Nov)', 'दिसंबर (Dec)'
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MonthGrid: React.FC<MonthGridProps> = ({
  days,
  daysData,
  todayStr,
  selectedDate,
  onSelectDate,
  filter,
  language,
}) => {
  const isHindi = language === 'hi';
  const monthNames = isHindi ? MONTH_NAMES_HI : MONTH_NAMES_EN;

  // Group days into months
  interface MonthGroup {
    key: string;
    monthIndex: number;
    year: number;
    startDayOfWeek: number;
    dates: string[];
  }

  const groups: MonthGroup[] = [];
  let currentGroup: MonthGroup | null = null;

  days.forEach((dateStr) => {
    const [y, m] = dateStr.split('-').map(Number);
    const key = `${y}-${m - 1}`;

    if (!currentGroup || currentGroup.key !== key) {
      const firstDate = new Date(y, m - 1, 1);
      currentGroup = {
        key,
        monthIndex: m - 1,
        year: y,
        startDayOfWeek: new Date(y, m - 1, Number(dateStr.split('-')[2])).getDay(),
        dates: [],
      };
      groups.push(currentGroup);
    }
    currentGroup.dates.push(dateStr);
  });

  return (
    <div className="space-y-6 pb-28">
      {groups.map((group) => {
        // First date of this month's slice in the 365 days
        const firstDateInGroup = new Date(
          Number(group.dates[0].split('-')[0]),
          Number(group.dates[0].split('-')[1]) - 1,
          Number(group.dates[0].split('-')[2])
        );
        const leadingBlanks = firstDateInGroup.getDay();

        // Count stats for this month
        let monthGood = 0;
        let monthBad = 0;
        group.dates.forEach((d) => {
          const rec = daysData[d];
          if (rec?.status === 'good') monthGood++;
          if (rec?.status === 'bad') monthBad++;
        });

        return (
          <section
            key={group.key}
            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm transition hover:border-slate-700/80"
          >
            {/* Month Header */}
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <span>{monthNames[group.monthIndex]} {group.year}</span>
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-medium">
                {monthGood > 0 && (
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{monthGood}
                  </span>
                )}
                {monthBad > 0 && (
                  <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    -{monthBad}
                  </span>
                )}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Weekday headers */}
              {WEEKDAYS.map((w, idx) => (
                <div
                  key={idx}
                  className="text-center text-[10px] sm:text-xs font-semibold text-slate-500 py-1"
                >
                  {w}
                </div>
              ))}

              {/* Leading Empty Cells */}
              {Array.from({ length: leadingBlanks }).map((_, idx) => (
                <div key={`blank-${idx}`} className="aspect-square" />
              ))}

              {/* Days */}
              {group.dates.map((dStr) => {
                const dayNum = Number(dStr.split('-')[2]);
                const entry = daysData[dStr];
                const isGood = entry?.status === 'good';
                const isBad = entry?.status === 'bad';
                const hasNote = Boolean(entry?.note && entry.note.trim());
                const isToday = dStr === todayStr;
                const isSelected = dStr === selectedDate;
                const isFuture = dStr > todayStr;

                // Filter matching logic
                let matchesFilter = true;
                if (filter === 'good' && !isGood) matchesFilter = false;
                if (filter === 'bad' && !isBad) matchesFilter = false;
                if (filter === 'notes' && !hasNote) matchesFilter = false;
                if (filter === 'unmarked' && (isGood || isBad)) matchesFilter = false;

                // Color styling
                let btnStyle = 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/50';
                if (isGood) {
                  btnStyle = 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 border-emerald-400/80 hover:bg-emerald-400';
                } else if (isBad) {
                  btnStyle = 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20 border-rose-400/80 hover:bg-rose-400';
                }

                if (isFuture) {
                  btnStyle = 'bg-slate-900/40 text-slate-600 border border-slate-800/40 cursor-not-allowed';
                }

                return (
                  <button
                    key={dStr}
                    id={`day-${dStr}`}
                    disabled={isFuture}
                    onClick={() => onSelectDate(dStr)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${btnStyle} ${
                      isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10' : ''
                    } ${
                      isToday ? 'border-2 border-amber-400 ring-1 ring-amber-400/50' : ''
                    } ${!matchesFilter ? 'opacity-20 scale-95' : 'opacity-100'}`}
                    aria-label={`${dStr}, ${isGood ? 'Good' : isBad ? 'Bad' : 'Not marked'}${hasNote ? ', Has note' : ''}`}
                  >
                    <span>{dayNum}</span>

                    {/* Note indicator badge */}
                    {hasNote && (
                      <span
                        className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                          isGood || isBad ? 'bg-white' : 'bg-emerald-400'
                        }`}
                        title="Has note"
                      />
                    )}

                    {/* Today small sub-tag on desktop */}
                    {isToday && (
                      <span className="hidden sm:block text-[8px] font-extrabold uppercase leading-none text-amber-300 mt-0.5">
                        today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
