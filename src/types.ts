export interface DayRecord {
  status?: 'good' | 'bad';
  note?: string;
  updatedAt?: string;
}

export interface YearTrackerState {
  start: string; // YYYY-MM-DD
  days: Record<string, DayRecord>; // keyed by YYYY-MM-DD
  theme?: 'dark' | 'light';
  soundEnabled?: boolean;
  language?: 'hi' | 'en';
}

export type FilterType = 'all' | 'good' | 'bad' | 'unmarked' | 'notes';
