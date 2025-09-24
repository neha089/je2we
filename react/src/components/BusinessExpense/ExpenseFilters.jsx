// components/BusinessExpense/ExpenseFilters.js
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { CATEGORIES } from './constants'; // Assuming constants.js contains CATEGORIES

const ExpenseFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    dateRange: '',
  });

  // Define date range options
  const dateRangeOptions = [
    { value: '', label: 'Select a date range' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  // Calculate date ranges based on current date (September 21, 2025)
  const getDateRange = (range) => {
    const today = new Date('2025-09-21T11:26:00+05:30'); // Current date and time in IST
    let dateFrom, dateTo;

    switch (range) {
      case 'today':
        dateFrom = today.toISOString().split('T')[0]; // 2025-09-21
        dateTo = dateFrom;
        break;
      case 'week':
        const dayOfWeek = today.getDay(); // 0 = Sunday
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - daysToMonday); // Monday, September 15, 2025
        dateTo = new Date(today);
        dateTo.setDate(today.getDate() + (7 - dayOfWeek)); // Sunday, September 21, 2025
        dateFrom = dateFrom.toISOString().split('T')[0];
        dateTo = dateTo.toISOString().split('T')[0];
        break;
      case 'month':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1); // September 1, 2025
        dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0); // September 30, 2025
        dateFrom = dateFrom.toISOString().split('T')[0];
        dateTo = dateTo.toISOString().split('T')[0];
        break;
      case 'year':
        dateFrom = new Date(today.getFullYear(), 0, 1); // January 1, 2025
        dateTo = new Date(today.getFullYear(), 11, 31); // December 31, 2025
        dateFrom = dateFrom.toISOString().split('T')[0];
        dateTo = dateTo.toISOString().split('T')[0];
        break;
      default:
        dateFrom = '';
        dateTo = '';
        break;
    }
    return { dateFrom, dateTo };
  };

  const handleInputChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    if (field === 'dateRange') {
      const { dateFrom, dateTo } = getDateRange(value);
      updatedFilters.dateFrom = dateFrom;
      updatedFilters.dateTo = dateTo;
    }
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const resetFilters = {
      search: '',
      dateRange: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-5 w-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Filter Expenses</h3>
      </div>
      <form className="grid grid-cols-2 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search Item Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              placeholder="Search by title, description"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
            />
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleInputChange('dateRange', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.value === ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilters;