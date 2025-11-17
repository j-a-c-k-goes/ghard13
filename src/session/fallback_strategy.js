/**
 * fallback_strategy: determine appropriate fallback strategy
 * context: analyzes failure conditions to select optimal response
 * impact: provides intelligent fallback decision making
 */

class fallback_strategy {
  constructor(config = {}) {
    this.strategy_types = {
      serve_obfuscated: 'serve_obfuscated',
      deny_access:      'deny_access',
      new_puzzle:       'new_puzzle'
    };
    
    // configurable attempt limits - site owners can override these
    this.attempt_limits = {
      timeout:            config.timeout_limit || 2,
      invalid_solution:   config.invalid_solution_limit || 3,
      max_total_attempts: config.max_total_attempts || 5
    };
  }
  
  /**
   * determine fallback strategy based on failure reason and attempts
   */
  get_strategy(failure_reason, attempt_count = 0) {
    // check if total attempts exceed maximum allowed
    if (attempt_count >= this.attempt_limits.max_total_attempts) {
      return 'deny_access';
    }
    
    switch (failure_reason) {
      case 'timeout':
        return attempt_count < this.attempt_limits.timeout ? 'new_puzzle' : 'serve_obfuscated';
      case 'invalid_solution':
        return attempt_count < this.attempt_limits.invalid_solution ? 'new_puzzle' : 'serve_obfuscated';
      case 'no_behavioral_data':
        return 'serve_obfuscated';
      case 'puzzle_expired':
        return 'new_puzzle';
      case 'too_many_attempts':
        return 'deny_access';
      default:
        return 'serve_obfuscated';
    }
  }
  
  /**
   * check if fallback should be applied
   */
  should_apply_fallback(puzzle_status, session_status) {
    const puzzle_failed   = ['timeout', 'invalid', 'expired'].includes(puzzle_status);
    const session_invalid = ['expired', 'not_found'].includes(session_status);
    
    return puzzle_failed || session_invalid;
  }
  
  /**
   * check if retry is allowed for failure reason
   */
  is_retry_allowed(failure_reason, attempt_count) {
    const strategy = this.get_strategy(failure_reason, attempt_count);
    return strategy === 'new_puzzle';
  }
}

module.exports = { fallback_strategy };