// config.js
//
// Centralised configuration with sensible defaults.
//
// This module encapsulates all tunable parameters for the trading
// engine. The values can be overridden via environment variables,
// making it easy to adjust behaviour without modifying code. See
// README.md for details on each setting.

class Settings {
  constructor() {
    /**
     * Maximum weight per position expressed as a fraction of total equity.
     * For example, a value of 0.10 means a single position cannot exceed
     * 10 % of the current portfolio value.
     */
    this.maxPositionWeight = parseFloat(process.env.MAX_POSITION_WEIGHT || '0.10');

    /**
     * Target daily risk contribution in basis points (1 bp = 0.01 %).
     * Used to size positions based on recent volatility (see risk.js).
     */
    this.targetRiskBps = parseFloat(process.env.TARGET_RISK_BPS || '15');

    /**
     * Hard stop percentage below entry price. Once the price crosses
     * this threshold, the position is exited unconditionally. For
     * example, 0.12 means a 12 % drop from the entry will trigger
     * an exit.
     */
    this.hardStopPct = parseFloat(process.env.HARD_STOP_PCT || '0.12');

    /**
     * Trailing stop multiplier expressed in ATR units. The stop level
     * will be entry price minus (trailingMult × ATR).
     */
    this.trailingAtrMult = parseFloat(process.env.TRAILING_ATR_MULT || '3.0');

    /**
     * Minimum average daily traded volume (ADV) in USD required for
     * consideration. Symbols with less liquidity than this value are
     * filtered out to avoid excessive slippage and execution risk.
     */
    this.minAdvUsd = parseInt(process.env.MIN_ADV_USD || '100000', 10);

    /**
     * Maximum percentage of a stock's ADV the strategy is willing to
     * consume. This protects against taking an outsized share of the
     * day’s liquidity in illiquid names.
     */
    this.maxPctAdv = parseFloat(process.env.MAX_PCT_ADV || '0.05');

    /**
     * Slippage model expressed in basis points. Limit orders will be
     * padded by this amount to increase the likelihood of a fill while
     * still controlling execution price.
     */
    this.slippageBps = parseInt(process.env.SLIPPAGE_BPS || '40', 10);

    /**
     * Time‑based stop expressed in days. Positions exceeding this
     * holding period will be closed regardless of price action, which
     * encourages turnover and reduces idle risk.
     */
    this.timeStopDays = parseInt(process.env.TIME_STOP_DAYS || '5', 10);
  }
}

module.exports = new Settings();