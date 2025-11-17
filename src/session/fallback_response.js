/**
 * fallback_response: create fallback response objects
 * context: generates structured responses for different fallback scenarios
 * impact: provides consistent response format for fallback handling
 */

class fallback_response {
  constructor() {}
  
  /**
   * create response for obfuscated content serving
   */
  create_obfuscated_response(hardened_content) {
    return {
      strategy: 'serve_obfuscated',
      content: hardened_content,
      message: 'Content served with enhanced security',
      allow_access: true,
      retry_allowed: false
    };
  }
  
  /**
   * create response for access denial
   */
  create_access_denied_response(reason, denial_page_html) {
    return {
      strategy: 'deny_access',
      content: denial_page_html,
      message: 'Access denied due to verification failure',
      allow_access: false,
      retry_allowed: false,
      reason: reason
    };
  }
  
  /**
   * create response for puzzle retry
   */
  create_retry_response(new_puzzle_html, attempt_count) {
    return {
      strategy: 'new_puzzle',
      content: new_puzzle_html,
      message: `Verification attempt ${attempt_count + 1}. Please try again.`,
      allow_access: false,
      retry_allowed: true,
      attempt_count: attempt_count + 1
    };
  }
  
  /**
   * create generic error response
   */
  create_error_response(error_message, fallback_content = null) {
    return {
      strategy: 'error',
      content: fallback_content,
      message: error_message,
      allow_access: false,
      retry_allowed: false
    };
  }
}

module.exports = { fallback_response };