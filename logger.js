// logger.js
//
// Lightweight order logger for the micro‑cap trading engine. Each log entry is
// appended to a newline‑delimited JSON file. Logging is kept as simple as
// possible to avoid introducing additional dependencies.
//
// The log file resides in the project root and records the timestamp, the
// high‑level decision, associated market data and the generated order. You
// may extend this module to include error logs, performance metrics or
// integration with external monitoring services.

const fs = require('fs');
const path = require('path');

/**
 * Append an order log entry to the orders.log file. Each entry is written as
 * a single JSON line to facilitate easy parsing and streaming analysis.
 *
 * @param {object} entry The data to log. Should include decision, quote, order.
 */
async function logOrder(entry) {
  const logPath = path.join(__dirname, 'orders.log');
  const record = {
    ts: new Date().toISOString(),
    ...entry,
  };
  try {
    await fs.promises.appendFile(logPath, JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    // Failing to log should not crash the application; report but continue.
    console.warn('Failed to write order log:', err.message);
  }
}

module.exports = { logOrder };