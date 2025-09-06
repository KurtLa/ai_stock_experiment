# Micro‑cap Trading Engine (Node.js)

This project is an experimental framework for algorithmic trading in
illiquid micro‑capitalisation stocks. It is inspired by the
`ChatGPT‑Micro‑Cap‑Experiment` but re‑imagined in JavaScript/Node.js with
additional guardrails and risk controls. **Use it at your own risk.**

## Key features

- **Modular configuration** – All tunable parameters (stop levels,
  risk budgets, liquidity thresholds, etc.) live in `config.js` and
  may be overridden via environment variables.
- **Liquidity filter** – Symbols with average daily dollar volume
  below the configured threshold are skipped. Positions are capped at
  a configurable fraction of market liquidity.
- **Risk‑scaled position sizing** – Positions are sized based on
  target portfolio risk contribution and historical volatility. This
  helps prevent overly concentrated bets and reduces the impact of
  each trade on the overall account.
- **Stop loss discipline** – Each position is assigned both a hard
  stop (percentage drop from entry) and a trailing stop (multiple of
  ATR). Exits are triggered by price breaches or by exceeding a
  maximum holding period.
- **Decision guardrails** – Incoming decisions from an LLM or other
  strategy engine are validated against a schema to ensure only
  whitelisted actions (BUY, SELL, HOLD) and well‑formed symbols are
  accepted.
- **Minimal dependencies** – Uses only Node’s built‑in modules. This
  keeps the code lightweight and easier to audit, though it does mean
  that market data retrieval is simplistic and not suited for
  production use.

## Getting started

Install dependencies (none beyond Node itself) and run the example
script:

```sh
node index.js
```

The example stub in `index.js` demonstrates how a decision object can
be validated, market data fetched and an order proposal generated.
Replace the stub with your own decision source (e.g. an OpenAI
call).

### Configuration

Settings are defined in `config.js`. You can override any value via
environment variables:

- `MAX_POSITION_WEIGHT` – Maximum weight per position (fraction of
  total equity). Default `0.10`.
- `TARGET_RISK_BPS` – Daily risk budget in basis points. Default
  `15`.
- `HARD_STOP_PCT` – Hard stop percentage drop from entry. Default
  `0.12`.
- `TRAILING_ATR_MULT` – Trailing stop multiple of ATR. Default `3.0`.
- `MIN_ADV_USD` – Minimum average daily traded volume in USD.
  Default `100000`.
- `MAX_PCT_ADV` – Maximum percentage of ADV consumed per order.
  Default `0.05`.
- `SLIPPAGE_BPS` – Slippage padding for limit orders in basis points.
  Default `40`.
- `TIME_STOP_DAYS` – Maximum holding period in days. Default `5`.

For example, to change the minimum liquidity threshold and risk
budget:

```sh
MIN_ADV_USD=500000 TARGET_RISK_BPS=20 node index.js
```

## Important caveats

- **Not production ready.** This code is intended for educational
  purposes. It does not handle real broker connectivity, order
  management, error recovery, or full market data. Trading with
  real capital requires extensive testing and compliance.
- **Simplistic market data.** Quotes are fetched from Yahoo
  Finance’s public endpoints and may be delayed or inaccurate. Do
  not rely on them for live trading.
- **No portfolio state.** The example does not persist positions or
  PnL. You must integrate your own portfolio manager and storage.

By adhering to the risk controls and guardrails outlined here, you
reduce some of the inherent dangers of micro‑cap trading. However,
the asset class remains volatile and risky; proceed cautiously.