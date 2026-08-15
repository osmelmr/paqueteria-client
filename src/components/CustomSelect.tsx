import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronDown, Search, Check, X, type LucideIcon } from 'lucide-react';

export interface SelectOption {
  id: string;
  name: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: LucideIcon;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxHeight?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  icon: Icon,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
  maxHeight = 'max-h-56',
  allowClear = false,
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  const close = () => {
    setSearch('');
    setOpen(false);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  const visibleOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, search]);

  const handleSelect = (id: string) => {
    onChange(id);
    close();
  };

  const toggleOpen = () => {
    if (!open) setSearch('');
    setOpen((o) => !o);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => toggleOpen()}
        className={`w-full h-10 flex items-center gap-2 pl-3 pr-8 border border-border rounded-xl text-sm text-left transition-all ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-surface dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-purple-500 dark:focus:border-purple-400'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />}
        <span className={`flex-1 truncate ${selected ? '' : 'text-gray-400 dark:text-gray-500'}`}>
          {selected?.name ?? placeholder}
        </span>
        {allowClear && selected && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="shrink-0 p-0.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 mt-1 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-2 border border-border rounded-lg text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          )}

          <div className={`${maxHeight} overflow-y-auto p-1`}>
            {visibleOptions.length === 0 && (
              <p className="p-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                {emptyMessage}
              </p>
            )}
            {visibleOptions.map((o) => {
              const isSelected = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleSelect(o.id)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="truncate">{o.name}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
