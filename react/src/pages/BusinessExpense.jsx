import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import ApiService from '../services/api';
import ExpenseStats from '../components/BusinessExpense/ExpenseStats';
import ExpenseFilters from '../components/BusinessExpense/ExpenseFilters';
import ExpenseTable from '../components/BusinessExpense/ExpenseTable';
import ExpenseModal from '../components/BusinessExpense/ExpenseModal';
import { CATEGORIES, PAYMENT_METHODS } from '../components/BusinessExpense/constants';
import { formatIndianAmount } from '../components/BusinessExpense/utils';

const BusinessExpense = () => {
    const [expenses, setExpenses] = useState([]);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalGrossAmount: 0,
        totalNetAmount: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
        totalTaxAmount: 0,
        paidExpenses: 0,
        pendingExpenses: 0,
        thisMonth: { totalAmount: 0, totalExpenses: 0 }
    });

    // Fetch expenses and dashboard summary
    useEffect(() => {
        fetchExpenses();
        fetchDashboard();
    }, []);

    const fetchExpenses = async (filters = {}) => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                search: filters.search ? filters.search.trim() : undefined,
                category: filters.category !== 'All' ? filters.category : undefined,
                paymentStatus: filters.status !== 'All' ? filters.status : undefined,
            };

            if (filters.dateFrom) {
                params.startDate = filters.dateFrom;
            }
            if (filters.dateTo) {
                params.endDate = filters.dateTo;
            }

            const response = await ApiService.getExpenses(params);

            const transformedExpenses = response.data.map(exp => ({
                id: exp._id || exp.id,
                date: exp.expenseDate.split('T')[0],
                category: exp.category,
                subcategory: exp.subcategory || '',
                description: exp.description,
                title: exp.title || exp.description,
                amount: Number(exp.grossAmount),
                vendor: exp.vendor.name,
                vendorCode: exp.vendor.code || '',
                paymentMethod: exp.paymentMethod || '',
                status: exp.paymentStatus,
                receipt: exp.metadata?.receipt,
                reference: exp.referenceNumber,
                taxAmount: Number(exp.taxDetails?.totalTax || 0),
                netAmount: Number(exp.netAmount),
                paidAmount: Number(exp.paidAmount || 0),
                pendingAmount: Number(exp.pendingAmount || 0),
                dueDate: exp.dueDate,
                metadata: exp.metadata || {}
            }));

            setExpenses(transformedExpenses);
            setSummary(response.summary || summary);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            alert('Failed to fetch expenses: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
        try {
            const response = await ApiService.getExpenseDashboard();
            setSummary(response.data.overview);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            alert('Failed to fetch dashboard data: ' + error.message);
        }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            const response = await ApiService.createExpense(expenseData);
            const newExpense = {
                id: response.data._id,
                date: response.data.expenseDate.split('T')[0],
                category: response.data.category,
                subcategory: response.data.subcategory || '',
                description: response.data.description,
                title: response.data.title,
                amount: Number(response.data.grossAmount), // Ensure amount is stored as a number
                vendor: response.data.vendor.name,
                vendorCode: response.data.vendor.code || '',
                paymentMethod: response.data.paymentMethod || '',
                status: response.data.paymentStatus,
                receipt: response.data.metadata?.receipt,
                reference: response.data.referenceNumber,
                taxAmount: Number(response.data.taxDetails?.totalTax || 0),
                netAmount: Number(response.data.netAmount),
                paidAmount: Number(response.data.paidAmount || 0),
                pendingAmount: Number(response.data.pendingAmount || 0),
                metadata: response.data.metadata || {}
            };
            console.log('New Expense Added:', newExpense.amount, typeof newExpense.amount); // Debug
            // Remove manual state update and fetch fresh data
            await fetchExpenses(); // Refresh expenses to ensure consistency
            await fetchDashboard(); // Refresh summary to reflect new expense
            setShowAddExpense(false);
            return { success: true };
        } catch (error) {
            console.error('Error adding expense:', error);
            return { success: false, error: error.message };
        }
    };

    const handleEditExpense = (expense) => {
        if (!expense.id) {
            console.error('Error: Expense ID is undefined', expense);
            alert('Cannot edit expense: Invalid expense ID');
            return;
        }
        setEditingExpense(expense);
        setShowAddExpense(true);
    };

    const handleUpdateExpense = async (expenseId, updatedExpenseData) => {
        if (!expenseId) {
            return { success: false, error: 'Expense ID is required' };
        }

        try {
            const result = await ApiService.updateExpense(expenseId, updatedExpenseData);
            if (result.success) {
                await fetchExpenses();
                await fetchDashboard();
                setShowAddExpense(false);
                setEditingExpense(null);
                return { success: true };
            } else {
                return { success: false, error: result.error || result.message };
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            return { success: false, error: error.message };
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!id) {
            console.error('Error: Expense ID is undefined for deletion');
            alert('Cannot delete expense: Invalid expense ID');
            return;
        }

        if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
            try {
                await ApiService.deleteExpense(id);
                await fetchExpenses();
                await fetchDashboard();
            } catch (error) {
                console.error('Error deleting expense:', error);
                alert('Failed to delete expense: ' + error.message);
            }
        }
    };

    const handleCloseModal = () => {
        setShowAddExpense(false);
        setEditingExpense(null);
    };

    const handleFilterChange = (filters) => {
        fetchExpenses(filters);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <div className="max-w-[1400px] mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-px bg-slate-200"></div>
                        <button
                            onClick={() => setShowAddExpense(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Add Expense
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <ExpenseStats summary={summary} />

                {/* Filters */}
                <ExpenseFilters onFilterChange={handleFilterChange} />

                {/* Expense Table */}
                <ExpenseTable
                    expenses={expenses}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                    loading={loading}
                />

                {/* Add/Edit Expense Modal */}
                {showAddExpense && (
                    <ExpenseModal
                        isEdit={!!editingExpense}
                        editingExpense={editingExpense}
                        onAdd={handleAddExpense}
                        onUpdate={handleUpdateExpense}
                        onClose={handleCloseModal}
                    />
                )}
            </div>
        </div>
    );
};

export default BusinessExpense;