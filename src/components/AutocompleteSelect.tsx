import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sub?: string; // secondary label
}

interface AutocompleteSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface MultiAutocompleteSelectProps {
  options: SelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  selectAllLabel?: string;
}

// ── Single Autocomplete Select ──
export function AutocompleteSelect({ options, value, onChange, placeholder = 'Rechercher...', className = '', disabled = false }: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase()) ||
    (o.sub && o.sub.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`cursor-pointer w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-400' : ''}`}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tapez pour rechercher..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[180px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                Aucun résultat pour "{search}"
              </div>
            ) : (
              filtered.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`cursor-pointer w-full text-left px-3 py-2 text-xs font-semibold transition flex items-center justify-between gap-2 ${
                    option.value === value
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">
                    <span className="block">{option.label}</span>
                    {option.sub && <span className="block text-[10px] text-slate-400 font-normal">{option.sub}</span>}
                  </div>
                  {option.value === value && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Multi Autocomplete Select (with chips + select all) ──
export function MultiAutocompleteSelect({ options, values, onChange, placeholder = 'Sélectionner...', className = '', selectAllLabel = 'Tout sélectionner' }: MultiAutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase()) ||
    (o.sub && o.sub.toLowerCase().includes(search.toLowerCase()))
  );

  const allSelected = options.length > 0 && values.length === options.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map(o => o.value));
    }
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== val));
  };

  const selectedLabels = values.map(v => options.find(o => o.value === v)?.label || v);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`cursor-pointer w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition min-h-[34px] ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-400' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {values.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : values.length <= 3 ? (
            selectedLabels.map((label, i) => (
              <span key={values[i]} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-[10px] font-bold max-w-[120px] truncate">
                <span className="truncate">{label}</span>
                <X
                  className="h-3 w-3 shrink-0 cursor-pointer hover:text-red-500 transition"
                  onClick={(e) => removeValue(values[i], e)}
                />
              </span>
            ))
          ) : (
            <span className="text-indigo-700 font-bold">{values.length} sélectionnés</span>
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tapez pour rechercher..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Select All */}
          {!search && (
            <button
              type="button"
              onClick={handleSelectAll}
              className={`cursor-pointer w-full text-left px-3 py-2 text-xs font-bold transition flex items-center justify-between gap-2 border-b border-slate-100 ${
                allSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>⚡ {selectAllLabel}</span>
              <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${allSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                {allSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            </button>
          )}

          {/* Options list */}
          <div className="max-h-[180px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                Aucun résultat pour "{search}"
              </div>
            ) : (
              filtered.map(option => {
                const isChecked = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={`cursor-pointer w-full text-left px-3 py-2 text-xs font-semibold transition flex items-center justify-between gap-2 ${
                      isChecked ? 'bg-indigo-50/60 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">
                      <span className="block">{option.label}</span>
                      {option.sub && <span className="block text-[10px] text-slate-400 font-normal">{option.sub}</span>}
                    </div>
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {isChecked && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick footer */}
          {values.length > 0 && (
            <div className="p-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold">{values.length} / {options.length} sélectionnés</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="cursor-pointer text-[10px] font-bold text-red-500 hover:text-red-700 transition"
              >
                Tout désélectionner
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
