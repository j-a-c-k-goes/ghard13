/**
 * session_factory: create session objects with proper structure
 * context: generates session data with consistent format
 * impact: ensures session objects have required fields and valid structure
 */

class session_factory {
  constructor(default_timeout = 3600000) { // 1 hour default
    this.default_timeout = default_timeout;
  }
  
  /**
   * generate unique session id
   */
  generate_session_id() {
    return 'ghard13_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * create new session data object
   */
  create_session_data(user_identifier = null, custom_timeout = null) {
    const session_id = this.generate_session_id();
    const timeout    = custom_timeout || this.default_timeout;
    return {
      id:              session_id,
      created_at:      Date.now(),
      expires_at:      Date.now() + timeout,
      user_identifier: user_identifier,
      puzzle_solved:   false,
      puzzle_id:       null,
      solved_at:       null,
      status:          'active'
    };
  }
  
  /**
   * mark session as puzzle solved
   */
  mark_puzzle_solved(session_data, puzzle_id) {
    session_data.puzzle_solved = true;
    session_data.puzzle_id     = puzzle_id;
    session_data.solved_at     = Date.now();
    return session_data;
  }
  
  /**
   * invalidate session
   */
  invalidate_session(session_data) {
    session_data.status = 'invalidated';
    return session_data;
  }
}

module.exports = { session_factory };