import React from 'react';
import { Eye, Phone, User, ChevronRight } from 'lucide-react';

const UdhariCard = ({ udhari, onView }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  const customer = udhari.customer || {};
  const toCollect = udhari.toCollect || 0;
  const toPay = udhari.toPay || 0;
  const net = udhari.net || 0;
  const transactionCount = udhari.transactions?.length || 0;

  const avatarColor = net > 0 ? 'from-red-500 to-red-600' : net < 0 ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600';

  const netColor = net > 0 ? 'text-red-600' : net < 0 ? 'text-green-600' : 'text-gray-600';

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Customer Info */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br ${avatarColor}`}>
            <span className="text-white text-sm font-bold">{getInitials(customer.name)}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {customer.name || 'Unknown Customer'}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
              {customer.phone && (
                <div className="flex items-center gap-1">
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
        </div>
      </div>

      {/* Amounts */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500">To Collect</p>
          <p className="text-sm font-bold text-red-600">{formatCurrency(toCollect)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">To Pay</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(toPay)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className={`text-sm font-bold ${netColor}`}>{formatCurrency(net)}</p>
        </div>
      </div>
    </div>
  );
};

export default UdhariCard;