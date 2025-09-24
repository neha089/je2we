import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import ApiService from '../../services/api';

const LoanPaymentModal = ({ isOpen, loan, onClose, onSuccess }) => {
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setPrincipalAmount('');
    setInterestAmount('');
    setPaymentNote('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('CASH');
    setPaymentReference('');
    setError(null);
  };

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

  const getOutstandingAmount = () => {
    return loan?.outstandingRupees || 0;
  };

  const getMonthlyInterest = () => {
    const outstanding = loan?.outstandingPrincipal || 0;
    const interestRate = loan?.interestRateMonthlyPct || 0;
    return (outstanding * interestRate) / 100 / 100;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!loan?._id) {
      setError('Loan ID is missing');
      return;
    }

    const principalPaise = principalAmount ? parseInt(parseFloat(principalAmount) * 100) : 0;
    const interestPaise = interestAmount ? parseInt(parseFloat(interestAmount) * 100) : 0;

    if (principalPaise <= 0 && interestPaise <= 0) {
      setError('Please enter at least one payment amount');
      return;
    }

    const outstandingAmount = getOutstandingAmount();
    if (principalPaise > 0 && principalPaise / 100 > outstandingAmount) {
      setError(`Principal payment cannot exceed outstanding amount of ${formatCurrency(outstandingAmount)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const paymentData = {
        loanId: loan._id,
        principalPaise,
        interestPaise,
        note: paymentNote.trim() || undefined,
        paymentDate,
        paymentMethod,
        reference: paymentReference.trim() || '',
        transactionId: paymentReference.trim() || '',
      };

      const isGivenLoan = loan.loanType === 'GIVEN';
      const response = isGivenLoan
        ? await ApiService.receiveLoanPayment(paymentData)
        : await ApiService.makeLoanPayment(paymentData);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || response.error || 'Payment failed');
      }
    } catch (error) {
      setError(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrincipalAmount = (percentage) => {
    const outstandingAmount = getOutstandingAmount();
    const amount = (outstandingAmount * percentage / 100).toFixed(2);
    setPrincipalAmount(amount);
  };

  const handleQuickInterestAmount = () => {
    const expectedInterest = getMonthlyInterest();
    setInterestAmount(expectedInterest.toFixed(2));
  };

  if (!isOpen || !loan || !loan._id) {
    return null;
  }

  const customer = loan.customer || {};
  const isReceivable = loan.loanType === 'GIVEN';
  const outstandingAmount = getOutstandingAmount();
  const monthlyInterest = getMonthlyInterest();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-lg ${
              isReceivable 
                ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                : 'bg-gradient-to-br from-blue-600 to-blue-700'
            }`}>
              <span className="text-white text-lg font-semibold">{getInitials(customer.name)}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {isReceivable ? 'Receive Loan Payment' : 'Make Loan Payment'}
              </h2>
              <p className="text-sm text-slate-500 font-medium">{customer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Outstanding Principal</p>
                <p className="text-lg font-semibold text-slate-800">{formatCurrency(loan.outstandingAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Monthly Interest ({loan.interestRateMonthlyPct}%)</p>
                <p className="text-lg font-semibold text-amber-700">{formatCurrency(monthlyInterest)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Original Amount</p>
                <p className="text-sm font-medium text-slate-600">{formatCurrency(loan.originalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Payments Made</p>
                <p className="text-sm font-medium text-slate-600">{loan.paymentHistory?.length || 0}</p>
              </div>
            </div>
            {loan.note && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Loan Note</p>
                <p className="text-sm text-slate-700">{loan.note}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Principal Payment</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                placeholder="0.00"
                max={outstandingAmount}
              />
            </div>
            {outstandingAmount > 0 && (
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleQuickPrincipalAmount(25)}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrincipalAmount(50)}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPrincipalAmount(100)}
                  className="px-3 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 border border-blue-200"
                >
                  Full Payment
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Interest Payment</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
                value={interestAmount}
                onChange={(e) => setInterestAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {monthlyInterest > 0 && (
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleQuickInterestAmount()}
                  className="px-3 py-2 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200 border border-amber-200"
                >
                  Suggested ({formatCurrency(monthlyInterest)})
                </button>
              </div>
            )}
          </div>

          {(principalAmount || interestAmount) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Principal Payment:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(parseFloat(principalAmount || 0))}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Interest Payment:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(parseFloat(interestAmount || 0))}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-blue-200 pt-2">
                <span className="text-slate-700">Total Payment:</span>
                <span className="text-slate-800">{formatCurrency((parseFloat(principalAmount || 0) + parseFloat(interestAmount || 0)))}</span>
              </div>
              {(principalAmount || interestAmount) && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-600 font-medium">Remaining Principal:</span>
                  <span className="font-semibold text-amber-700">
                    {formatCurrency(Math.max(0, outstandingAmount - (parseFloat(principalAmount || 0) + parseFloat(interestAmount || 0))))}
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 font-medium text-slate-700"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="GPAY">Google Pay</option>
              <option value="PHONEPE">PhonePe</option>
              <option value="PAYTM">Paytm</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          {paymentMethod !== 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Payment Reference / Transaction ID</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter transaction ID or reference"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Date *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 font-medium text-slate-700"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Note (Optional)</label>
            <textarea
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              rows="3"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Add a note about this payment..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading || (!principalAmount && !interestAmount)}
              className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium shadow-md ${
                isReceivable 
                  ? 'bg-slate-600 hover:bg-slate-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  {isReceivable ? 'Receive Payment' : 'Make Payment'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanPaymentModal;