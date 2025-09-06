// risk.js
//
// Collection of helper functions for sizing positions and managing
// exits. These functions are intentionally deterministic and free of
// side effects. All computations operate on raw numerical inputs
// rather than objects to make testing straightforward.

/**
 * Determine the maximum number of shares permitted by liquidity.
 *
 * @param {number} advUsd    Average daily traded volume in USD.
 * @param {number} price     Latest trade price for the stock.
 * @param {number} maxPctAdv Maximum fraction of ADV the strategy
 *                            will consume (e.g. 0.05 for 5 %).
 * @returns {number} Maximum number of shares that may be traded
 */
function maxSharesByLiquidity(advUsd, price, maxPctAdv) {
  if (!advUsd || !price || advUsd <= 0 || price <= 0) {
    return 0;
  }
  const usdCap = advUsd * maxPctAdv;
  return Math.floor(usdCap / price);
}

/**
 * Determine the number of shares based on volatility and target risk.
 *
 * The method approximates the position size such that the daily
 * volatility of the resulting PnL does not exceed a specified
 * fraction of the portfolio value. The estimate is simplistic and
 * assumes that price changes follow a random walk with standard
 * deviation equal to `dailyVol`.
 *
 * @param {number} price    Latest trade price for the stock.
 * @param {number} dailyVol Annualised or daily volatility expressed as
 *                          a decimal (e.g. 0.02 for 2 % daily vol). If
 *                          unknown, pass a small positive number to
 *                          prevent division by zero.
 * @param {number} equity   Current total portfolio value in USD.
 * @param {number} targetBps Target risk contribution in basis points.
 * @returns {number} Suggested share count based on volatility
 */
function riskScaledShares(price, dailyVol, equity, targetBps) {
  const vol = dailyVol > 0 ? dailyVol : 1e-8;
  const riskBudget = equity * (targetBps / 10000.0);
  const shares = riskBudget / (price * vol);
  return Math.max(0, Math.floor(shares));
}

/**
 * Compute stop levels for a newly entered position.
 *
 * The hard stop is a percentage drop from entry price. The trailing
 * stop is defined relative to the average true range (ATR). The
 * returned stop level is the more conservative (higher) of the two
 * values. Both ATR and hard stop thresholds are in absolute price
 * terms.
 *
 * @param {number} entry           Entry price
 * @param {number} atr             Average true range
 * @param {number} hardStopPct     Hard stop percentage (e.g. 0.12)
 * @param {number} trailingMult    Multiplier of ATR for trailing stop
 * @returns {number} Stop level (price)
 */
function computeStop(entry, atr, hardStopPct, trailingMult) {
  const hard = entry * (1 - hardStopPct);
  const trailing = entry - trailingMult * atr;
  return Math.max(hard, trailing);
}

/**
 * Determine whether an exit condition has been met.
 *
 * @param {number} last         Latest trade price
 * @param {number} stopLevel    Computed stop level
 * @param {number} holdingDays  Number of days held
 * @param {number} timeStopDays Maximum holding period
 * @returns {boolean} True if the position should be closed
 */
function shouldExit(last, stopLevel, holdingDays, timeStopDays) {
  if (last <= stopLevel) return true;
  if (holdingDays >= timeStopDays) return true;
  return false;
}

module.exports = {
  maxSharesByLiquidity,
  riskScaledShares,
  computeStop,
  shouldExit,
};