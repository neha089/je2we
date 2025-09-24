import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, TrendingDown, DollarSign, RefreshCw, Loader2, AlertCircle, Building } from 'lucide-react';
import ApiService from '../services/api.js';
import AddUdharModal from '../components/Udhaar/AddUdhariModal';
import UdhariCard from '../components/Udhaar/UdhariCard';
import UdhariDetailModal from '../components/Udhaar/UdhariDetailModal';
import UdhariPaymentModal from '../components/Udhaar/UdhariPaymentModal';
import CustomerSearch from "../components/CustomerSearch";

const Udhaar = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUdhariModal, setShowAddUdhariModal] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [selectedUdhari, setSelectedUdhari] = useState(null);
  // Removed unused udhariType state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerUdharis, setCustomerUdharis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalToCollect, setTotalToCollect] = useState(0);
  const [totalToPay, setTotalToPay] = useState(0);

  useEffect(() => {
    loadUdharis();
  }, []);

  const loadUdharis = async () => {
    try {
      setLoading(true);
      setError(null);
      const [receivableResponse, payableResponse] = await Promise.all([
        ApiService.getOutstandingToCollectUdhari(),
        ApiService.getOutstandingToPayUdhari(),
      ]);

      const customerMap = new Map();

      if (receivableResponse.success) {
        setTotalToCollect(Number(receivableResponse.data.totalToCollect || 0));
        receivableResponse.data.customerWise.forEach(item => {
          const id = item.customer._id.toString();
          customerMap.set(id, {
            customer: item.customer,
            toCollect: item.totalOutstanding,
            toPay: 0,
            net: item.totalOutstanding,
            transactions: item.udhars.map(u => ({...u, type: 'receivable'})),
            transactionCount: item.udhars.length,
          });
        });
      }

      if (payableResponse.success) {
        setTotalToPay(Number(payableResponse.data.totalToPay || 0));
        payableResponse.data.customerWise.forEach(item => {
          const id = item.customer._id.toString();
          if (customerMap.has(id)) {
            const entry = customerMap.get(id);
            entry.toPay = item.totalOutstanding;
            entry.net = entry.toCollect - entry.toPay;
            entry.transactions = [...entry.transactions, ...item.udhars.map(u => ({...u, type: 'payable'}))];
            entry.transactionCount = entry.transactions.length;
          } else {
            customerMap.set(id, {
              customer: item.customer,
              toCollect: 0,
              toPay: item.totalOutstanding,
              net: -item.totalOutstanding,
              transactions: item.udhars.map(u => ({...u, type: 'payable'})),
              transactionCount: item.udhars.length,
            });
          }
        });
      }

      setCustomerUdharis(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error loading udharis:', error);
      setError('Failed to load udhari data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUdhariSuccess = () => {
    loadUdharis();
  };

  const handleViewUdhari = (customerUdhariData) => {
    setSelectedCustomerData(customerUdhariData);
    setShowDetailModal(true);
  };

  const handlePayment = (transaction) => {
    setSelectedUdhari(transaction);
    setShowDetailModal(false);
    setShowPaymentModal(true);
  };

  const handleDirectPayment = (customerUdhariData) => {
    let targetUdhar = null;
    if (customerUdhariData.net > 0) {
      targetUdhar = customerUdhariData.transactions.find(t => t.udharType === 'GIVEN' && t.outstandingPrincipal > 0);
    } else if (customerUdhariData.net < 0) {
      targetUdhar = customerUdhariData.transactions.find(t => t.udharType === 'TAKEN' && t.outstandingPrincipal > 0);
    }
    if (targetUdhar) {
      setSelectedUdhari(targetUdhar);
      setShowPaymentModal(true);
    } else {
      handleViewUdhari(customerUdhariData);
    }
  };

  const handlePaymentSuccess = () => {
    loadUdharis();
    setShowPaymentModal(false);
    setShowDetailModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const filterUdharis = (udharis) => {
    if (!searchTerm) return udharis;
    return udharis.filter(udhari =>
      udhari.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      udhari.customer?.phone?.includes(searchTerm)
    );
  };

  const filteredCustomerUdharis = filterUdharis(customerUdharis);

  const getTabUdharis = () => {
    if (activeTab === 'overview') return filteredCustomerUdharis;
    if (activeTab === 'receivable') return filteredCustomerUdharis.filter(c => c.toCollect > 0);
    if (activeTab === 'payable') return filteredCustomerUdharis.filter(c => c.toPay > 0);
    return [];
  };

  const tabUdharis = getTabUdharis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Udhari Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Track and manage your credit transactions seamlessly</p>
          </div>
          <button
            onClick={() => setShowAddUdhariModal(true)}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            <Plus size={20} />
            Add Udhari
          </button>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-row flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-[250px] max-w-[33.33%] bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">To Collect</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totalToCollect)}</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{customerUdharis.filter(c => c.toCollect > 0).length} customers</p>
          </div>

          <div className="flex-1 min-w-[250px] max-w-[33.33%] bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">To Pay</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalToPay)}</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{customerUdharis.filter(c => c.toPay > 0).length} customers</p>
          </div>

          <div className="flex-1 min-w-[250px] max-w-[33.33%] bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-xl sm:text-2xl font-bold ${(totalToCollect - totalToPay) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalToCollect - totalToPay)}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Overall position</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
          <div className="w-full sm:w-96">
            <CustomerSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onCustomerSelect={(customer) => {
                console.log("Selected customer:", customer);
                // Optionally open details modal
              }}
              onCreateCustomer={() => {
                console.log("Create new customer clicked");
                // Optionally open Add Customer modal
              }}
            />
          </div>

          <button
            onClick={loadUdharis}
            className="p-2 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={20} className={`text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('receivable')}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'receivable' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            To Collect ({customerUdharis.filter(c => c.toCollect > 0).length})
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'payable' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            To Pay ({customerUdharis.filter(c => c.toPay > 0).length})
          </button>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto" />
              <p className="text-gray-500 mt-4 text-sm sm:text-base">Loading udharis...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto" />
              <p className="text-red-600 mt-4 text-sm sm:text-base">{error}</p>
              <button
                onClick={loadUdharis}
                className="mt-4 px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {tabUdharis.length > 0 ? (
                <div className="flex flex-row overflow-x-auto gap-4 pb-4">
                  {tabUdharis.map((customerdata) => (
                    <div key={customerdata.customer._id} className="min-w-[300px] flex-shrink-0">
                      <UdhariCard
                        udhari={customerdata}
                        onView={() => handleViewUdhari(customerdata)}
                        onPayment={() => handleDirectPayment(customerdata)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building size={40} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Udharis Found</h3>
                  <p className="text-gray-500 mb-6 text-sm sm:text-base">Start by adding your first udhari transaction</p>
                  <button
                    onClick={() => setShowAddUdhariModal(true)}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Add Your First Udhari
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <AddUdharModal
          isOpen={showAddUdhariModal}
          onClose={() => setShowAddUdhariModal(false)}
          onSuccess={handleAddUdhariSuccess}
        />
        <UdhariDetailModal
          isOpen={showDetailModal}
          customerData={selectedCustomerData}
          onClose={() => setShowDetailModal(false)}
          onPayment={handlePayment}
        />
        <UdhariPaymentModal
          isOpen={showPaymentModal}
          udhari={selectedUdhari}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default Udhaar;