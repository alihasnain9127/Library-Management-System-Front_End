'use client';

import { useState, useEffect } from 'react';

export const useSearch = (delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: 'All', status: 'All' });

  // Debounce searchTerm and filters
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [filters, delay]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    debouncedSearchTerm,
    debouncedFilters,
  };
};