import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export type DateRangePreset =
  | 'last-7d'
  | 'last-14d'
  | 'last-30d'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'last-90d'
  | 'custom';

export interface DateRangeSelection {
  preset: DateRangePreset;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  label: string;
}

interface DateRangePickerProps {
  selection: DateRangeSelection;
  onChange: (newSelection: DateRangeSelection) => void;
  minDate?: string;
  maxDate?: string;
}

// Helpers for dates (YYYY-MM-DD format)
const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateStr = (str: string): Date => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const computePresetRange = (preset: DateRangePreset): { startDate: string; endDate: string; label: string } => {
  const now = new Date();
  const todayStr = toDateStr(now);

  switch (preset) {
    case 'last-7d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { startDate: toDateStr(d), endDate: todayStr, label: 'Last 7 Days' };
    }
    case 'last-14d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 13);
      return { startDate: toDateStr(d), endDate: todayStr, label: 'Last 14 Days' };
    }
    case 'last-30d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { startDate: toDateStr(d), endDate: todayStr, label: 'Last 30 Days' };
    }
    case 'this-week': {
      const currentDay = now.getDay(); // 0 is Sunday
      // Let's assume week starts on Monday (or Sunday)
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + diffToMonday);
      return { startDate: toDateStr(startOfWeek), endDate: todayStr, label: 'This Week' };
    }
    case 'last-week': {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() + diffToMonday - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return { startDate: toDateStr(startOfLastWeek), endDate: toDateStr(endOfLastWeek), label: 'Last Week' };
    }
    case 'this-month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: toDateStr(startOfMonth), endDate: todayStr, label: `${now.toLocaleString('en-US', { month: 'long' })} (MTD)` };
    }
    case 'last-month': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const monthName = startOfLastMonth.toLocaleString('en-US', { month: 'long' });
      return { startDate: toDateStr(startOfLastMonth), endDate: toDateStr(endOfLastMonth), label: `${monthName} (Full Month)` };
    }
    case 'last-90d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 89);
      return { startDate: toDateStr(d), endDate: todayStr, label: 'Last 90 Days (Quarter)' };
    }
    default:
      return { startDate: todayStr, endDate: todayStr, label: 'Custom Range' };
  }
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selection,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar View month navigation
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    return selection.startDate ? parseDateStr(selection.startDate) : new Date();
  });

  // Temporary selection while custom picking
  const [tempStart, setTempStart] = useState<string>(selection.startDate);
  const [tempEnd, setTempEnd] = useState<string>(selection.endDate);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sync temp dates when selection changes externally
  useEffect(() => {
    setTempStart(selection.startDate);
    setTempEnd(selection.endDate);
  }, [selection]);

  const handleApplyPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') return;
    const computed = computePresetRange(preset);
    onChange({
      preset,
      startDate: computed.startDate,
      endDate: computed.endDate,
      label: computed.label,
    });
    setTempStart(computed.startDate);
    setTempEnd(computed.endDate);
    setIsOpen(false);
  };

  // Calendar day clicking logic for custom range
  const handleDayClick = (dayStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      // Start a new range selection
      setTempStart(dayStr);
      setTempEnd('');
    } else if (tempStart && !tempEnd) {
      // Completing the range
      if (dayStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dayStr);
      } else {
        setTempEnd(dayStr);
      }
    }
  };

  const handleApplyCustom = () => {
    if (!tempStart) return;
    const finalEnd = tempEnd || tempStart;
    const startObj = parseDateStr(tempStart);
    const endObj = parseDateStr(finalEnd);
    const label = `${startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    onChange({
      preset: 'custom',
      startDate: tempStart,
      endDate: finalEnd,
      label,
    });
    setIsOpen(false);
  };

  // Generate calendar days for current viewMonth
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(year, month - 1, day);
    calendarDays.push({ dateStr: toDateStr(d), dayNum: day, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    calendarDays.push({ dateStr: toDateStr(d), dayNum: i, isCurrentMonth: true });
  }

  // Next month padding days to complete grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    calendarDays.push({ dateStr: toDateStr(d), dayNum: i, isCurrentMonth: false });
  }

  const presetsList: { id: DateRangePreset; title: string; category: 'Standard' | 'Weeks' | 'Months' }[] = [
    { id: 'last-7d', title: 'Last 7 Days', category: 'Standard' },
    { id: 'last-14d', title: 'Last 14 Days', category: 'Standard' },
    { id: 'last-30d', title: 'Last 30 Days (Default)', category: 'Standard' },
    { id: 'last-90d', title: 'Last 90 Days (Quarter)', category: 'Standard' },
    { id: 'this-week', title: 'This Week (Mon - Sun)', category: 'Weeks' },
    { id: 'last-week', title: 'Last Week (Completed)', category: 'Weeks' },
    { id: 'this-month', title: 'This Month (Current MTD)', category: 'Months' },
    { id: 'last-month', title: 'Last Month (Previous Full)', category: 'Months' },
  ];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 shadow-sm ${
          isOpen
            ? 'bg-slate-900 border-cyan-400 text-white ring-2 ring-cyan-500/20'
            : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-200'
        }`}
        title="Filter dashboard trends by specific week, month, or custom date range"
      >
        <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <CalendarIcon className="h-3.5 w-3.5" />
        </div>

        <div className="text-left">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Date Range Filter
          </span>
          <span className="font-extrabold text-cyan-300 flex items-center gap-1.5">
            <span>{selection.label}</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              ({selection.startDate} → {selection.endDate})
            </span>
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-[340px] sm:w-[540px] rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-4 sm:p-5 text-xs text-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Title */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="font-extrabold text-white text-sm">Select Analytics Date Window</span>
            </div>
            <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              {tempStart ? tempStart : 'Start'} → {tempEnd ? tempEnd : (hoverDate && tempStart ? hoverDate : 'End')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Quick Preset Buttons (Left column) */}
            <div className="sm:col-span-5 space-y-3 sm:border-r sm:border-slate-800/80 sm:pr-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>Quick Presets:</span>
              </div>

              {/* Standard presets */}
              <div className="space-y-1">
                {presetsList.map((p) => {
                  const isSelected = selection.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      {isSelected && <Check className="h-3 w-3 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Calendar for Custom Weeks & Months (Right column) */}
            <div className="sm:col-span-7 space-y-3">
              {/* Month navigation bar */}
              <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="font-extrabold text-white text-xs">
                  {viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>

                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day names row */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, idx) => {
                  const effectiveEnd = tempEnd || (hoverDate && tempStart ? (hoverDate > tempStart ? hoverDate : tempStart) : '');
                  const effectiveStart = tempStart && hoverDate && !tempEnd && hoverDate < tempStart ? hoverDate : tempStart;

                  const isStart = d.dateStr === tempStart;
                  const isEnd = d.dateStr === tempEnd;
                  const isInRange =
                    effectiveStart &&
                    effectiveEnd &&
                    d.dateStr >= effectiveStart &&
                    d.dateStr <= effectiveEnd;

                  const isToday = d.dateStr === toDateStr(new Date());

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDayClick(d.dateStr)}
                      onMouseEnter={() => {
                        if (tempStart && !tempEnd) {
                          setHoverDate(d.dateStr);
                        }
                      }}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                        isStart || isEnd
                          ? 'bg-cyan-500 text-slate-950 font-black z-10 shadow-sm shadow-cyan-500/30'
                          : isInRange
                          ? 'bg-cyan-500/20 text-cyan-200 rounded-none'
                          : d.isCurrentMonth
                          ? 'text-slate-200 hover:bg-slate-800'
                          : 'text-slate-600 hover:bg-slate-900'
                      } ${isToday && !isStart && !isEnd ? 'border border-cyan-500/40 text-cyan-400' : ''}`}
                    >
                      {d.dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Quick Specific Month Selector Shortcuts */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                <span className="text-slate-500 shrink-0">Month Shortcuts:</span>
                {[0, 1, 2].map((monthsAgo) => {
                  const targetMonth = new Date(new Date().getFullYear(), new Date().getMonth() - monthsAgo, 1);
                  const mName = targetMonth.toLocaleString('en-US', { month: 'short' });
                  return (
                    <button
                      key={monthsAgo}
                      type="button"
                      onClick={() => {
                        const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
                        const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
                        const sStr = toDateStr(start);
                        const eStr = toDateStr(end);
                        onChange({
                          preset: 'custom',
                          startDate: sStr,
                          endDate: eStr,
                          label: `${targetMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
                        });
                        setTempStart(sStr);
                        setTempEnd(eStr);
                        setIsOpen(false);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 cursor-pointer shrink-0 font-semibold"
                    >
                      {mName} {targetMonth.getFullYear()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                handleApplyPreset('last-30d');
              }}
              className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Default (30d)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCustom}
                disabled={!tempStart}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-40"
              >
                Apply Date Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
