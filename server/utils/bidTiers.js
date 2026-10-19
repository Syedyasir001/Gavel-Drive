/**
 * Tiered Bid Increment System
 *
 * Real-world dynamic scale based on current standing bid:
 * - ₹0 to ₹5,00,000: Increment is ₹5,000
 * - ₹5,00,001 to ₹15,00,000: Increment is ₹10,000
 * - ₹15,00,001 to ₹50,00,000: Increment is ₹25,000
 * - ₹50,00,001 and above: Increment is ₹50,000
 */

const calculateBidIncrement = (currentBid) => {
  const bid = Number(currentBid) || 0;
  if (bid <= 500000) return 5000;
  if (bid <= 1500000) return 10000;
  if (bid <= 5000000) return 25000;
  return 50000;
};

const calculateMinimumNextBid = (currentBid) => {
  const bid = Number(currentBid) || 0;
  const increment = calculateBidIncrement(bid);
  return Math.max(
    Math.ceil((bid + 1) / increment) * increment,
    bid + increment
  );
};

module.exports = {
  calculateBidIncrement,
  calculateMinimumNextBid,
};
