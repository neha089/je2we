import React, { useState, useEffect } from 'react';
import { X, Phone, FileText, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ApiService from '../../services/api.js';

const UdhariDetailModal = ({ isOpen, customerData, udhariType, onClose }) => {
  const [customerSummary, setCustomerSummary] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (isOpen && customerData?.customer?._id) {
      ApiService.getCustomerUdharSummary(customerData.customer._id)
        .then(response => {
          if (response.success) {
            setCustomerSummary(response.data);
          }
        })
        .catch(err => {
          console.error('Error fetching customer udhar summary:', err);
          setError('Failed to load customer details');
        });
    }
  }, [isOpen, customerData]);

  // Format currency for amounts in paisa
  const formatCurrencyPaisa = (amount) => {
    const amountInRupees = amount / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amountInRupees);
  };

  // Format currency for amounts in rupees
  const formatCurrencyRupees = (amount) => {
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
    // Ensure date is parsed in IST (UTC+5:30)
    const transactionDate = new Date(date);
    return transactionDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Unknown';
    // Parse dates in IST
    const now = new Date();
    now.setTime(now.getTime() + (5.5 * 60 * 60 * 1000)); // Adjust to IST
    const transactionDate = new Date(date);
    transactionDate.setTime(transactionDate.getTime() + (5.5 * 60 * 60 * 1000)); // Adjust to IST

    // Compare dates (ignoring time) for Today/Yesterday
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const txnDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());

    const diffTime = Math.abs(now - transactionDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (nowDate.getTime() === txnDate.getTime()) return 'Today';
    if (diffDays === 0 && nowDate.getDate() - txnDate.getDate() === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (!isOpen || !customerData) return null;

  const customer = customerData.customer || {};
  const isReceivable = udhariType === 'receivable';

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-xl w-full max-w-md sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-md ${
                isReceivable ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                <span className="text-white text-base sm:text-lg font-bold">{getInitials(customer.name)}</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{customer.name || 'Unknown Customer'}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mt-1 text-xs sm:text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <AlertCircle size={40} className="text-red-300 mx-auto mb-4" />
              <p className="text-red-500 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customerSummary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-xl w-full max-w-md sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-md ${
                isReceivable ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                <span className="text-white text-base sm:text-lg font-bold">{getInitials(customer.name)}</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{customer.name || 'Unknown Customer'}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mt-1 text-xs sm:text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>Loading transactions...</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="text-center py-12">
              <Clock size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Loading customer details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate amounts in rupees (convert from paisa)
  const toCollect = (customerSummary.udhars?.given?.reduce((sum, u) => sum + (u.outstandingPrincipal || 0), 0) || 0) / 100;
  const toPay = (customerSummary.udhars?.taken?.reduce((sum, u) => sum + (u.outstandingPrincipal || 0), 0) || 0) / 100;
  // Calculate net balance as Give Udhar - Take Udhar
  const net = toCollect - toPay;

  const netColor = net > 0 ? 'text-red-600' : net < 0 ? 'text-green-600' : 'text-gray-600';

  // Payment history includes UDHAR_GIVEN, UDHAR_TAKEN, and UDHAR_PAYMENT
  const paymentHistory = customerSummary.transactionHistory
    ?.filter(txn => ['UDHAR_GIVEN', 'UDHAR_TAKEN', 'UDHAR_PAYMENT'].includes(txn.type))
    ?.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    || [];

  const totalTransactions = paymentHistory.length;
  const paginatedHistory = paymentHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl w-full max-w-md sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-md ${
              net > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'
            }`}>
              <span className="text-white text-base sm:text-lg font-bold">{getInitials(customer.name)}</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{customer.name || 'Unknown Customer'}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mt-1 text-xs sm:text-sm">
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText size={14} />
                  <span>{customerSummary.udhars?.all?.length || 0} transaction{customerSummary.udhars?.all?.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {customerSummary.udhars?.all?.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} className="text-gray-300 mx-auto mb-4" />
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Active Transactions</h4>
            <p className="text-gray-500 text-sm sm:text-base">No active udhari records found for this customer</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Give Udhar</p>
                    <p className="text-lg sm:text-xl font-bold text-red-600">{formatCurrencyPaisa(toCollect * 100)}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Amount to collect</p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Take Udhar</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">{formatCurrencyPaisa(toPay * 100)}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Amount to pay</p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className={netColor} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Net Balance</p>
                    <p className={`text-lg sm:text-xl font-bold ${netColor}`}>
                      {formatCurrencyPaisa(net * 100)}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Overall with customer</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Payment History</h3>
          {paginatedHistory.length > 0 ? (
            <div className="space-y-4">
              {paginatedHistory.map((txn) => {
                const isIncoming = txn.direction === 1;
                const color = isIncoming ? 'green-600' : 'red-600';
                let prefix = '';
                if (txn.type === 'UDHAR_GIVEN') prefix = 'Udhar Given';
                else if (txn.type === 'UDHAR_TAKEN') prefix = 'Udhar Taken';
                else if (txn.type === 'UDHAR_PAYMENT') prefix = isIncoming ? 'Received payment' : 'Made payment';

                return (
                  <div key={txn._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle size={16} className={`text-${color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {prefix}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(txn.date)} • {getTimeAgo(txn.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={`font-medium text-${color} text-sm sm:text-base`}>
                          {isIncoming ? '+' : '-'} {formatCurrencyRupees(txn.amount)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {txn.metadata?.paymentMethod || 'CASH'} {txn.metadata?.paymentReference && `• ${txn.metadata.paymentReference}`}
                        </p>
                      </div>
                    </div>
                    {txn.description && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-600">{txn.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">No transactions recorded yet</p>
            </div>
          )}
          {totalTransactions > 0 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalTransactions)} of {totalTransactions}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalTransactions / pageSize)))}
                disabled={currentPage === Math.ceil(totalTransactions / pageSize)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UdhariDetailModal;