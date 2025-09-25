import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Lock } from 'lucide-react';
import ApiService from '../services/api';
import MetalItemsManager from './MetalItemsManager';

const GoldTransactionForm = ({ 
  editingTransaction, 
  GoldRates, 
  onClose, 
  onSuccess, 
  onError,
  initialCustomer,
  initialTransactionType
}) => {
  const [loading, setLoading] = useState(false);
  const [currentPrices, setCurrentPrices] = useState(null);
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    transactionType: initialTransactionType || 'BUY',
    customerId: initialCustomer?._id || '',
    Amount: 0,
    paymentMode: 'CASH',
    notes: '',
    billNumber: '',
    originalAmount: 0,
    additionalPayment: 0,
    additionalPaymentMode: 'CASH'
  });

  useEffect(() => {
   
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      setIsEditing(true);
      populateEditForm();
    } else {
      setIsEditing(false);
    }
  }, [editingTransaction]);

  
  const populateEditForm = () => {
    const transaction = editingTransaction;
    const original = transaction.Amount ? transaction.Amount : 0;

    setFormData({
      transactionType: transaction.transactionType,
      customerId: transaction.customer?._id || transaction.supplier?._id || initialCustomer?._id || '',
      Amount: original,
      originalAmount: original,
      additionalPayment: 0,
      additionalPaymentMode: 'CASH',
      paymentMode: transaction.paymentMode || 'CASH',
      notes: transaction.notes || '',
      billNumber: transaction.invoiceNumber || ''
    });

    if (transaction.items && transaction.items.length > 0) {
      const transactionItems = transaction.items.map(item => ({
        id: item.id || Date.now() + Math.random(),
        itemName: item.name || item.itemName || '',
        description: item.description || '',
        purity: item.purity || '925',
        weight: item.weight ? item.weight.toString() : '',
        ratePerGram: item.ratePerGram ? item.ratePerGram.toString() : '',
        makingCharges: item.makingCharges ? item.makingCharges.toString() : '0',
        wastage: item.wastage ? item.wastage.toString() : '0',
        taxAmount: item.taxAmount ? item.taxAmount.toString() : '0',
        photos: item.photos || [],
        hallmarkNumber: item.hallmarkNumber || '',
        certificateNumber: item.certificateNumber || ''
      }));
      setItems(transactionItems);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotals = () => {
    if (items.length === 0) {
      return { totalWeight: 0, totalAmount: 0 };
    }

    const totalWeight = items.reduce((sum, item) => {
      return sum + (parseFloat(item.weight) || 0);
    }, 0);

    const totalAmount = items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const rate = parseFloat(item.ratePerGram) || 0;
      const making = parseFloat(item.makingCharges) || 0;
      const wastage = parseFloat(item.wastage) || 0;
      const tax = parseFloat(item.taxAmount) || 0;

      const baseAmount = weight * rate;
      const wastageAmount = (baseAmount * wastage) / 100;
      const itemTotal = baseAmount + wastageAmount + making + tax;

      return total + itemTotal;
    }, 0);

    return { totalWeight, totalAmount };
  };

  const handleSubmit = async (e) => {
    console.log('Submitting form with data:', formData, 'and items:', items);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setLoading(true);
      onError(null);

      if (items.length === 0) {
        onError('Please add at least one item');
        return;
      }

      const hasValidItems = items.some(item => 
        item.itemName && parseFloat(item.weight) > 0 && parseFloat(item.ratePerGram) > 0
      );

      if (!hasValidItems) {
        onError('Please add at least one valid item with name, weight, and rate');
        return;
      }

      if (isEditing) {
        if (!formData.customerId) {
          onError('Missing customer information for update');
          return;
        }

        const original = parseFloat(formData.originalAmount) || 0;
        const additionalPayment = parseFloat(formData.additionalPayment) || 0;
        const newTotal = original + additionalPayment;

        const updateData = {
          transactionType: formData.transactionType,
          customer: formData.customerId,
          items: items.map(item => ({
            name: item.itemName,
            itemName: item.itemName,
            description: item.description || "",
            weight: parseFloat(item.weight) || 0,
            purity: item.purity || "925",
            ratePerGram: parseFloat(item.ratePerGram) || 0,
            makingCharges: parseFloat(item.makingCharges) || 0,
            wastage: parseFloat(item.wastage) || 0,
            taxAmount: parseFloat(item.taxAmount) || 0,
            photos: item.photos || [],
            hallmarkNumber: item.hallmarkNumber || '',
            certificateNumber: item.certificateNumber || ''
          })),
          Amount: newTotal,
          paymentMode: additionalPayment > 0 ? formData.additionalPaymentMode : formData.paymentMode,
          notes: formData.notes || "",
          billNumber: formData.billNumber || "",
          additionalPayment: additionalPayment,
          additionalPaymentMode: formData.additionalPaymentMode,
          originalAmount: original
        };

        const transactionId = editingTransaction.id || editingTransaction._id;
        if (!transactionId) {
          onError('Transaction ID is missing');
          return;
        }

        const response = await ApiService.updateGoldTransaction(transactionId, updateData);

        if (response && (response.success !== false) && !response.error) {
          onSuccess();
        } else {
          const errorMessage = response?.message || response?.error || response?.data?.message || 'Failed to update transaction';
          onError(errorMessage);
        }
      } else {
        if (!formData.customerId) {
          onError('Customer ID is required');
          return;
        }

        const transactionData = {
          transactionType: formData.transactionType,
          items: items.map(item => ({
            itemName: item.itemName,
            description: item.description || '',
            purity: item.purity,
            weight: parseFloat(item.weight),
            ratePerGram: parseFloat(item.ratePerGram),
            makingCharges: parseFloat(item.makingCharges) || 0,
            wastage: parseFloat(item.wastage) || 0,
            taxAmount: parseFloat(item.taxAmount) || 0,
            hallmarkNumber: item.hallmarkNumber || '',
            certificateNumber: item.certificateNumber || '',
            photos: item.photos || []
          })),
          Amount: parseFloat(formData.Amount) || 0,
          paymentMode: formData.paymentMode,
          notes: formData.notes,
          billNumber: formData.billNumber,
          fetchCurrentRates: true,
          customer: formData.customerId
        };
        console.log('Creating transaction with data:', transactionData);
        const response = await ApiService.createGoldTransaction(transactionData);
            console.log('API response:', response);

        if (response && (response.success !== false) && !response.error) {
          onSuccess();
        } else {
          const errorMessage = response?.message || response?.error || response?.data?.message || 'Failed to create transaction';
          onError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = isEditing ? 'Failed to update transaction' : 'Failed to create transaction';
      onError(`${errorMessage}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const { totalWeight, totalAmount } = calculateTotals();
  const totalPaidAmount = parseFloat(formData.originalAmount) + parseFloat(formData.additionalPayment);
  const remainingAmount = totalAmount - totalPaidAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit' : 'New'} Gold Transaction
              {isEditing && <span className="text-sm text-gray-500 ml-2">(Transaction type is locked)</span>}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="flex rounded-lg border border-gray-300">
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg ${
                    formData.transactionType === 'BUY'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-gray-700'
                  } opacity-50 cursor-not-allowed`}
                >
                  <Lock className="w-4 h-4 inline mr-1" />
                  Buy Gold
                </button>
                <button
                  type="button"
                  disabled
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg ${
                    formData.transactionType === 'SELL'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700'
                  } opacity-50 cursor-not-allowed`}
                >
                  <Lock className="w-4 h-4 inline mr-1" />
                  Sell Gold
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Transaction Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Weight:</span>
                  <span className="font-medium">{totalWeight.toFixed(2)} grams</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                </div>
                {isEditing && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Original Amount:</span>
                      <span className="font-medium">₹{formData.originalAmount.toFixed(2)}</span>
                    </div>
                    {parseFloat(formData.additionalPayment) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Additional Payment:</span>
                        <span className="font-medium text-green-600">₹{parseFloat(formData.additionalPayment).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm text-gray-600">Total Paid:</span>
                      <span className="font-bold">₹{totalPaidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className={`font-bold ${remainingAmount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{remainingAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <MetalItemsManager
                items={items}
                onItemsChange={setItems}
                metalType="Gold"
                currentPrices={currentPrices}
                loading={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Payment (₹)</label>
                    <input
                      type="number"
                      name="additionalPayment"
                      value={formData.additionalPayment}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                      placeholder="Enter additional payment amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Payment Mode</label>
                    <select
                      name="additionalPaymentMode"
                      value={formData.additionalPaymentMode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Amount</label>
                    <input
                      type="number"
                      value={formData.originalAmount}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      name="Amount"
                      value={formData.Amount}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bill Number</label>
                    <input
                      type="text"
                      name="billNumber"
                      value={formData.billNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                placeholder="Additional notes about the transaction..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
              </div>
              {isEditing ? (
                <>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>Original Amount:</span>
                    <span>₹{formData.originalAmount.toFixed(2)}</span>
                  </div>
                  {parseFloat(formData.additionalPayment) > 0 && (
                    <div className="flex justify-between items-center mt-1 text-sm text-green-600">
                      <span>Additional Payment:</span>
                      <span>₹{parseFloat(formData.additionalPayment).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-1 text-sm font-medium text-gray-700 border-t pt-2">
                    <span>Total Paid:</span>
                    <span>₹{totalPaidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className={`font-bold ${remainingAmount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{remainingAmount.toFixed(2)}
                      {remainingAmount <= 0 && <span className="text-xs ml-1">(PAID)</span>}
                    </span>
                  </div>
                </>
              ) : (
                parseFloat(formData.Amount) > 0 && (
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>Remaining Amount:</span>
                    <span>₹{(totalAmount - parseFloat(formData.Amount)).toFixed(2)}</span>
                  </div>
                )
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || items.length === 0}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditing ? 'Update Transaction' : 'Save Transaction'
                )}
              </button>
            </div>

            {isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Update Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Transaction type is locked</li>
                  <li>• You can modify items, quantities, rates, and other transaction details</li>
                  <li>• Add additional payments to complete remaining balance</li>
                  <li>• All changes will be saved when you click "Update Transaction"</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldTransactionForm;