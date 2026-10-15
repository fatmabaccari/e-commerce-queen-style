/**
 * Currency formatting utility for Tunisian Dinar (TND)
 */

/**
 * Formats a number as Tunisian Dinar currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "1 234,56 DT")
 */
export function formatCurrency(
  amount: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  // Format number with French locale (space as thousand separator, comma as decimal separator)
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  // Add TND symbol
  return showSymbol ? `${formatted} DT` : formatted;
}

/**
 * Formats a number as currency without symbol (for input fields, etc.)
 */
export function formatCurrencyValue(amount: number): string {
  return formatCurrency(amount, { showSymbol: false });
}

