'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Plus, Search } from 'lucide-react';

/**
 * CustomSelect — a styled, accessible dropdown component.
 *
 * Props:
 *  - options:        { value: string, label: string }[]  — list of selectable options
 *  - value:          string                              — currently selected value
 *  - onChange:       (value: string) => void
 *  - placeholder:    string
 *  - allowCreate:    bool     — show "+ Create" row when search has no match
 *  - onCreateOption: (label: string) => void | Promise<void>
 *  - isLoading:      bool     — show spinner inside trigger
 *  - createLoading:  bool     — show spinner on the create row
 *  - disabled:       bool
 *  - hasError:       bool
 *  - searchable:     bool     — enable inline search input (default: false)
 *  - id:             string   — for label association
 *  - className:      string   — extra class on trigger wrapper
 */
export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option…',
  allowCreate = false,
  onCreateOption,
  isLoading = false,
  createLoading = false,
  disabled = false,
  hasError = false,
  searchable = false,
  id,
  className = '',
}) {
  const uid = useId();
  const dropdownId = `${id || uid}-dropdown`;
  const searchId = `${id || uid}-search`;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const itemRefs = useRef([]);

  const selectedOption = options.find((o) => o.value === value);

  /* ── Filtered options ────────────────────────────────── */
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const exactMatch = options.some(
    (o) => o.label.toLowerCase() === search.trim().toLowerCase(),
  );
  const showCreate = allowCreate && search.trim().length > 0 && !exactMatch;

  /* Total navigable items = filtered options + optional create row */
  const navLength = filtered.length + (showCreate ? 1 : 0);

  /* ── Close on outside click ──────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        !panelRef.current?.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /* ── Focus search input when panel opens ─────────────── */
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
    if (!open) {
      setSearch('');
      setFocusedIdx(-1);
    }
  }, [open, searchable]);

  /* ── Scroll focused item into view ──────────────────── */
  useEffect(() => {
    if (focusedIdx >= 0 && itemRefs.current[focusedIdx]) {
      itemRefs.current[focusedIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIdx]);

  /* ── Keyboard handler ────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIdx((i) => (i + 1) % navLength);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIdx((i) => (i - 1 + navLength) % navLength);
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIdx >= 0 && focusedIdx < filtered.length) {
            handleSelect(filtered[focusedIdx].value);
          } else if (focusedIdx === filtered.length && showCreate) {
            handleCreate();
          }
          break;
        case 'Tab':
          setOpen(false);
          break;
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, focusedIdx, filtered, showCreate, navLength],
  );

  const handleSelect = (val) => {
    onChange?.(val);
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  };

  const handleCreate = async () => {
    const label = search.trim();
    if (!label || !onCreateOption) return;
    await onCreateOption(label);
    setSearch('');
    setOpen(false);
    triggerRef.current?.focus();
  };

  /* ── Trigger button classes ──────────────────────────── */
  const triggerCls = [
    'relative w-full h-11 pl-3.5 pr-10 rounded-lg border text-left text-sm transition-all duration-150 flex items-center gap-2',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    disabled
      ? 'cursor-not-allowed opacity-60 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
      : hasError
      ? 'border-red-500 focus:ring-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-red-400'
      : open
      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative w-full" onKeyDown={handleKeyDown}>
      {/* ── Trigger ─────────────────────────────────────── */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={dropdownId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={triggerCls}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />
        ) : null}
        <span
          className={`flex-1 truncate ${
            selectedOption ? '' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform duration-200 pointer-events-none ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ── Dropdown Panel ──────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          id={dropdownId}
          role="listbox"
          aria-label="Options"
          className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}
        >
          {/* Search input (inside panel) */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  id={searchId}
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setFocusedIdx(-1); }}
                  placeholder="Search or type a new tag…"
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <ul
            className="max-h-52 overflow-y-auto py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
            role="presentation"
          >
            {filtered.length === 0 && !showCreate && (
              <li className="px-4 py-3 text-xs text-slate-400 text-center select-none">
                No options found
              </li>
            )}

            {filtered.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused = focusedIdx === idx;
              return (
                <li
                  key={opt.value}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIdx(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer select-none transition-colors duration-75 ${
                    isFocused
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                      : isSelected
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  )}
                </li>
              );
            })}

            {/* Create new option row */}
            {showCreate && (
              <li
                ref={(el) => { itemRefs.current[filtered.length] = el; }}
                role="option"
                aria-selected={false}
                onClick={handleCreate}
                onMouseEnter={() => setFocusedIdx(filtered.length)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer select-none border-t border-slate-100 dark:border-slate-800 transition-colors duration-75 ${
                  focusedIdx === filtered.length
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30'
                }`}
              >
                {createLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>
                  {createLoading
                    ? 'Creating tag…'
                    : (
                      <>
                        Add{' '}
                        <strong className="font-bold">&ldquo;{search.trim()}&rdquo;</strong>
                        {' '}as new tag
                      </>
                    )}
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
