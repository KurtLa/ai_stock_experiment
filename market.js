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

/**
 * Fetch basic quote data for a given symbol from Yahoo Finance. The
 * response contains the latest price and volume. Note that Yahoo
 * Finance data is not guaranteed to be 100 % accurate and may be
 * delayed; use a proper market data API for live trading.
 *
 * @param {string} symbol Stock or ETF ticker symbol
 * @returns {Promise<{ price: number, volume: number, advUsd: number }>} Quote info
 */
function fetchQuote(symbol) {
  return new Promise((resolve, reject) => {
    const qs = encodeURIComponent(symbol);
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${qs}`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const result = json?.quoteResponse?.result?.[0];
            if (!result) throw new Error('No data');
            const price = Number(result.regularMarketPrice);
            const volume = Number(result.regularMarketVolume);
            // Approximate ADV (USD) by using today’s volume times price;
            // for better accuracy use historical averages.
            const advUsd = price * volume;
            resolve({ price, volume, advUsd });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

module.exports = { fetchQuote };