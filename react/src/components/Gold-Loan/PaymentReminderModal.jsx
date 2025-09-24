// components/PaymentReminderModal.jsx
import React, { useState } from 'react';
import { X, Phone, MessageSquare, Mail, Calendar, DollarSign, User, Coins } from 'lucide-react';

const PaymentReminderModal = ({ isOpen, onClose, loan, onAction }) => {
  const [reminderType, setReminderType] = useState('call');
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  if (!isOpen || !loan) return null;

  const defaultMessages = {
    sms: `Dear ${loan.customerName}, this is a friendly reminder that your gold loan payment of ₹${loan.outstandingAmount.toLocaleString()} is due on ${loan.dueDate}. Please contact us to make the payment. Thank you.`,
    email: `Dear ${loan.customerName},\n\nWe hope this message finds you well. This is a gentle reminder regarding your gold loan (${loan.id}) with us.\n\nPayment Details:\n- Amount Due: ₹${loan.outstandingAmount.toLocaleString()}\n- Due Date: ${loan.dueDate}\n- Gold Item: ${loan.goldItem}\n\nPlease contact us at your earliest convenience to process this payment.\n\nThank you for your business.\n\nBest regards,\nYour Gold Loan Team`,
    whatsapp: `Hi ${loan.customerName}! 👋\n\nFriendly reminder about your gold loan payment:\n💰 Amount: ₹${loan.outstandingAmount.toLocaleString()}\n📅 Due: ${loan.dueDate}\n🏆 Loan ID: ${loan.id}\n\nPlease let us know when you'd like to make the payment. We're here to help! 😊`
  };

  const handleSendReminder = () => {
    const message = customMessage || defaultMessages[reminderType];
    
    if (reminderType === 'call') {
      window.location.href = `tel:${loan.customerPhone}`;
    } else if (reminderType === 'sms') {
      window.location.href = `sms:${loan.customerPhone}?body=${encodeURIComponent(message)}`;
    } else if (reminderType === 'whatsapp') {
      window.open(`https://wa.me/${loan.customerPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    }

    onAction({
      type: 'reminder_sent',
      loanId: loan.id,
      reminderType,
      message,
      scheduledDate: isScheduled ? scheduledDate : null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Payment Reminder</h2>
              <p className="text-sm text-gray-600">{loan.customerName} - {loan.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Loan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{loan.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{loan.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-gray-600">Outstanding:</span>
                <span className="font-medium text-red-600">₹{loan.outstandingAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{loan.dueDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-gray-400" />
                <span className="text-gray-600">Gold Item:</span>
                <span className="font-medium">{loan.goldItem}</span>
              </div>
            </div>
          </div>

          {/* Reminder Type Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Reminder Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'call', label: 'Phone Call', icon: Phone, color: 'green' },
                { value: 'sms', label: 'SMS', icon: MessageSquare, color: 'blue' },
                { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'green' },
                { value: 'email', label: 'Email', icon: Mail, color: 'purple' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReminderType(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    reminderType === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon size={20} className={`mx-auto mb-1 ${
                    reminderType === option.value ? `text-${option.color}-600` : 'text-gray-500'
                  }`} />
                  <div className={`text-sm font-medium ${
                    reminderType === option.value ? `text-${option.color}-900` : 'text-gray-700'
                  }`}>
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview/Edit */}
          {reminderType !== 'call' && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Message Content</h3>
              <textarea
                value={customMessage || defaultMessages[reminderType]}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your custom message here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use the default message template
              </p>
            </div>
          )}

          {/* Schedule Option */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="schedule"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="schedule" className="font-medium text-gray-900">
                Schedule for later
              </label>
            </div>
            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
    <button
      onClick={onClose}
      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
    >
      Cancel
    </button>
    <button
      onClick={handleSendReminder}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {reminderType === 'call'
        ? 'Call Now'
        : isScheduled
        ? 'Schedule Reminder'
        : 'Send Reminder'}
    </button>
  </div>
</div>
    </div>
  );
};

export default PaymentReminderModal;