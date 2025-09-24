export function formatIndianRupeesFull(amount) {
    if (!amount || isNaN(amount)) return '₹0';
    return Number(amount).toLocaleString('en-IN', {
        maximumFractionDigits: 0, // No decimal places
        style: 'decimal', // Use decimal style for numbers
    });
}

export function formatIndianAmount(amount) {
    if (!amount || isNaN(amount)) return '₹0';
    return Number(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
}