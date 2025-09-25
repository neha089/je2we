import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  FileText, 
  User, 
  Phone, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  CreditCard,
  Banknote
} from 'lucide-react';

const LoanCard = ({ loan, type, onView, onPrincipalPayment, onInterestPayment }) => {
  console.log('Rendering LoanCard for loan:', loan);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status = 'ACTIVE') => {
    const configs = {
      ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle, label: 'Active' },
      OVERDUE: { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertTriangle, label: 'Overdue' },
      PARTIALLY_PAID: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'Partial' },
      CLOSED: { bg: 'bg-slate-100', text: 'text-slate-800', icon: CheckCircle, label: 'Closed' }
    };
    return configs[status] || configs.ACTIVE;
  };

  const getDaysUntilDue = () => {
    // Check for dueDate in the main loan object or in the first loan in the loans array
    const dueDate = loan.dueDate || (loan.loans && loan.loans[0] && loan.loans[0].dueDate);
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const customer = loan.customer || {};
  const isReceivable = type === 'receivable';
  
  // Get the first loan from the loans array for detailed info
  const firstLoan = loan.loans && loan.loans[0] ? loan.loans[0] : {};
  
  // Use the status from the first loan or default to ACTIVE
  const loanStatus = firstLoan.status || loan.status || 'ACTIVE';
  const statusConfig = getStatusConfig(loanStatus);
  const StatusIcon = statusConfig.icon;
  
  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

  // Calculate metrics properly
  const totalLoans = loan.loans?.length || 1;
  const principalAmount = firstLoan.principalRupees || firstLoan.originalAmount || 0;
  const totalOutstanding = loan.totalOutstanding || firstLoan.outstandingAmount || firstLoan.outstandingRupees || 0;
  const totalPaid = firstLoan.totalPrincipalPaid ? (firstLoan.totalPrincipalPaid / 100) : 0; // Convert paise to rupees
  const interestRate = firstLoan.interestRateMonthlyPct || loan.interestRate || 0;
  const accruedInterest = firstLoan.accruedInterest || 0;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  // Get due date - check multiple possible locations
  const dueDate = loan.dueDate || firstLoan.dueDate || firstLoan.nextInterestDueDate;

  return (
    <div 
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer w-full group"
    >
      {/* Header Section */}
      <div className={`${
        isReceivable 
          ? 'bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50' 
          : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50'
      } p-6 border-b ${
        isReceivable ? 'border-teal-100' : 'border-blue-100'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ring-4 ring-white/50 transition-transform group-hover:scale-105 ${
              isReceivable 
                ? 'bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700' 
                : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-700'
            }`}>
              <span className="text-xl font-bold drop-shadow-sm">{getInitials(customer.name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-slate-900 truncate">{customer.name}</h3>
              <p className="text-sm text-slate-600 font-medium truncate mt-1">
                {customer.phone} • {totalLoans} loan{totalLoans !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isOverdue || isDueSoon) && (
              <AlertTriangle size={18} className={isOverdue ? 'text-rose-500' : 'text-amber-500'} />
            )}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon size={12} />
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner for Overdue/Due Soon */}
      {(isOverdue || isDueSoon) && (
        <div className={`${
          isOverdue ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-l-4 border-rose-400' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400'
        } p-3`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className={isOverdue ? 'text-rose-600' : 'text-amber-600'} />
            <span className={`text-sm font-medium ${isOverdue ? 'text-rose-800' : 'text-amber-800'}`}>
              {isOverdue 
                ? `Payment overdue by ${Math.abs(daysUntilDue)} days`
                : `Payment due in ${daysUntilDue} days`
              }
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-5">
        {/* Customer Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <User size={18} className="text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Customer</span>
              <div className="font-semibold text-slate-900 text-base truncate">
                {customer.name || 'Unknown Customer'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={16} className="text-slate-400" />
            <span className="truncate">{customer.phone || 'N/A'}</span>
          </div>
        </div>

        {/* Amount Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="text-2xl font-bold text-slate-700 mb-1">
              {formatCurrency(principalAmount)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Principal Amount
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-rose-200">
            <div className="text-2xl font-bold text-rose-600 mb-1">
              {formatCurrency(totalOutstanding)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Outstanding
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <div className="text-xl font-bold text-emerald-600 mb-1">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Total Paid
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="text-xl font-bold text-amber-600 mb-1">
              {formatCurrency(accruedInterest)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Accrued Interest
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <span className="text-slate-600 font-medium">Payment Progress</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-emerald-700">
                {firstLoan.completionPercentage || 0}%
              </div>
              <div className="text-xs text-slate-500">Complete</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 bg-emerald-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${firstLoan.completionPercentage || 0}%` }}
            ></div>
          </div>
        </div>

        
      </div>
      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">View</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrincipalPayment();
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              isReceivable
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            <Banknote size={16} />
            <span className="hidden sm:inline">{isReceivable ? 'Receive' : 'Pay'}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInterestPayment();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Percent size={16} />
            <span className="hidden sm:inline">Interest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoanCard;