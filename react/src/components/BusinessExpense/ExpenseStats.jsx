// components/BusinessExpense/ExpenseStats.js
import React from 'react';
import { DollarSign, FileText } from 'lucide-react';
import { formatIndianRupeesFull } from './utils'; // New utility function

const ExpenseStats = ({ summary }) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gross Total</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-900">
                        {formatIndianRupeesFull(summary.totalGrossAmount)}
                    </p>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Transactions</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                        {(summary.paidExpenses + summary.pendingExpenses) ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExpenseStats;