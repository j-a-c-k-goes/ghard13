/**
 * test suite for session_manager component
 * context: validates session handling and puzzle state management
 * impact: ensures proper session lifecycle without site interference
 */

const { session_manager } = require('../../src/session/session_manager');

function test_session_creation() {
  const manager    = new session_manager();
  const session_id = manager.create_session('user123');
  
  const has_session_id = session_id && session_id.startsWith('ghard13_');
  const session_data   = manager.get_session(session_id);
  const has_valid_data = session_data && 
    session_data.id === session_id &&
    session_data.user_identifier === 'user123' &&
    session_data.puzzle_solved === false;
  
  const is_valid = has_session_id && has_valid_data;
  
  console.log(`test_session_creation: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  session_id: ${has_session_id}, data: ${has_valid_data}`);
  }
  
  return is_valid;
}

function test_puzzle_solving() {
  const manager            = new session_manager();
  const session_id         = manager.create_session('user123');
  const puzzle_id          = 'puzzle_test_123';
  const initially_unsolved = !manager.is_puzzle_solved(session_id);
  const mark_success       = manager.mark_puzzle_solved(session_id, puzzle_id);
  const now_solved         = manager.is_puzzle_solved(session_id);
  const session_data       = manager.get_session(session_id);
  const has_puzzle_data    = session_data.puzzle_id === puzzle_id && session_data.solved_at;
  const is_valid           = initially_unsolved && mark_success && now_solved && has_puzzle_data;
  console.log(`test_puzzle_solving: ${is_valid ? 'PASS' : 'FAIL'}`);
  return is_valid;
}

function test_session_expiration() {
  const manager         = new session_manager(1000); // 1 second timeout
  const session_id      = manager.create_session('user123');
  const initially_valid = manager.get_session(session_id) !== null;
  
  // manually expire session
  const session_data      = manager.store.get_session(session_id);
  session_data.expires_at = Date.now() - 1000; // expired 1 second ago
  const after_expiry      = manager.get_session(session_id);
  const is_expired        = after_expiry === null;
  const is_valid          = initially_valid && is_expired;
  console.log(`test_session_expiration: ${is_valid ? 'PASS' : 'FAIL'}`);
  return is_valid;
}

function test_session_cleanup() {
  const manager  = new session_manager(1000); // 1 second timeout
  const session1 = manager.create_session('user1');
  const session2 = manager.create_session('user2');
  
  // expire first session
  const session1_data      = manager.store.get_session(session1);
  session1_data.expires_at = Date.now() - 1000;
  const initial_count      = manager.store.get_session_count();
  const cleaned_count      = manager.cleanup_expired();
  const final_count        = manager.store.get_session_count();
  const cleaned_one        = cleaned_count === 1;
  const reduced_count      = final_count < initial_count;
  const is_valid           = cleaned_one && reduced_count;
  
  console.log(`test_session_cleanup: ${is_valid ? 'PASS' : 'FAIL'}`);
  return is_valid;
}

function test_user_puzzle_requirement() {
  const manager = new session_manager();
  
  // user without session needs puzzle
  const needs_puzzle_initially = manager.needs_puzzle('user123');
  
  // create and solve puzzle for user
  const session_id = manager.create_session('user123');
  manager.mark_puzzle_solved(session_id, 'puzzle_123');
  
  // user with solved session doesn't need puzzle
  const needs_puzzle_after_solve = manager.needs_puzzle('user123');
  
  // different user still needs puzzle
  const other_user_needs = manager.needs_puzzle('user456');
  
  const is_valid = needs_puzzle_initially && !needs_puzzle_after_solve && other_user_needs;
  
  console.log(`test_user_puzzle_requirement: ${is_valid ? 'PASS' : 'FAIL'}`);
  return is_valid;
}

function run_session_manager_tests() {
  console.log('running session_manager tests...');
  
  const results = [
    test_session_creation(),
    test_puzzle_solving(),
    test_session_expiration(),
    test_session_cleanup(),
    test_user_puzzle_requirement()
  ];
  
  const passed = results.filter(Boolean).length;
  const total  = results.length;
  
  console.log(`session_manager tests: ${passed}/${total} passed`);
  return passed === total;
}

// run if called directly
if (require.main === module) {
  run_session_manager_tests();
}

module.exports = { run_session_manager_tests };