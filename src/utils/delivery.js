// Metro city pincode prefixes (first 3 digits of 6-digit Indian pincode)
const METRO_PREFIXES = new Set([
  '110', // Delhi (NCR core)
  '400', // Mumbai
  '500', '501', '502', // Hyderabad & surroundings
  '560', // Bangalore
  '600', // Chennai
  '700', // Kolkata
  '380', '382', // Ahmedabad & surroundings
  '411', // Pune
  '122', // Gurgaon / Gurugram (NCR)
  '121', // Faridabad (NCR)
  '201', // Noida / Ghaziabad (NCR)
]);

export const DELIVERY_METRO     = 60;
export const DELIVERY_NON_METRO = 80;
export const COD_CHARGE         = 120;

/** Returns true (metro), false (non-metro), or null (incomplete/invalid pincode) */
export function isMetroPincode(pincode) {
  if (!/^\d{6}$/.test(pincode)) return null;
  return METRO_PREFIXES.has(pincode.slice(0, 3));
}

/** Returns delivery charge in ₹ for online payment, or null if pincode is not 6 digits */
export function getDeliveryCharge(pincode) {
  const metro = isMetroPincode(pincode);
  if (metro === null) return null;
  return metro ? DELIVERY_METRO : DELIVERY_NON_METRO;
}
