/**
 * GST (Goods and Services Tax) Calculations for India
 * Restaurant services: 5% GST (2.5% CGST + 2.5% SGST)
 */

export interface GSTBreakdown {
  subtotal: number;
  cgst: number; // Central GST
  sgst: number; // State GST
  igst?: number; // Integrated GST (for inter-state)
  gstRate: number;
  totalGST: number;
  total: number;
}

/**
 * Calculate GST for restaurant order
 * Default rate: 5% (2.5% CGST + 2.5% SGST)
 */
export function calculateGST(
  subtotal: number,
  gstRate: number = 5,
  isInterState: boolean = false
): GSTBreakdown {
  const totalGST = (subtotal * gstRate) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    // Inter-state: Use IGST only
    igst = totalGST;
  } else {
    // Intra-state: Split into CGST + SGST
    cgst = totalGST / 2;
    sgst = totalGST / 2;
  }

  const total = subtotal + totalGST;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    gstRate,
    totalGST: parseFloat(totalGST.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Reverse calculate base price from GST-inclusive price
 */
export function reverseGST(
  totalWithGST: number,
  gstRate: number = 5
): GSTBreakdown {
  const subtotal = totalWithGST / (1 + gstRate / 100);
  return calculateGST(subtotal, gstRate);
}

/**
 * GST rates in India (for different categories)
 */
export const GST_RATES = {
  RESTAURANT_AC: 18, // AC Restaurant with liquor license
  RESTAURANT_NON_AC: 5, // Non-AC restaurant or no liquor
  TAKEAWAY: 5, // Takeaway/delivery
  SWEETS: 5, // Sweets and namkeen
  BAKERY: 5, // Bakery items
  LIQUOR: 28, // Alcoholic beverages (varies by state)
  PACKAGED_FOOD: 12, // Packaged/branded food
};

/**
 * Format GST breakdown for display
 */
export function formatGSTBreakdown(breakdown: GSTBreakdown): {
  label: string;
  value: string;
}[] {
  const items = [
    { label: 'Subtotal', value: `₹${breakdown.subtotal}` },
  ];

  if (breakdown.igst && breakdown.igst > 0) {
    items.push({
      label: `IGST (${breakdown.gstRate}%)`,
      value: `₹${breakdown.igst}`,
    });
  } else {
    if (breakdown.cgst > 0) {
      items.push({
        label: `CGST (${breakdown.gstRate / 2}%)`,
        value: `₹${breakdown.cgst}`,
      });
    }
    if (breakdown.sgst > 0) {
      items.push({
        label: `SGST (${breakdown.gstRate / 2}%)`,
        value: `₹${breakdown.sgst}`,
      });
    }
  }

  items.push({ label: 'Total', value: `₹${breakdown.total}` });

  return items;
}

/**
 * Generate GST invoice number
 * Format: INV/YYYY/MM/XXXXX
 */
export function generateGSTInvoiceNumber(
  sequenceNumber: number,
  date: Date = new Date()
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(sequenceNumber).padStart(5, '0');
  return `INV/${year}/${month}/${seq}`;
}

/**
 * Validate GSTIN (GST Identification Number)
 * Format: 22AAAAA0000A1Z5
 */
export function isValidGSTIN(gstin: string): boolean {
  // GSTIN format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit (entity number) + 1 letter (Z) + 1 alphanumeric (checksum)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Format number as Indian currency (₹1,23,456.78)
 */
export function formatIndianCurrency(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * GST HSN/SAC codes for restaurant services
 */
export const HSN_SAC_CODES = {
  RESTAURANT_SERVICE: '996331', // Restaurant and catering services
  FOOD_PREPARATION: '996332', // Food preparation services
  BEVERAGE_SERVICE: '996333', // Beverage serving services
  TAKEAWAY: '996334', // Takeaway food services
};

/**
 * Calculate total order with GST
 */
export function calculateOrderTotal(
  items: Array<{ price: number; quantity: number }>,
  gstRate: number = 5,
  isInterState: boolean = false
): GSTBreakdown {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return calculateGST(subtotal, gstRate, isInterState);
}
