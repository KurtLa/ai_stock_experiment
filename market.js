// market.js
//
// Minimal market data adapter. This module provides functions to
// retrieve quote information from public endpoints. It avoids
// external dependencies by using Node.js built‑in https module.
//
// In a production deployment you would likely substitute this with a
// more robust data provider or broker API, handle retries, and cache
// results. These functions are intended for educational use only.

const https = require('https');
const config = require('./config');

/**
 * Sleep for the specified number of milliseconds. Used for retry
 * back‑off between repeated API calls.
 *
 * @param {number} ms Duration in milliseconds
 * @returns {Promise<void>} Promise resolved after the delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch basic quote data for a given symbol from Yahoo Finance. The
 * response contains the latest price and volume. Note that Yahoo
 * Finance data is not guaranteed to be 100 % accurate and may be
 * delayed; use a proper market data API for live trading.
 *
 * @param {string} symbol Stock or ETF ticker symbol
 * @returns {Promise<{ price: number, volume: number, advUsd: number }>} Quote info
 */
function fetchQuote(symbol, attempt = 0) {
  // If simulation mode is enabled, return deterministic values without hitting a network endpoint.
  if (config.simulateMarketData) {
    const price = config.simulatedPrice;
    const volume = config.simulatedVolume;
    const advUsd = price * volume;
    return Promise.resolve({ price, volume, advUsd });
  }

  return new Promise((resolve, reject) => {
    const qs = encodeURIComponent(symbol);
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${qs}`;
    const req = https
      .get(url, (res) => {
        const { statusCode } = res;
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const isSuccess = statusCode >= 200 && statusCode < 300;
          // Retry on HTTP error responses (e.g. 429 Too Many Requests)
          if (!isSuccess) {
            const bodySnippet = (data || '').toString().trim().slice(0, 120);
            if (attempt < config.apiRetries) {
              const backoff = config.apiBackoffMs * Math.pow(2, attempt);
              delay(backoff)
                .then(() => fetchQuote(symbol, attempt + 1))
                .then(resolve)
                .catch(reject);
              return;
            }
            reject(new Error(`HTTP ${statusCode} when fetching quote: ${bodySnippet || 'No response body'}`));
            return;
          }
          // Parse JSON response
          try {
            const json = JSON.parse(data);
            const result = json?.quoteResponse?.result?.[0];
            if (!result) throw new Error('No quote data returned');
            const price = Number(result.regularMarketPrice);
            const volume = Number(result.regularMarketVolume);
            const advUsd = price * volume;
            resolve({ price, volume, advUsd });
          } catch (err) {
            if (attempt < config.apiRetries) {
              const backoff = config.apiBackoffMs * Math.pow(2, attempt);
              delay(backoff)
                .then(() => fetchQuote(symbol, attempt + 1))
                .then(resolve)
                .catch(reject);
            } else {
              reject(new Error(`Failed to parse quote response: ${err.message}`));
            }
          }
        });
      })
      .on('error', (err) => {
        // Network error; attempt retry if possible
        if (attempt < config.apiRetries) {
          const backoff = config.apiBackoffMs * Math.pow(2, attempt);
          delay(backoff)
            .then(() => fetchQuote(symbol, attempt + 1))
            .then(resolve)
            .catch(reject);
        } else {
          reject(err);
        }
      });
    // Timeout the request after 5 seconds to avoid hanging
    req.setTimeout(5000, () => {
      req.destroy();
    });
  });
}

module.exports = { fetchQuote };