export function formatMoney(amount: number): string {
  // Handle null, undefined, or invalid numbers
  if (!amount || isNaN(amount)) return 'KES 0.00';

  // Convert to absolute value for easier handling
  const absAmount = Math.abs(amount);

  // Format with K (thousands) or M (millions)
  let formattedAmount: string;
  if (absAmount >= 1000000) {
    formattedAmount = (absAmount / 1000000).toFixed(2) + 'M';
  } else if (absAmount >= 1000) {
    formattedAmount = (absAmount / 1000).toFixed(2) + 'K';
  } else {
    formattedAmount = absAmount.toFixed(2);
  }

  // Add commas for thousands
  formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Add negative sign back if needed
  return `KES ${amount < 0 ? '-' : ''}${formattedAmount}`;
} 