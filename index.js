// index.js
//
// Entry point for the micro‑cap trading engine. This script wires
// together configuration, market data, risk management and decision
// validation. The goal is to demonstrate a robust framework that
// guards against illiquid trades, enforces strict position sizing
// and implements stop loss discipline.

const config = require('./config');
const risk = require('./risk');
const { validateDecision } = require('./decisionValidator');
const { fetchQuote } = require('./market');

// Fetch the initial equity from an environment variable or default
// to 10 000 USD. In a real application this would reflect your
// brokerage account balance.
const INITIAL_EQUITY = parseFloat(process.env.EQUITY || '10000');

/**
 * Determine an order proposal from a high level decision.
 *
 * @param {object} decision  Validated decision object
 * @param {object} quote     Market data (price, advUsd)
 * @param {number} equity    Total portfolio value
 * @returns {{order: object, error: string}} Order or error message
 */
function proposeOrder(decision, quote, equity) {
  const { price, advUsd } = quote;
  // Liquidity check
  if (advUsd < config.minAdvUsd) {
    return { error: 'Insufficient liquidity' };
  }
  // Determine shares by risk and by liquidity
  const sharesRisk = risk.riskScaledShares(
    price,
    /* dailyVol */ 0.02, // For demonstration purposes assume 2 % daily volatility
    equity,
    config.targetRiskBps
  );
  const sharesLiq = risk.maxSharesByLiquidity(advUsd, price, config.maxPctAdv);
  const shares = Math.min(sharesRisk, sharesLiq);
  if (shares <= 0) {
    return { error: 'Zero shares after constraints' };
  }
  const atr = price * 0.02; // approximate ATR as 2 % of price
  const stopLevel = risk.computeStop(price, atr, config.hardStopPct, config.trailingAtrMult);
  // Limit price padded by slippage
  const limitPrice = price * (1 + config.slippageBps / 10000.0);
  return {
    order: {
      symbol: decision.symbol,
      side: decision.action,
      qty: shares,
      limit: Number(limitPrice.toFixed(4)),
      stop: Number(stopLevel.toFixed(4)),
    },
  };
}

/**
 * Main loop. Retrieves market data for the specified symbol, validates
 * the decision, computes a proposed order and prints the result.
 */
async function main() {
  // Example decision stub: in practice this would come from a
  // language model or other strategy engine.
  const decision = {
    action: 'BUY',
    symbol: 'ABC',
    confidence: 0.75,
    thesis: 'Stub decision for demonstration purposes.',
  };
  // Validate decision
  const validation = validateDecision(decision);
  if (!validation.valid) {
    console.error('Decision invalid:', validation.error);
    process.exit(1);
  }
  try {
    const quote = await fetchQuote(decision.symbol);
    const result = proposeOrder(decision, quote, INITIAL_EQUITY);
    if (result.error) {
      console.error('Order generation failed:', result.error);
    } else {
      console.log('Proposed order:', result.order);
    }
  } catch (err) {
    console.error('Error fetching market data:', err.message);
  }
}

// Only run main if this file is executed directly. Allows use as a
// module for testing.
if (require.main === module) {
  main();
}