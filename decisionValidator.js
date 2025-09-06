// decisionValidator.js
//
// Simple runtime validation for decisions returned by a language
// model. The goal is to provide a strong guarantee that only
// whitelisted actions, symbols and numeric ranges are accepted. If
// invalid input is encountered, a descriptive error is returned.

const VALID_ACTIONS = new Set(['BUY', 'SELL', 'HOLD']);

/**
 * Validate a decision object produced by an LLM or other decision
 * engine. This function performs basic structural checks and
 * enforces constraints on allowed values. It does not attempt to
 * correct or coerce invalid input.
 *
 * @param {object} decision Candidate decision object
 * @returns {{valid: boolean, error?: string}} Result of validation
 */
function validateDecision(decision) {
  if (!decision || typeof decision !== 'object') {
    return { valid: false, error: 'Decision must be an object' };
  }
  const { action, symbol, confidence } = decision;
  // Action must be one of the valid strings
  if (!VALID_ACTIONS.has(action)) {
    return { valid: false, error: `Invalid action: ${action}` };
  }
  // Symbol must be non‑empty string and uppercase alphanumeric
  if (typeof symbol !== 'string' || !/^[A-Z0-9]+$/.test(symbol)) {
    return { valid: false, error: 'Symbol must be a non‑empty uppercase string' };
  }
  // Confidence must be a number between 0 and 1
  const conf = Number(confidence);
  if (isNaN(conf) || conf < 0 || conf > 1) {
    return { valid: false, error: 'Confidence must be a number between 0 and 1' };
  }
  return { valid: true };
}

module.exports = { validateDecision };