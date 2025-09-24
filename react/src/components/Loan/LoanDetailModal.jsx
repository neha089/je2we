import React, { useState, useEffect } from 'react';
import { X, CreditCard, Percent, Phone, FileText, DollarSign, CheckCircle, Clock } from 'lucide-react';

const LoanDetailModal = ({ isOpen, loanData, loanType, onClose, onPrincipalPayment, onInterestPayment }) => {
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    if (isOpen && loanData && loanData.loans && loanData.loans.length > 0) {
      setSelectedLoan(loanData.loans[0]);
    }
  }, [isOpen, loanData]);

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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const transactionDate = new Date(date);
    const diffTime = Math.abs(now - transactionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getMonthlyInterest = (loan) => {
    if (!loan?.outstandingPrincipal || !loan?.interestRateMonthlyPct) return 0;
    return (loan.outstandingPrincipal * loan.interestRateMonthlyPct) / 100 / 100; // Convert paise to rupees
  };

  const handlePrincipalPayment = () => {
    if (selectedLoan) {
      onPrincipalPayment(selectedLoan);
    }
  };

  const handleInterestPayment = () => {
    if (selectedLoan) {
      onInterestPayment(selectedLoan);
    }
  };

  if (!isOpen || !loanData) return null;

  const customer = loanData.customer || {};
  const loans = loanData.loans || [];
  const isReceivable = loanType === 'receivable';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
              isReceivable 
                ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                : 'bg-gradient-to-br from-blue-600 to-blue-700'
            }`}>
              <span className="text-white text-xl font-semibold">{getInitials(customer.name)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{customer.name || 'Unknown Customer'}</h2>
              <div className="flex items-center gap-4 text-slate-500 mt-1">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span className="font-medium">{loans.length} active loan{loans.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-800 mb-2">No Active Loans</h4>
            <p className="text-slate-500">No active loan records found for this customer</p>
          </div>
        ) : (
          <>
            {loans.length > 1 && (
              <div className="p-8 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-4">Select Loan</h3>
                <div className="flex gap-3 overflow-x-auto">
                  {loans.map((loan, index) => (
                    <button
                      key={loan._id}
                      onClick={() => setSelectedLoan(loan)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border ${
                        selectedLoan?._id === loan._id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      <div>
                        Loan #{index + 1} - {formatCurrency(loan.originalAmount)}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {formatDate(loan.takenDate)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedLoan && (
              <>
                <div className="p-8 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isReceivable ? 'bg-slate-100' : 'bg-blue-100'
                        }`}>
                          <DollarSign size={20} className={isReceivable ? 'text-slate-600' : 'text-blue-600'} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Outstanding</p>
                          <p className={`text-2xl font-semibold ${
                            isReceivable ? 'text-slate-700' : 'text-blue-700'
                          }`}>
                            {formatCurrency(selectedLoan.outstandingAmount)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {isReceivable ? 'Amount to collect' : 'Amount to pay'}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Percent size={20} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monthly Interest</p>
                          <p className="text-2xl font-semibold text-amber-700">
                            {formatCurrency(getMonthlyInterest(selectedLoan))}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {selectedLoan.interestRateMonthlyPct}% per month
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Paid</p>
                          <p className="text-2xl font-semibold text-green-600">
                            {formatCurrency(selectedLoan.totalPrincipalPaid / 100)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        Principal payments made
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                      <div className="flex gap-3">
                        <button
                          onClick={handlePrincipalPayment}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 shadow-md ${
                            isReceivable 
                              ? 'bg-slate-600 hover:bg-slate-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} />
                            {isReceivable ? 'Receive' : 'Pay'}
                          </div>
                        </button>
                        <button
                          onClick={handleInterestPayment}
                          className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-amber-600 hover:bg-amber-700 transition-colors duration-200 shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <Percent size={14} />
                            Interest
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6">Loan Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Original Amount</p>
                        <p className="text-lg font-semibold text-slate-800">
                          {formatCurrency(selectedLoan.originalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Loan Date</p>
                        <p className="text-lg font-medium text-slate-700">
                          {formatDate(selectedLoan.takenDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          selectedLoan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          selectedLoan.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {selectedLoan.status}
                        </span>
                      </div>
                      {selectedLoan.note && (
                        <div className="md:col-span-3">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Note</p>
                          <p className="text-slate-700">{selectedLoan.note}</p>
                        </div>
                      )}
                      {selectedLoan.dueDate && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Due Date</p>
                          <p className="text-lg font-medium text-slate-700">
                            {formatDate(selectedLoan.dueDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span className="font-medium">Payment Progress</span>
                        <span className="font-medium">{selectedLoan.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(selectedLoan.completionPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-6">Payment History</h3>
                    {selectedLoan.paymentHistory && selectedLoan.paymentHistory.length > 0 ? (
                      <div className="space-y-4">
                        {selectedLoan.paymentHistory.map((payment, index) => (
                          <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">
                                    Payment #{payment.installmentNumber || (index + 1)}
                                  </p>
                                  <p className="text-sm text-slate-500 font-medium">
                                    {formatDate(payment.date)} • {getTimeAgo(payment.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex gap-6">
                                  {payment.principalAmount > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Principal</p>
                                      <p className="text-lg font-semibold text-blue-600">
                                        {formatCurrency(payment.principalAmount / 100)}
                                      </p>
                                    </div>
                                  )}
                                  {payment.interestAmount > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Interest</p>
                                      <p className="text-lg font-semibold text-amber-600">
                                        {formatCurrency(payment.interestAmount / 100)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                  {payment.paymentMethod} {payment.paymentReference && `• ${payment.paymentReference}`}
                                </p>
                              </div>
                            </div>
                            {payment.note && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-sm text-slate-600">{payment.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Clock size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No payments recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div className="p-8 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-slate-700 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors duration-200 font-medium shadow-sm"
            >
              Close
            </button>
            {selectedLoan && (
              <>
                <button
                  onClick={handlePrincipalPayment}
                  className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium shadow-md ${
                    isReceivable 
                      ? 'bg-slate-600 hover:bg-slate-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard size={16} />
                    {isReceivable ? 'Receive Principal' : 'Pay Principal'}
                  </div>
                </button>
                <button
                  onClick={handleInterestPayment}
                  className="flex-1 px-6 py-3 text-white rounded-lg bg-amber-600 hover:bg-amber-700 transition-colors duration-200 font-medium shadow-md"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Percent size={16} />
                    {isReceivable ? 'Receive Interest' : 'Pay Interest'}
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailModal;