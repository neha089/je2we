import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RefreshCw, 
  AlertCircle,
  Coins,
  Weight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import ApiService from '../services/api';
import SilverTransactionForm from './SilverBuySell/SilverTransactionForm';
import TransactionViewModal from './TransactionViewModal';
import TransactionTable from './TransactionTable';

const SilverTransactionTab = ({ customerId, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [summary, setSummary] = useState({
    totalBuyAmount: 0,
    totalBuyWeight: 0,
    totalBuyTransactions: 0,
    totalSellAmount: 0,
    totalSellWeight: 0,
    totalSellTransactions: 0
  });

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadTransactions();
    } catch (error) {
      setError('Failed to load silver transaction data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await ApiService.getSilverTrnsactionByCustomerId(customerId);
      console.log("API Response:", response);
      if (response.success) {
        setTransactions(response.data || []);
        if (response.stats) {
          setSummary({
            totalBuyAmount: (response.stats.buy?.totalSaleAmount || 0) / 100,
            totalBuyWeight: response.stats.buy?.totalWeight || 0,
            totalBuyTransactions: response.stats.buy?.totalTransactions || 0,
            totalSellAmount: (response.stats.sell?.totalSaleAmount || 0) / 100,
            totalSellWeight: response.stats.sell?.totalWeight || 0,
            totalSellTransactions: response.stats.sell?.totalTransactions || 0
          });
        }
      } else {
        throw new Error(response.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      throw error;
    }
  };

  const handleView = (transaction) => {
    setViewingTransaction(transaction);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this silver transaction?')) {
      try {
        setLoading(true);
        const response = await ApiService.deleteSilverTransaction(id);
        if (response.success) {
          await loadData();
          if (onRefresh) onRefresh();
        }
      } catch (error) {
        setError('Failed to delete transaction');
        console.error('Error deleting transaction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    await loadData();
    if (onRefresh) onRefresh();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setError(null);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading silver transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Silver Transactions</h3>
          <p className="text-sm text-gray-500">
            {customerId ? 'Customer silver transaction history' : 'All silver transactions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowDownRight size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Buy Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(summary.totalBuyAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Total amount spent on silver purchases</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Weight size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Buy Weight</p>
              <p className="text-2xl font-bold text-gray-900">
                {(summary.totalBuyWeight || 0).toFixed(2)}g
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Total weight of silver purchased</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Coins size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Buy Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalBuyTransactions || 0}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Total number of buy transactions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowUpRight size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sell Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(summary.totalSellAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Total amount from silver sales</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Weight size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sell Weight</p>
              <p className="text-2xl font-bold text-gray-900">
                {(summary.totalSellWeight || 0).toFixed(2)}g
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Total weight of silver sold</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Coins size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sell Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalSellTransactions || 0}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Total number of sell transactions</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hiddenn ">
        {transactions.length > 0 ? (
          <TransactionTable
            transactions={transactions}
            onView={handleView}
            onDelete={handleDelete}
            loading={loading}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        ) : (
          <div className="p-12 text-center">
            <Coins size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Silver Transactions</h3>
            <p className="text-gray-500 mb-6">
              {customerId 
                ? "This customer hasn't made any silver transactions yet" 
                : "Get started by creating your first silver transaction"
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Create First Transaction
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <SilverTransactionForm
          editingTransaction={null}
          silverRates={null}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          onError={setError}
        />
      )}

      {viewingTransaction && (
        <TransactionViewModal
          transaction={viewingTransaction}
          onClose={() => setViewingTransaction(null)}
          onEdit={null}
        />
      )}
    </div>
  );
};

export default SilverTransactionTab;