/**
 * session_manager: orchestrate session components for minimal session handling
 * context: coordinates session operations without site collision
 * impact: provides main interface for session management
 */

const { session_store }     = require('./session_store');
const { session_validator } = require('./session_validator');
const { session_factory }   = require('./session_factory');

class session_manager {
  constructor(session_timeout = 3600000) { // 1 hour default
    this.store           = new session_store();
    this.validator       = new session_validator();
    this.factory         = new session_factory(session_timeout);
    this.session_timeout = session_timeout;
  }
  
  /**
   * create new session
   */
  create_session(user_identifier = null) {
    const session_data = this.factory.create_session_data(user_identifier);
    this.store.store_session(session_data);
    return session_data.id;
  }
  
  /**
   * get session data
   */
  get_session(session_id) {
    const session = this.store.get_session(session_id);
    
    if (!this.validator.is_valid(session)) {
      if (session) {
        this.store.remove_session(session_id);
      }
      return null;
    }
    
    return session;
  }
  
  /**
   * check if session has solved puzzle
   */
  is_puzzle_solved(session_id) {
    const session = this.get_session(session_id);
    return session ? session.puzzle_solved : false;
  }
  
  /**
   * mark puzzle as solved for session
   */
  mark_puzzle_solved(session_id, puzzle_id) {
    const session = this.get_session(session_id);
    
    if (session) {
      this.factory.mark_puzzle_solved(session, puzzle_id);
      this.store.link_puzzle_session(puzzle_id, session_id);
      return true;
    }
    
    return false;
  }
  
  /**
   * get session by puzzle id
   */
  get_session_by_puzzle(puzzle_id) {
    return this.store.get_session_by_puzzle(puzzle_id);
  }
  
  /**
   * extend session timeout
   */
  extend_session(session_id, additional_time = null) {
    const session = this.get_session(session_id);
    
    if (session) {
      const extension = additional_time || this.session_timeout;
      this.validator.extend_expiration(session, extension);
      return true;
    }
    
    return false;
  }
  
  /**
   * invalidate session
   */
  invalidate_session(session_id) {
    const session = this.store.get_session(session_id);
    
    if (session) {
      this.factory.invalidate_session(session);
      this.store.remove_session(session_id);
      return true;
    }
    
    return false;
  }
  
  /**
   * cleanup expired sessions
   */
  cleanup_expired() {
    const all_sessions     = this.store.get_all_sessions();
    const expired_sessions = this.validator.get_expired_sessions(all_sessions);
    
    expired_sessions.forEach(session => {
      this.store.remove_session(session.id);
    });
    
    return expired_sessions.length;
  }
  
  /**
   * get session statistics
   */
  get_stats() {
    const all_sessions    = this.store.get_all_sessions();
    const active_sessions = this.validator.get_active_sessions(all_sessions);
    const solved_sessions = all_sessions.filter(s => s.puzzle_solved);
    
    return {
      total_sessions:   all_sessions.length,
      active_sessions:  active_sessions.length,
      solved_sessions:  solved_sessions.length,
      expired_sessions: all_sessions.length - active_sessions.length
    };
  }
  
  /**
   * check if user needs puzzle (no valid solved session)
   */
  needs_puzzle(user_identifier = null) {
    if (!user_identifier) {
      return true; // no identifier, always need puzzle
    }
    
    const user_sessions = this.store.get_user_sessions(user_identifier);
    return !this.validator.has_valid_solved_session(user_sessions);
  }
}

module.exports = { session_manager };