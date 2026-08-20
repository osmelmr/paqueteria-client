import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  title?: string;
  ariaLabel?: string;
  required?: boolean;
  className?: string;
  popoverClassName?: string;
  icon?: ReactNode;
}

function parseValue(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string): string {
  const d = parseValue(value);
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Seleccionar fecha',
  title,
  ariaLabel,
  required = false,
  className = '',
  popoverClassName = '',
  icon,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = parseValue(value);
  const minDate = min ? startOfDay(parseValue(min) ?? new Date(0)) : null;
  const maxDate = max ? startOfDay(parseValue(max) ?? new Date(8640000000000000)) : null;

  const [viewDate, setViewDate] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isDisabled = (day: Date): boolean => {
    const t = day.getTime();
    if (minDate && t < minDate.getTime()) return true;
    if (maxDate && t > maxDate.getTime()) return true;
    return false;
  };

  const handleDayClick = (day: Date) => {
    if (isDisabled(day)) return;
    onChange(toInputValue(day));
    setOpen(false);
  };

  const grid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewDate]);

  const today = startOfDay(new Date());

  const prevMonth = () =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const openCalendar = () => {
    const base = parseValue(value) ?? new Date();
    setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen(true);
  };

  const triggerText = formatDisplay(value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        title={title}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className={`min-h-8 flex items-center justify-between gap-2 rounded-xl border border-border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-3 transition-colors hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 text-left ${className} ${
          triggerText ? '' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon ?? <CalendarIcon className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />}
          <span className="truncate font-normal">
            {triggerText || placeholder}
            {required && !triggerText && <span className="text-red-500"> *</span>}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full mt-1 z-50 w-64 rounded-xl border border-border bg-white dark:bg-slate-900 shadow-xl p-2 select-none ${popoverClassName}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center mb-1">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 py-1">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((cell, idx) => {
              if (!cell) return <span key={idx} />;
              const disabled = isDisabled(cell);
              const isSelected =
                !!selected &&
                selected.getFullYear() === cell.getFullYear() &&
                selected.getMonth() === cell.getMonth() &&
                selected.getDate() === cell.getDate();
              const isToday = today.getTime() === cell.getTime();
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(cell)}
                  className={`h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                    disabled
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : isSelected
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  } ${isToday && !isSelected ? 'ring-1 ring-purple-400 ring-inset' : ''}`}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};