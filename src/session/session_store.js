/**
 * session_store: manage session data storage and retrieval
 * context: handles session persistence and lookup operations
 * impact: provides session data management without external dependencies
 */

class session_store {
  constructor() {
    this.sessions        = new Map(); // session_id -> session_data
    this.puzzle_sessions = new Map(); // puzzle_id -> session_id
    this.user_sessions   = new Map(); // user_identifier -> [session_ids]
  }
  
  /**
   * store session data
   */
  store_session(session_data) {
    this.sessions.set(session_data.id, session_data);
    
    // index by user if provided
    if (session_data.user_identifier) {
      if (!this.user_sessions.has(session_data.user_identifier)) {
        this.user_sessions.set(session_data.user_identifier, []);
      }
      this.user_sessions.get(session_data.user_identifier).push(session_data.id);
    }
    
    return true;
  }
  
  /**
   * get session by id
   */
  get_session(session_id) {
    return this.sessions.get(session_id) || null;
  }
  
  /**
   * get sessions by user identifier
   */
  get_user_sessions(user_identifier) {
    const session_ids = this.user_sessions.get(user_identifier) || [];
    return session_ids.map(id => this.sessions.get(id)).filter(Boolean);
  }
  
  /**
   * link puzzle to session
   */
  link_puzzle_session(puzzle_id, session_id) {
    this.puzzle_sessions.set(puzzle_id, session_id);
  }
  
  /**
   * get session by puzzle id
   */
  get_session_by_puzzle(puzzle_id) {
    const session_id = this.puzzle_sessions.get(puzzle_id);
    return session_id ? this.get_session(session_id) : null;
  }
  
  /**
   * remove session
   */
  remove_session(session_id) {
    const session = this.sessions.get(session_id);
    
    if (session) {
      // remove from main store
      this.sessions.delete(session_id);
      
      // remove puzzle mapping
      if (session.puzzle_id) {
        this.puzzle_sessions.delete(session.puzzle_id);
      }
      
      // remove from user index
      if (session.user_identifier) {
        const user_session_ids = this.user_sessions.get(session.user_identifier);
        if (user_session_ids) {
          const index = user_session_ids.indexOf(session_id);
          if (index > -1) {
            user_session_ids.splice(index, 1);
          }
          if (user_session_ids.length === 0) {
            this.user_sessions.delete(session.user_identifier);
          }
        }
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * get all sessions
   */
  get_all_sessions() {
    return Array.from(this.sessions.values());
  }
  
  /**
   * get session count
   */
  get_session_count() {
    return this.sessions.size;
  }
}

module.exports = { session_store };