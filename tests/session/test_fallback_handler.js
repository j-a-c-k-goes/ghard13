/**
 * test suite for fallback_handler component
 * context: validates fallback strategies and content serving
 * impact: ensures proper handling of puzzle failures
 */

const { fallback_handler } = require('../../src/session/fallback_handler');

function test_fallback_strategy_selection() {
  const handler = new fallback_handler();
  
  const timeout_strategy  = handler.get_fallback_strategy('timeout', 0);
  const timeout_repeated  = handler.get_fallback_strategy('timeout', 3);
  const invalid_solution  = handler.get_fallback_strategy('invalid_solution', 1);
  const too_many_attempts = handler.get_fallback_strategy('too_many_attempts', 5);
  
  const timeout_correct          = timeout_strategy === 'new_puzzle';
  const timeout_repeated_correct = timeout_repeated === 'serve_obfuscated';
  const invalid_correct          = invalid_solution === 'new_puzzle';
  const too_many_correct         = too_many_attempts === 'deny_access';
  
  const is_valid = timeout_correct && timeout_repeated_correct && invalid_correct && too_many_correct;
  
  console.log(`test_fallback_strategy_selection: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  timeout: ${timeout_correct}, repeated: ${timeout_repeated_correct}`);
    console.log(`  invalid: ${invalid_correct}, too_many: ${too_many_correct}`);
  }
  
  return is_valid;
}

function test_obfuscated_fallback_creation() {
  const handler          = new fallback_handler();
  const hardened_content = '<div class="a1b2c3">content</div>';
  const fallback         = handler.create_obfuscated_fallback(null, hardened_content);
  const correct_strategy = fallback.strategy === 'serve_obfuscated';
  const has_content      = fallback.content === hardened_content;
  const allows_access    = fallback.allow_access === true;
  const no_retry         = fallback.retry_allowed === false;
  const is_valid         = correct_strategy && has_content && allows_access && no_retry;
  
  console.log(`test_obfuscated_fallback_creation: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  strategy: ${correct_strategy}, content: ${has_content}`);
    console.log(`  access: ${allows_access}, retry: ${no_retry}`);
  }
  
  return is_valid;
}

function test_access_denied_fallback() {
  const handler          = new fallback_handler();
  const reason           = 'too_many_attempts';
  const fallback         = handler.create_access_denied_fallback(reason);
  const correct_strategy = fallback.strategy === 'deny_access';
  const has_html_content = fallback.content.includes('<html>') && fallback.content.includes('Too many failed attempts');
  const denies_access    = fallback.allow_access === false;
  const no_retry         = fallback.retry_allowed === false;
  const is_valid         = correct_strategy && has_html_content && denies_access && no_retry;
  
  console.log(`test_access_denied_fallback: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  strategy: ${correct_strategy}, html: ${has_html_content}`);
    console.log(`  access: ${denies_access}, retry: ${no_retry}`);
  }
  
  return is_valid;
}

function test_retry_fallback_creation() {
  const handler            = new fallback_handler();
  const puzzle_html        = '<div id="new-puzzle">Try again</div>';
  const attempt_count      = 2;
  const fallback           = handler.create_retry_fallback(puzzle_html, attempt_count);
  const correct_strategy   = fallback.strategy === 'new_puzzle';
  const has_puzzle_content = fallback.content === puzzle_html;
  const denies_access      = fallback.allow_access === false;
  const allows_retry       = fallback.retry_allowed === true;
  const correct_count      = fallback.attempt_count === attempt_count + 1;
  const is_valid           = correct_strategy && has_puzzle_content && denies_access && allows_retry && correct_count;
  
  console.log(`test_retry_fallback_creation: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  strategy: ${correct_strategy}, content: ${has_puzzle_content}`);
    console.log(`  access: ${denies_access}, retry: ${allows_retry}, count: ${correct_count}`);
  }
  
  return is_valid;
}

function test_puzzle_failure_handling() {
  const handler          = new fallback_handler();
  const hardened_content = '<div class="obfuscated">content</div>';
  const failure_data = {
    reason: 'timeout',
    attempt_count: 0,
    session_id: 'test_session'
  };
  
  const mock_puzzle_generator = {
    generate: () => ({ html: '<div>new puzzle</div>' })
  };
  
  const fallback          = handler.handle_puzzle_failure(failure_data, hardened_content, mock_puzzle_generator);
  const is_retry_strategy = fallback.strategy === 'new_puzzle';
  const has_new_puzzle    = fallback.content.includes('new puzzle');
  const allows_retry      = fallback.retry_allowed === true;
  const is_valid          = is_retry_strategy && has_new_puzzle && allows_retry;
  
  console.log(`test_puzzle_failure_handling: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  strategy: ${is_retry_strategy}, puzzle: ${has_new_puzzle}, retry: ${allows_retry}`);
  }
  
  return is_valid;
}

function test_fallback_application_check() {
  const handler                      = new fallback_handler();
  const should_apply_failed_puzzle   = handler.should_apply_fallback('timeout', 'active');
  const should_apply_expired_session = handler.should_apply_fallback('solved', 'expired');
  const should_not_apply_success     = handler.should_apply_fallback('solved', 'active');
  const is_valid = should_apply_failed_puzzle && should_apply_expired_session && !should_not_apply_success;
  
  console.log(`test_fallback_application_check: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  failed_puzzle: ${should_apply_failed_puzzle}, expired_session: ${should_apply_expired_session}`);
    console.log(`  success_case: ${should_not_apply_success}`);
  }
  
  return is_valid;
}

function run_fallback_handler_tests() {
  console.log('running fallback_handler tests...');
  
  const results = [
    test_fallback_strategy_selection(),
    test_obfuscated_fallback_creation(),
    test_access_denied_fallback(),
    test_retry_fallback_creation(),
    test_puzzle_failure_handling(),
    test_fallback_application_check()
  ];
  
  const passed = results.filter(Boolean).length;
  const total  = results.length;
  
  console.log(`fallback_handler tests: ${passed}/${total} passed`);
  return passed === total;
}

// run if called directly
if (require.main === module) {
  run_fallback_handler_tests();
}

module.exports = { run_fallback_handler_tests };