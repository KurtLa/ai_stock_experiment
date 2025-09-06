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

        /**
         * Minimum allowed price for a security. Micro‑cap names can trade
         * below one dollar, but extremely low priced instruments (penny
         * stocks) often exhibit extreme volatility and manipulation. If
         * the latest price is below this threshold the engine will skip
         * the symbol.
         */
        this.minPrice = parseFloat(process.env.MIN_PRICE || '0.50');

        /**
         * Maximum number of times to retry a failed market data request.
         * Public data endpoints may throttle with HTTP 429 responses or
         * transient errors. Retries are attempted with exponential
         * back‑off to give the remote server time to recover.
         */
        this.apiRetries = parseInt(process.env.API_RETRIES || '3', 10);

        /**
         * Base delay in milliseconds between retries of market data
         * requests. The actual delay grows exponentially with each
         * attempt (e.g. base × 2ⁿ) to avoid hammering the endpoint when
         * throttled.
         */
        this.apiBackoffMs = parseInt(process.env.API_BACKOFF_MS || '500', 10);

        /**
         * Enable offline simulation of market data. When true, the
         * engine will bypass remote requests and return synthetic
         * price/volume values defined below. This is useful for
         * development in restricted environments or when connectivity
         * issues arise.
         */
        this.simulateMarketData = process.env.SIMULATE_MARKET_DATA === '1';

        /**
         * Simulated price used when simulateMarketData is enabled.
         */
        this.simulatedPrice = parseFloat(process.env.SIMULATED_PRICE || '1.00');

        /**
         * Simulated volume used when simulateMarketData is enabled. The
         * average daily volume (ADV) will be computed as price × volume.
         */
        this.simulatedVolume = parseInt(process.env.SIMULATED_VOLUME || '100000', 10);
  }
}

module.exports = new Settings();