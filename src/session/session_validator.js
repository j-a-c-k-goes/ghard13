/**
 * session_validator: validate session state and expiration
 * context: handles session lifecycle validation and cleanup logic
 * impact: ensures session integrity and automatic cleanup
 */

class session_validator {
  constructor() {}
  
  /**
   * check if session is expired
   */
  is_expired(session_data) {
    return Date.now() > session_data.expires_at;
  }
  
  /**
   * check if session is valid (exists and not expired)
   */
  is_valid(session_data) {
    return session_data && !this.is_expired(session_data);
  }
  
  /**
   * get expired sessions from list
   */
  get_expired_sessions(sessions) {
    const now = Date.now();
    return sessions.filter(session => now > session.expires_at);
  }
  
  /**
   * get active sessions from list
   */
  get_active_sessions(sessions) {
    const now = Date.now();
    return sessions.filter(session => now <= session.expires_at);
  }
  
  /**
   * check if user has valid solved session
   */
  has_valid_solved_session(user_sessions) {
    const now = Date.now();
    return user_sessions.some(session => 
      session.puzzle_solved && now <= session.expires_at
    );
  }
  
  /**
   * extend session expiration
   */
  extend_expiration(session_data, additional_time) {
    session_data.expires_at = Date.now() + additional_time;
    return session_data;
  }
  
  /**
   * mark session as expired
   */
  mark_expired(session_data) {
    session_data.status     = 'expired';
    session_data.expires_at = Date.now() - 1000; // expired 1 second ago
    return session_data;
  }
}

module.exports = { session_validator };