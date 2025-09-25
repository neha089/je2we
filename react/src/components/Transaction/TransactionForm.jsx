import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import ApiService from "../../services/api";
import MetalPriceService from "../../services/metalPriceService";
import AmountField from "../AmountField";
import PhotoUpload from "../PhotoUpload";
import AddLoanModal from "../AddLoanModal";
import LInterestPaymentModal from "../Loan/LInterestPaymentModal";
import LoanPaymentModal from "../Loan/LoanPaymentModal";
import AddUdharModal from "../AddUdhariModal";
import UdhariPaymentModal from "../Udhaar/UdhariPaymentModal";
import GoldTransactionForm from "../GoldTransactionForm";
import SilverTransactionForm from "../SilverTransactionForm";
import AddGoldLoanModal from "../AddGoldLoanModal";
import AddSilverLoanModal from "../AddSilverLoanModal"; // NEW: Import AddSilverLoanModal
import InterestPaymentModal from "../InterestPaymentModal";
import SInterestPaymentModal from "../SInterestPaymentModal"; // NEW: Import SInterestPaymentModal
import ItemRepaymentModal from "../ItemRepaymentModal";
import SItemRepaymentModal from "../SItemRepaymentModal"; // NEW: Import SItemRepaymentModal

// Enhanced Loan Selection Modal (unchanged)
const LoanSelectionModal = ({ isOpen, onClose, onBack, availableLoans, onSelect, categoryId }) => {
  if (!isOpen) return null;

  const getModalTitle = () => {
    if (categoryId === "interest-received-l" || categoryId === "interest-paid-l" || 
        categoryId === "interest-received-gl" || categoryId === "interest-received-sl") 
      return "Select Loan for Interest Payment";
    if (categoryId === "loan-repayment" || categoryId === "loan-repayment-collect" || 
        categoryId === "loan-repayment-pay" || categoryId === "gold-loan-repayment" || 
        categoryId === "silver-loan-repayment") 
      return "Select Loan for Repayment";
    return "Select a Loan";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">{getModalTitle()}</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {availableLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No loans found for this customer</p>
            </div>
          ) : (
            availableLoans.map((loan) => (
              <div
                key={loan._id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  onSelect(loan._id);
                  onClose();
                }}
              >
                <p className="font-medium">Loan #{loan._id.slice(-6)}</p>
                <p className="text-sm text-gray-600">
                  Outstanding: ₹{((loan.outstandingAmount || loan.principalRupees || 0) ).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Interest Rate: {loan.interestRateMonthlyPct}% monthly
                </p>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                  {loan.loanType && (
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      loan.loanType === 'GIVEN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {loan.loanType === 'GIVEN' ? 'To Collect' : 'To Pay'}
                    </span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>
        <button
          onClick={onBack}
          className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const TransactionForm = ({
  selectedCustomer,
  selectedCategory,
  transactionType,
  onBack,
  onCancel,
  onSuccess,
}) => {
  // Modal states
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoanSelectionModalOpen, setIsLoanSelectionModalOpen] = useState(false);
  const [isUdharModalOpen, setIsUdharModalOpen] = useState(false);
  const [isUdharPaymentModalOpen, setIsUdharPaymentModalOpen] = useState(false);
  const [isAddGoldLoanModalOpen, setIsAddGoldLoanModalOpen] = useState(false);
  const [isAddSilverLoanModalOpen, setIsAddSilverLoanModalOpen] = useState(false); // NEW: State for silver loan modal
  const [isGoldInterestModalOpen, setIsGoldInterestModalOpen] = useState(false);
  const [isSilverInterestModalOpen, setIsSilverInterestModalOpen] = useState(false); // NEW: State for silver interest modal
  const [isItemRepaymentModalOpen, setIsItemRepaymentModalOpen] = useState(false);
  const [isSilverItemRepaymentModalOpen, setIsSilverItemRepaymentModalOpen] = useState(false); // NEW: State for silver repayment modal
  
  // Selected items
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedUdhar, setSelectedUdhar] = useState(null);
  
  // Loading and data states
  const [loansLoaded, setLoansLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Available data
  const [availableLoans, setAvailableLoans] = useState([]);
  const [availableUdhars, setAvailableUdhars] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [currentMetalPrices, setCurrentMetalPrices] = useState(null);
  const [interestSummary, setInterestSummary] = useState(null);

  // Transaction data
  const [transactionData, setTransactionData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    goldWeight: "",
    goldType: "22K",
    goldPurity: "916",
    goldRate: "6500",
    interestRate: "2.5",
    durationMonths: "6",
    selectedLoanId: "",
    photos: [],
    items: [],
    partyName: "",
    supplierName: "",
    supplierPhone: "",
    supplierAddress: "",
    supplierGST: "",
    advanceAmount: "0",
    paymentMode: "CASH",
    billNumber: "",
    repaymentType: "partial",
    principalAmount: "",
    interestAmount: "",
    selectedUdhariId: "",
  });

  // Helper functions
  const updateTransactionData = (updates) => {
    setTransactionData(prev => ({ ...prev, ...updates }));
  };

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setTransactionData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemsChange = (items) => {
    setTransactionData((prev) => ({ ...prev, items }));
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: "" }));
    }
  };

  // API calls
  const fetchCustomerLoans = async () => {
    try {
      setLoadingLoans(true);
      let loans = [];
      
      if (selectedCategory.id === "interest-received-gl" || selectedCategory.id === "gold-loan-repayment") {
        const response = await ApiService.getGoldLoansByCustomer(selectedCustomer._id);
        loans = response.data || [];
        loans = loans.map(loan => ({
          ...loan,
          _id: loan._id || null,
          outstandingAmount: loan.outstandingAmount || loan.currentPrincipal || 0,
          interestRateMonthlyPct: loan.interestRateMonthlyPct || 0,
          customer: loan.customer || { name: selectedCustomer.name },
          dueDate: loan.dueDate || null,
          notes: loan.notes || '',
          status: loan.status || 'ACTIVE'
        }));
      } else if (selectedCategory.id === "interest-received-sl" || selectedCategory.id === "silver-loan-repayment") {
        // NEW: Fetch silver loans for the customer
        const response = await ApiService.getSilverLoansByCustomer(selectedCustomer._id);
        loans = response.data || [];
        loans = loans.map(loan => ({
          ...loan,
          _id: loan._id || null,
          outstandingAmount: loan.outstandingAmount || loan.currentPrincipal || 0,
          interestRateMonthlyPct: loan.interestRateMonthlyPct || 0,
          customer: loan.customer || { name: selectedCustomer.name },
          dueDate: loan.dueDate || null,
          notes: loan.notes || '',
          status: loan.status || 'ACTIVE'
        }));
      } else {
        const [receivableResponse, payableResponse] = await Promise.all([
          ApiService.getOutstandingToCollectLoan(),
          ApiService.getOutstandingToPayLoan()
        ]);

        const allLoans = [];
        if (receivableResponse.success) {
          const customerReceivableData = receivableResponse.data.customerWise.find(
            item => item.customer._id === selectedCustomer._id
          );
          if (customerReceivableData && customerReceivableData.loans) {
            allLoans.push(...customerReceivableData.loans.map(loan => ({
              ...loan,
              loanType: 'GIVEN'
            })));
          }
        }

        if (payableResponse.success) {
          const customerPayableData = payableResponse.data.customerWise.find(
            item => item.customer._id === selectedCustomer._id
          );
          if (customerPayableData && customerPayableData.loans) {
            allLoans.push(...customerPayableData.loans.map(loan => ({
              ...loan,
              loanType: 'TAKEN'
            })));
          }
        }

        if (selectedCategory.id === "interest-received-l" || selectedCategory.id === "loan-repayment-collect") {
          loans = allLoans.filter(loan => loan.loanType === 'GIVEN');
        } else if (selectedCategory.id === "interest-paid-l" || selectedCategory.id === "loan-repayment-pay") {
          loans = allLoans.filter(loan => loan.loanType === 'TAKEN');
        } else if (selectedCategory.id === "loan-repayment") {
          loans = allLoans;
        }
      }
      
      setAvailableLoans(loans.filter((loan) => loan._id && (loan.status === "ACTIVE" || loan.status === "PARTIALLY_PAID")));
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      setErrors((prev) => ({ ...prev, loans: "Failed to load loans" }));
    } finally {
      setLoadingLoans(false);
    }
  };

  const fetchCustomerUdhars = async () => {
    try {
      const response = await ApiService.getUdharsByCustomer(selectedCustomer._id);
      setAvailableUdhars(response.data || []);
    } catch (error) {
      console.error("Failed to fetch udhars:", error);
      setErrors((prev) => ({ ...prev, udhars: "Failed to load udhars" }));
    }
  };

  const fetchCurrentMetalPrices = async () => {
    try {
      const prices = await MetalPriceService.getCurrentPrices();
      setCurrentMetalPrices(prices);

      if (
        transactionData.items.length === 0 &&
        (selectedCategory?.id.includes("gold") || selectedCategory?.id.includes("silver"))
      ) {
        const metalType = selectedCategory?.id.includes("gold") ? "Gold" : "Silver";
        const defaultPurity = metalType === "Gold" ? "22K" : "925";
        const currentPrice = metalType === "Gold" ? prices.gold.rates[defaultPurity] : prices.silver.rates[defaultPurity];

        const newItem = {
          id: Date.now(),
          itemName: "",
          description: "",
          purity: defaultPurity,
          weight: "",
          ratePerGram: currentPrice ? (currentPrice / 100).toString() : "",
          makingCharges: "0",
          wastage: "0",
          taxAmount: "0",
          photos: [],
          hallmarkNumber: "",
          certificateNumber: "",
        };

        setTransactionData((prev) => ({
          ...prev,
          items: [newItem],
        }));
      }
    } catch (error) {
      console.error("Failed to fetch metal prices:", error);
    }
  };

  // Effects
  useEffect(() => {
    const isInterestPayment = selectedCategory?.id.includes("interest-received") || selectedCategory?.id.includes("interest-paid");
    const isRepayment = selectedCategory?.id.includes("repayment");
    const isUdhari = selectedCategory?.id.includes("udhari");
    const isLoanTransaction = selectedCategory?.id.includes("loan") || selectedCategory?.id.includes("-l") || 
                             selectedCategory?.id.includes("-gl") || selectedCategory?.id.includes("-sl");

    setIsLoanModalOpen(false);
    setIsInterestModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsLoanSelectionModalOpen(false);
    setIsUdharModalOpen(false);
    setIsUdharPaymentModalOpen(false);
    setIsAddGoldLoanModalOpen(false);
    setIsAddSilverLoanModalOpen(false); // NEW: Reset silver loan modal
    setIsGoldInterestModalOpen(false);
    setIsSilverInterestModalOpen(false); // NEW: Reset silver interest modal
    setIsItemRepaymentModalOpen(false);
    setIsSilverItemRepaymentModalOpen(false); // NEW: Reset silver repayment modal
    setErrors({});
    setLoansLoaded(false);

    if ((isInterestPayment || isRepayment) && isLoanTransaction && selectedCustomer) {
      fetchCustomerLoans().then(() => {
        setLoansLoaded(true);
      });
    }

    if (isUdhari && selectedCustomer) {
      fetchCustomerUdhars();
    }

    if (selectedCategory?.id.includes("gold") || selectedCategory?.id.includes("silver")) {
      fetchCurrentMetalPrices();
    }
  }, [selectedCategory, selectedCustomer]);

  useEffect(() => {
    if (!selectedCategory) return;

    const categoryId = selectedCategory.id;
    
    if (categoryId === "business-loan-given" || categoryId === "business-loan-taken") {
      setIsLoanModalOpen(true);
      return;
    }

    if (categoryId === "udhari-given" || categoryId === "udhari-taken") {
      setIsUdharModalOpen(true);
      return;
    }

    if (categoryId === "gold-loan") {
      setIsAddGoldLoanModalOpen(true);
      return;
    }

    if (categoryId === "silver-loan") { // NEW: Handle silver loan creation
      setIsAddSilverLoanModalOpen(true);
      return;
    }

    if (loansLoaded && (
      categoryId === "interest-received-l" || 
      categoryId === "interest-paid-l" || 
      categoryId === "loan-repayment" ||
      categoryId === "loan-repayment-collect" ||
      categoryId === "loan-repayment-pay"
    )) {
      if (!transactionData.selectedLoanId) {
        setIsLoanSelectionModalOpen(true);
      } else {
        const loan = availableLoans.find((loan) => loan._id === transactionData.selectedLoanId);
        if (loan) {
          setSelectedLoan(loan);
          if (categoryId === "interest-received-l" || categoryId === "interest-paid-l") {
            setIsInterestModalOpen(true);
          } else if (
            categoryId === "loan-repayment" || 
            categoryId === "loan-repayment-collect" || 
            categoryId === "loan-repayment-pay"
          ) {
            setIsPaymentModalOpen(true);
          }
        } else {
          setIsLoanSelectionModalOpen(true);
        }
      }
    }

    if (loansLoaded && categoryId === "interest-received-gl") {
      if (!transactionData.selectedLoanId) {
        setIsLoanSelectionModalOpen(true);
      } else {
        const loan = availableLoans.find((loan) => loan._id === transactionData.selectedLoanId);
        if (loan) {
          setSelectedLoan(loan);
          setIsGoldInterestModalOpen(true);
        } else {
          setIsLoanSelectionModalOpen(true);
        }
      }
    }

    if (loansLoaded && categoryId === "interest-received-sl") { // NEW: Handle silver interest payment
      if (!transactionData.selectedLoanId) {
        setIsLoanSelectionModalOpen(true);
      } else {
        const loan = availableLoans.find((loan) => loan._id === transactionData.selectedLoanId);
        if (loan) {
          setSelectedLoan(loan);
          setIsSilverInterestModalOpen(true);
        } else {
          setIsLoanSelectionModalOpen(true);
        }
      }
    }

    if (loansLoaded && categoryId === "gold-loan-repayment") {
      if (!transactionData.selectedLoanId) {
        setIsLoanSelectionModalOpen(true);
      } else {
        const loan = availableLoans.find((loan) => loan._id === transactionData.selectedLoanId);
        if (loan) {
          setSelectedLoan(loan);
          setIsItemRepaymentModalOpen(true);
        } else {
          setIsLoanSelectionModalOpen(true);
        }
      }
    }

    if (loansLoaded && categoryId === "silver-loan-repayment") { // NEW: Handle silver loan repayment
      if (!transactionData.selectedLoanId) {
        setIsLoanSelectionModalOpen(true);
      } else {
        const loan = availableLoans.find((loan) => loan._id === transactionData.selectedLoanId);
        if (loan) {
          setSelectedLoan(loan);
          setIsSilverItemRepaymentModalOpen(true);
        } else {
          setIsLoanSelectionModalOpen(true);
        }
      }
    }

    if (categoryId === "udhari-repayment" && transactionData.selectedUdhariId) {
      const udhar = availableUdhars.find((udhar) => udhar._id === transactionData.selectedUdhariId);
      if (udhar) {
        setSelectedUdhar(udhar);
        setIsUdharPaymentModalOpen(true);
      }
    }
  }, [loansLoaded, selectedCategory, transactionData.selectedLoanId, transactionData.selectedUdhariId, availableLoans, availableUdhars]);

  // Database storage handlers
  const handleCreateTransactionRecord = async (transactionData, category) => {
    try {
      const baseTransactionData = {
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.name,
        transactionType: category,
        amount: transactionData.amount || transactionData.totalAmount,
        description: transactionData.description || transactionData.note || `${category} transaction`,
        date: new Date().toISOString(),
        status: 'COMPLETED',
        ...transactionData
      };

      const transactionResponse = await ApiService.createTransactionRecord(baseTransactionData);
      
      if (transactionResponse.success) {
        console.log(`Transaction record created successfully for ${category}`);
      }
      
      return transactionResponse;
    } catch (error) {
      console.error(`Failed to create transaction record for ${category}:`, error);
      throw error;
    }
  };

  const handleLoanModalSuccess = async (loanData) => {
    try {
      await handleCreateTransactionRecord({
        amount: loanData.principalAmount || loanData.totalAmount,
        description: `Business loan ${selectedCategory?.id === "business-loan-given" ? "given to" : "taken from"} ${selectedCustomer.name}`,
        loanId: loanData.loanId || loanData._id,
        interestRate: loanData.interestRate,
        durationMonths: loanData.durationMonths
      }, selectedCategory?.id);
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for loan:', error);
      handleModalSuccess();
    }
  };

  const handleInterestModalSuccess = async (interestData) => {
    try {
      await handleCreateTransactionRecord({
        amount: interestData.interestAmount || interestData.amount,
        description: `Interest payment ${selectedCategory?.id.includes("-gl") ? "for gold loan" : selectedCategory?.id.includes("-sl") ? "for silver loan" : ""} ${selectedLoan?.loanType === 'GIVEN' ? "received from" : "paid to"} ${selectedCustomer.name}`,
        loanId: interestData.loanId || selectedLoan?._id,
        paymentMethod: interestData.paymentMethod,
        reference: interestData.reference,
        notes: interestData.notes
      }, selectedCategory?.id);
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for interest:', error);
      handleModalSuccess();
    }
  };

  const handleLoanPaymentModalSuccess = async (paymentData) => {
    try {
      await handleCreateTransactionRecord({
        amount: (parseFloat(paymentData.principalAmount || 0) + parseFloat(paymentData.interestAmount || 0)),
        description: `Loan repayment ${selectedLoan?.loanType === 'GIVEN' ? "received from" : "paid to"} ${selectedCustomer.name}`,
        loanId: paymentData.loanId || selectedLoan?._id,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        principalAmount: paymentData.principalAmount,
        interestAmount: paymentData.interestAmount
      }, selectedCategory?.id);
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for loan payment:', error);
      handleModalSuccess();
    }
  };

  const handleUdharModalSuccess = async (udharData) => {
    try {
      await handleCreateTransactionRecord({
        amount: udharData.principalAmount || udharData.totalAmount,
        description: `Udhari ${selectedCategory?.id === "udhari-given" ? "given to" : "taken from"} ${selectedCustomer.name}`,
        udharId: udharData.udharId || udharData._id,
        dueDate: udharData.dueDate
      }, selectedCategory?.id);
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for udhari:', error);
      handleModalSuccess();
    }
  };

  const handleUdharPaymentModalSuccess = async (paymentData) => {
    try {
      await handleCreateTransactionRecord({
        amount: paymentData.amount,
        description: `Udhari repayment from ${selectedCustomer.name}`,
        udharId: paymentData.udharId || selectedUdhar?._id,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference
      }, 'udhari-repayment');
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for udhari payment:', error);
      handleModalSuccess();
    }
  };

  const handleGoldLoanModalSuccess = async (loanData) => {
    try {
      await handleCreateTransactionRecord({
        amount: loanData.totalLoanAmount,
        description: `Gold loan given to ${selectedCustomer.name}`,
        loanId: loanData._id,
        interestRate: loanData.interestRateMonthlyPct,
        items: loanData.items
      }, 'gold-loan');
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for gold loan:', error);
      handleModalSuccess();
    }
  };

  const handleSilverLoanModalSuccess = async (loanData) => { // NEW: Handle silver loan success
    try {
      await handleCreateTransactionRecord({
        amount: loanData.totalLoanAmount,
        description: `Silver loan given to ${selectedCustomer.name}`,
        loanId: loanData._id,
        interestRate: loanData.interestRateMonthlyPct,
        items: loanData.items
      }, 'silver-loan');
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for silver loan:', error);
      handleModalSuccess();
    }
  };

  const handleItemRepaymentModalSuccess = async (repaymentData) => {
    try {
      await handleCreateTransactionRecord({
        amount: repaymentData.repaymentAmount,
        description: `Gold loan item repayment from ${selectedCustomer.name}`,
        loanId: selectedLoan?._id,
        selectedItems: repaymentData.selectedItems,
        paymentMethod: repaymentData.paymentMethod
      }, 'gold-loan-repayment');
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for item repayment:', error);
      handleModalSuccess();
    }
  };

  const handleSilverItemRepaymentModalSuccess = async (repaymentData) => { // NEW: Handle silver repayment success
    try {
      await handleCreateTransactionRecord({
        amount: repaymentData.repaymentAmount,
        description: `Silver loan item repayment from ${selectedCustomer.name}`,
        loanId: selectedLoan?._id,
        selectedItems: repaymentData.selectedItems,
        paymentMethod: repaymentData.paymentMethod
      }, 'silver-loan-repayment');
      
      handleModalSuccess();
    } catch (error) {
      console.error('Failed to create transaction record for silver item repayment:', error);
      handleModalSuccess();
    }
  };

  const handleModalClose = () => {
    setIsLoanModalOpen(false);
    setIsInterestModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsLoanSelectionModalOpen(false);
    setIsUdharModalOpen(false);
    setIsUdharPaymentModalOpen(false);
    setIsAddGoldLoanModalOpen(false);
    setIsAddSilverLoanModalOpen(false); // NEW: Close silver loan modal
    setIsGoldInterestModalOpen(false);
    setIsSilverInterestModalOpen(false); // NEW: Close silver interest modal
    setIsItemRepaymentModalOpen(false);
    setIsSilverItemRepaymentModalOpen(false); // NEW: Close silver repayment modal
    setTransactionData((prev) => ({ ...prev, selectedLoanId: "" }));
    onCancel();
  };

  const handleModalSuccess = () => {
    setIsLoanModalOpen(false);
    setIsInterestModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsLoanSelectionModalOpen(false);
    setIsUdharModalOpen(false);
    setIsUdharPaymentModalOpen(false);
    setIsAddGoldLoanModalOpen(false);
    setIsAddSilverLoanModalOpen(false); // NEW: Reset silver loan modal
    setIsGoldInterestModalOpen(false);
    setIsSilverInterestModalOpen(false); // NEW: Reset silver interest modal
    setIsItemRepaymentModalOpen(false);
    setIsSilverItemRepaymentModalOpen(false); // NEW: Reset silver repayment modal
    onSuccess();
  };

  // Transaction characteristics
  const isInterestPayment = selectedCategory?.id.includes("interest-received") || selectedCategory?.id.includes("interest-paid");
  const isRepayment = selectedCategory?.id.includes("repayment");
  const isGoldLoan = selectedCategory?.id === "gold-loan";
  const isSilverLoan = selectedCategory?.id === "silver-loan"; // NEW: Identify silver loan
  const isGoldLoanRepayment = selectedCategory?.id === "gold-loan-repayment";
  const isSilverLoanRepayment = selectedCategory?.id === "silver-loan-repayment"; // NEW: Identify silver loan repayment
  const isMetalTransaction = selectedCategory?.id.includes("gold") || selectedCategory?.id.includes("silver");
  const isMetalBuySell =
    selectedCategory?.id === "gold-sell" ||
    selectedCategory?.id === "gold-purchase" ||
    selectedCategory?.id === "silver-sell" ||
    selectedCategory?.id === "silver-purchase";
  const isUdhariTransaction = selectedCategory?.id.includes("udhari");
  const isLoanTransaction = selectedCategory?.id.includes("loan") || selectedCategory?.id.includes("-l") || 
                           selectedCategory?.id.includes("-gl") || selectedCategory?.id.includes("-sl");

  const modalHandledCategories = [
    "business-loan-given",
    "business-loan-taken",
    "interest-received-l",
    "interest-paid-l",
    "loan-repayment",
    "loan-repayment-collect",
    "loan-repayment-pay",
    "udhari-given",
    "udhari-taken",
    "udhari-repayment",
    "gold-loan",
    "silver-loan", // NEW: Add silver loan to modal-handled categories
    "interest-received-gl",
    "interest-received-sl", // NEW: Add silver interest to modal-handled categories
    "gold-loan-repayment",
    "silver-loan-repayment" // NEW: Add silver repayment to modal-handled categories
  ];

  const isModalHandled = modalHandledCategories.includes(selectedCategory?.id);

  const isGoldTransaction = selectedCategory?.id === "gold-sell" || selectedCategory?.id === "gold-purchase";
  const isSilverTransaction = selectedCategory?.id === "silver-sell" || selectedCategory?.id === "silver-purchase";

  if (isModalHandled) {
    return (
      <>
        <AddLoanModal
          isOpen={isLoanModalOpen}
          onClose={handleModalClose}
          onSuccess={handleLoanModalSuccess}
          selectedCustomer={selectedCustomer}
          loanType={selectedCategory?.id === "business-loan-given" ? "given" : "taken"}
        />
        <LInterestPaymentModal
          isOpen={isInterestModalOpen}
          loan={selectedLoan}
          onClose={handleModalClose}
          onSuccess={handleInterestModalSuccess}
        />
        <LoanPaymentModal
          isOpen={isPaymentModalOpen}
          loan={selectedLoan}
          onClose={handleModalClose}
          onSuccess={handleLoanPaymentModalSuccess}
        />
        <LoanSelectionModal
          isOpen={isLoanSelectionModalOpen}
          onClose={() => {
            setIsLoanSelectionModalOpen(false);
          }}
          onBack={onBack}
          availableLoans={availableLoans}
          categoryId={selectedCategory?.id}
          onSelect={(loanId) => {
            const loan = availableLoans.find((loan) => loan._id === loanId);
            setSelectedLoan(loan);
            updateTransactionData({ selectedLoanId: loanId });
            
            setIsLoanSelectionModalOpen(false);
            
            if (selectedCategory?.id === "interest-received-l" || selectedCategory?.id === "interest-paid-l") {
              setIsInterestModalOpen(true);
            } else if (
              selectedCategory?.id === "loan-repayment" ||
              selectedCategory?.id === "loan-repayment-collect" ||
              selectedCategory?.id === "loan-repayment-pay"
            ) {
              setIsPaymentModalOpen(true);
            } else if (selectedCategory?.id === "interest-received-gl") {
              setIsGoldInterestModalOpen(true);
            } else if (selectedCategory?.id === "interest-received-sl") { // NEW: Open silver interest modal
              setIsSilverInterestModalOpen(true);
            } else if (selectedCategory?.id === "gold-loan-repayment") {
              setIsItemRepaymentModalOpen(true);
            } else if (selectedCategory?.id === "silver-loan-repayment") { // NEW: Open silver repayment modal
              setIsSilverItemRepaymentModalOpen(true);
            }
          }}
        />
        <AddUdharModal
          isOpen={isUdharModalOpen}
          onClose={handleModalClose}
          onSuccess={handleUdharModalSuccess}
          selectedCustomer={selectedCustomer}
          udharType={selectedCategory?.id === "udhari-given" ? "given" : "taken"}
        />
        <UdhariPaymentModal
          isOpen={isUdharPaymentModalOpen}
          udhari={selectedUdhar}
          onClose={handleModalClose}
          onSuccess={handleUdharPaymentModalSuccess}
        />
        <AddGoldLoanModal
          isOpen={isAddGoldLoanModalOpen}
          onClose={handleModalClose}
          onSave={async (loanData) => {
            const response = await ApiService.createGoldLoan(loanData);
            if (response.success) {
              handleGoldLoanModalSuccess(response.data);
            }
          }}
          selectedCustomer={selectedCustomer}
        />
        <AddSilverLoanModal // NEW: Add silver loan modal
          isOpen={isAddSilverLoanModalOpen}
          onClose={handleModalClose}
          onSave={async (loanData) => {
            const response = await ApiService.createSilverLoan(loanData); // Assuming ApiService.createSilverLoan exists
            if (response.success) {
              handleSilverLoanModalSuccess(response.data);
            }
          }}
          selectedCustomer={selectedCustomer}
        />
        <InterestPaymentModal
          isOpen={isGoldInterestModalOpen}
          loan={selectedLoan}
          onClose={handleModalClose}
          onPaymentSuccess={handleInterestModalSuccess}
        />
        <SInterestPaymentModal // NEW: Add silver interest payment modal
          isOpen={isSilverInterestModalOpen}
          loan={selectedLoan}
          onClose={handleModalClose}
          onPaymentSuccess={handleInterestModalSuccess}
        />
        <ItemRepaymentModal
          isOpen={isItemRepaymentModalOpen}
          loan={selectedLoan}
          onClose={handleModalClose}
          onRepaymentSuccess={handleItemRepaymentModalSuccess}
        />
        <SItemRepaymentModal // NEW: Add silver item repayment modal
          isOpen={isSilverItemRepaymentModalOpen}
          loan={selectedLoan}
          onClose={handleModalClose}
          onRepaymentSuccess={handleSilverItemRepaymentModalSuccess}
        />
      </>
    );
  }

  if (isGoldTransaction || isSilverTransaction) {
    const FormComponent = isGoldTransaction ? GoldTransactionForm : SilverTransactionForm;
    const ratesProp = isGoldTransaction ? { GoldRates: currentMetalPrices?.gold } : { silverRates: currentMetalPrices?.silver };
    const transactionType = selectedCategory.id.includes("purchase") ? "BUY" : "SELL";

    return (
      <FormComponent
        editingTransaction={null}
        {...ratesProp}
        onClose={onCancel}
        onSuccess={onSuccess}
        onError={(error) => setErrors({ submit: error })}
        initialCustomer={selectedCustomer}
        initialTransactionType={transactionType}
      />
    );
  }

  // Submit transaction for non-modal handled categories
  const submitTransaction = async () => {
    setLoading(true);
    try {
      await handleCreateTransactionRecord({
        amount: parseFloat(transactionData.amount) , // Convert to paise if needed
        description: transactionData.description,
        date: transactionData.date,
        photos: transactionData.photos,
        items: transactionData.items
      }, selectedCategory?.id);
      handleModalSuccess();
    } catch (error) {
      setErrors({ submit: "Failed to save transaction: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-${selectedCategory.color}-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <selectedCategory.icon
                    size={20}
                    className={`sm:w-6 sm:h-6 text-${selectedCategory.color}-600`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                    {selectedCategory.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Customer: {selectedCustomer.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            {errors.submit && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {!isGoldLoan && !isSilverLoan && !isGoldLoanRepayment && !isSilverLoanRepayment && !isMetalBuySell && !isUdhariTransaction && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <AmountField
                    amount={transactionData.amount}
                    date={transactionData.date}
                    errors={errors}
                    loading={loading}
                    onChange={handleDataChange}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={transactionData.description}
                  onChange={handleDataChange}
                  rows={3}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-none"
                  placeholder="Enter transaction details..."
                  disabled={loading}
                />
              </div>

              {(selectedCategory?.id.includes("gold") || selectedCategory?.id.includes("silver") || selectedCategory?.id.includes("loan")) &&
                !isGoldLoanRepayment && !isSilverLoanRepayment && !isMetalBuySell && !isUdhariTransaction && (
                  <div className="bg-green-50 p-4 sm:p-5 rounded-lg sm:rounded-xl">
                    <PhotoUpload
                      photos={transactionData.photos}
                      loading={loading}
                      onPhotosChange={(photos) => updateTransactionData({ photos })}
                    />
                  </div>
                )}
            </div>

            {(!isGoldLoanRepayment && !isSilverLoanRepayment) && (
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  ← Back to Category
                </button>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={onCancel}
                    className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base font-medium"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitTransaction}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm sm:text-base font-medium"
                  >
                    <Save size={16} className="sm:w-5 sm:h-5" />
                    {loading ? "Saving..." : "Save Transaction"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;