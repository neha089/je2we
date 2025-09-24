import React, { useState, useEffect } from 'react';
import { X, Percent, AlertCircle, Loader2 } from 'lucide-react';
import ApiService from '../../services/api';
const LInterestPaymentModal = ({ isOpen, loan, onClose, onSuccess }) => {
  const [interestAmount, setInterestAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setInterestAmount('');
      setPaymentNote('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('CASH');
      setPaymentReference('');
      setError(null);
    }
  }, [isOpen]);

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

  const getMonthlyInterest = () => {
    const outstanding = loan?.outstandingPrincipal || 0;
    const interestRate = loan?.interestRateMonthlyPct || 0;
    return (outstanding * interestRate) / 100 / 100; // Convert paise to rupees
  };

  const getPendingInterestAmount = () => {
    return getMonthlyInterest();
  };

  const handleInterestPayment = async (e) => {
    e.preventDefault();

    if (!loan?._id) {
      setError('Loan ID is missing');
      return;
    }

    if (!interestAmount || parseFloat(interestAmount) <= 0) {
      setError('Please enter a valid interest amount');
      return;
    }

    const expectedInterest = getPendingInterestAmount() * 100; // Convert to paise
    

    try {
      setLoading(true);
      setError(null);

      const interestData = {
        loanId: loan._id,
        principalPaise: 0,
        interestPaise: parseInt(parseFloat(interestAmount) * 100),
        note: paymentNote.trim() || undefined,
        paymentDate,
        paymentMethod,
        reference: paymentReference.trim() || '',
        transactionId: paymentReference.trim() || '',
      };

      const isGivenLoan = loan.loanType === 'GIVEN';
      const response = isGivenLoan
        ? await ApiService.receiveLoanPayment(interestData)
        : await ApiService.makeLoanPayment(interestData);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || response.error || 'Interest payment failed');
      }
    } catch (error) {
      setError(error.message || 'Failed to process interest payment');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (percentage) => {
    const expectedInterest = getPendingInterestAmount();
    const amount = (expectedInterest * percentage / 100).toFixed(2);
    setInterestAmount(amount);
  };

  if (!isOpen || !loan || !loan._id) {
    return null;
  }

  const customer = loan.customer || {};
  const isReceivable = loan.loanType === 'GIVEN';
  const monthlyInterest = getMonthlyInterest();
  const pendingInterest = getPendingInterestAmount();
  const outstandingAmount = loan?.outstandingAmount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-600 to-amber-700">
              <span className="text-white text-lg font-semibold">{getInitials(customer.name)}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {isReceivable ? 'Receive Interest Payment' : 'Make Interest Payment'}
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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Interest Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Outstanding Principal</p>
                <p className="text-lg font-semibold text-slate-800">{formatCurrency(outstandingAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Interest Rate</p>
                <p className="text-lg font-semibold text-slate-800">{loan.interestRateMonthlyPct}% monthly</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Current Month Interest</p>
                <p className="text-lg font-semibold text-amber-700">{formatCurrency(monthlyInterest)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Next Due Date</p>
                <p className="text-sm font-medium text-slate-600">
                  {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
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
            <label className="block text-sm font-medium text-slate-700 mb-3">Interest Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
                value={interestAmount}
                onChange={(e) => setInterestAmount(e.target.value)}
                placeholder="0.00"
                max={pendingInterest}
              />
            </div>

            {pendingInterest > 0 && (
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(25)}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(50)}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(75)}
                  className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 border border-slate-200"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(100)}
                  className="px-3 py-2 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200 border border-amber-200"
                >
                  Current Month ({formatCurrency(monthlyInterest)})
                </button>
              </div>
            )}

            {interestAmount && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 font-medium">Interest Payment:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(parseFloat(interestAmount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Monthly Interest Due:</span>
                  <span className="font-semibold text-amber-700">{formatCurrency(monthlyInterest)}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200 font-medium text-slate-700"
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
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
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
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200 font-medium text-slate-700"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Payment Note (Optional)</label>
            <textarea
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
              rows="3"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Add a note about this interest payment..."
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
              onClick={handleInterestPayment}
              disabled={loading || !interestAmount}
              className="flex-1 px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Percent size={18} />
                  {isReceivable ? 'Receive Interest' : 'Pay Interest'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LInterestPaymentModal;