import React from 'react';
import { DollarSign, Percent, FileText } from 'lucide-react';

const LoanCard = ({ loan, type, onView, onPrincipalPayment, onInterestPayment }) => {
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

  const customer = loan.customer || {};
  const isReceivable = type === 'receivable';

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
            isReceivable 
              ? 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg' 
              : 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg'
          }`}>
            <span className="text-white text-lg font-semibold">{getInitials(customer.name)}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-1">{customer.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{customer.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Outstanding</p>
          <p className={`text-2xl font-bold ${
            isReceivable ? 'text-slate-700' : 'text-blue-700'
          }`}>
            {formatCurrency(loan.totalOutstanding)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols gap-6">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Active Loans</p>
          <p className="text-lg font-semibold text-slate-800">{loan.loans.length}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onView}
          className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 font-medium border border-slate-200"
        >
          <FileText size={16} className="inline mr-2" />
          View Details
        </button>
        <button
          onClick={onPrincipalPayment}
          className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors duration-200 ${
            isReceivable 
              ? 'bg-slate-600 hover:bg-slate-700 shadow-md' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-md'
          }`}
        >
          <DollarSign size={16} className="inline mr-2" />
          {isReceivable ? 'Receive' : 'Pay'} Principal
        </button>
        <button
          onClick={onInterestPayment}
          className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium shadow-md"
        >
          <Percent size={16} className="inline mr-2" />
          Interest
        </button>
      </div>
    </div>
  );
};

export default LoanCard;