/**
 * fallback_handler: orchestrate fallback components for puzzle failures
 * context: coordinates fallback strategy, response, and content generation
 * impact: provides main interface for fallback handling
 */

const { fallback_strategy } = require('./fallback_strategy');
const { fallback_response } = require('./fallback_response');
const { fallback_content }  = require('./fallback_content');

class fallback_handler {
  constructor(config = {}) {
    this.strategy = new fallback_strategy(config.fallback_limits);
    this.response = new fallback_response();
    this.content  = new fallback_content();
  }
  
  /**
   * determine fallback strategy based on failure reason
   */
  get_fallback_strategy(failure_reason, attempt_count = 0) {
    return this.strategy.get_strategy(failure_reason, attempt_count);
  }
  
  /**
   * create fallback response for obfuscated content
   */
  create_obfuscated_fallback(original_content, hardened_content) {
    return this.response.create_obfuscated_response(hardened_content);
  }
  
  /**
   * create fallback response for access denial
   */
  create_access_denied_fallback(reason = 'verification_failed') {
    const denial_page = this.content.get_content_for_reason(reason);
    return this.response.create_access_denied_response(reason, denial_page);
  }
  
  /**
   * create fallback response for puzzle retry
   */
  create_retry_fallback(new_puzzle_html, attempt_count) {
    return this.response.create_retry_response(new_puzzle_html, attempt_count);
  }
  
  /**
   * handle puzzle failure and return appropriate fallback
   */
  handle_puzzle_failure(failure_data, hardened_content, puzzle_generator = null) {
    const { reason, attempt_count = 0, session_id } = failure_data;
    const strategy_type = this.strategy.get_strategy(reason, attempt_count);
    
    switch (strategy_type) {
      case 'serve_obfuscated':
        return this.create_obfuscated_fallback(null, hardened_content);
        
      case 'deny_access':
        return this.create_access_denied_fallback(reason);
        
      case 'new_puzzle':
        if (puzzle_generator) {
          const new_puzzle = puzzle_generator.generate();
          return this.create_retry_fallback(new_puzzle.html, attempt_count);
        } else {
          return this.create_obfuscated_fallback(null, hardened_content);
        }
        
      default:
        return this.create_obfuscated_fallback(null, hardened_content);
    }
  }
  
  /**
   * check if fallback should be applied
   */
  should_apply_fallback(puzzle_status, session_status) {
    return this.strategy.should_apply_fallback(puzzle_status, session_status);
  }
  
  /**
   * get fallback statistics
   */
  get_fallback_stats(fallback_history = []) {
    const total_fallbacks = fallback_history.length;
    const strategy_counts = {};
    
    fallback_history.forEach(fallback => {
      const strategy_name            = fallback.strategy;
      strategy_counts[strategy_name] = (strategy_counts[strategy_name] || 0) + 1;
    });
    
    return {
      total_fallbacks,
      strategy_distribution: strategy_counts,
      most_common_strategy:  Object.keys(strategy_counts).reduce((a, b) => 
        strategy_counts[a] > strategy_counts[b] ? a : b, 'none')
    };
  }
}

module.exports = { fallback_handler };