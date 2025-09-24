// components/BusinessExpense/ExpenseTable.js
import React, { useState } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';  // Added Edit2 and Trash2
import { getCategoryIcon } from './constants';
import { formatIndianAmount } from './utils';

const ExpenseTable = ({ expenses, onEdit, onDelete, onStatusToggle, loading }) => {
    const recordsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages and current page records
    const totalRecords = expenses.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    const currentExpenses = expenses.slice(startIndex, endIndex);

    // Handle page navigation
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-slate-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-lg font-semibold text-slate-900">Expense Records</h3>
                <p className="text-sm text-slate-600 mt-1">Detailed view of all business expenses</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Expense Details
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Financial Details
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Actions  {/* Added: Actions column */}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-slate-100">
                        {currentExpenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {new Date(expense.date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                                                {expense.category.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900 max-w-xs">
                                            {expense.title || expense.description}
                                        </div>
                                        {expense.subcategory && (
                                            <div className="text-xs text-slate-500">
                                                {expense.subcategory}
                                            </div>
                                        )}
                                        {expense.description !== expense.title && expense.title && (
                                            <div className="text-xs text-slate-500 max-w-xs truncate">
                                                {expense.description}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                        <div className="text-base font-bold text-slate-900">
                                            {formatIndianAmount(Number(expense.amount))}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Net: {formatIndianAmount(Number(expense.netAmount) || Number(expense.amount))}
                                        </div>
                                        {expense.taxAmount > 0 && (
                                            <div className="text-xs text-slate-500">
                                                Tax: {formatIndianAmount(Number(expense.taxAmount))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {/* Added: Actions column */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(expense)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {expenses.length === 0 && (
                <div className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-100 rounded-2xl">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses found</h3>
                            <p className="text-slate-500 mb-4">
                                Try adjusting your search criteria or filters
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {expenses.length > 0 && (
                <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                        Showing {startIndex + 1}–{endIndex} of {totalRecords} expenses
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-semibold rounded-lg ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 border border-slate-300 hover:bg-slate-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTable;