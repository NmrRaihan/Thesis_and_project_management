import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

/**
 * SortHeader - A compact sortable table column header
 * @param {string} label - Display text
 * @param {string} field - Field name to sort by
 * @param {string} sortField - Currently active sort field
 * @param {string} sortDirection - 'asc' or 'desc'
 * @param {function} onSort - Callback(field) when clicked
 * @param {string} className - Additional classes
 */
export function SortHeader({ label, field, sortField, sortDirection, onSort, className = '' }) {
  const isActive = sortField === field;

  return (
    <th
      className={`px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none
        hover:bg-white/10 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span className={isActive ? 'text-white' : 'text-blue-200/70'}>{label}</span>
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-blue-400" />
          ) : (
            <ArrowDown className="w-3 h-3 text-blue-400" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 text-blue-200/30" />
        )}
      </div>
    </th>
  );
}

/**
 * useSortState - Hook for managing sort state
 * @param {string} defaultField - Default sort field
 * @param {string} defaultDirection - Default sort direction
 * @returns {{ sortField, sortDirection, handleSort, sortData }}
 */
export function useSortState(defaultField = '', defaultDirection = 'desc') {
  const [sortField, setSortField] = React.useState(defaultField);
  const [sortDirection, setSortDirection] = React.useState(defaultDirection);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortData = (data) => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        // Try date comparison
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          comparison = aDate.getTime() - bDate.getTime();
        } else {
          comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  return { sortField, sortDirection, handleSort, sortData };
}
