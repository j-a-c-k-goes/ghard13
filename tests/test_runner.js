/**
 * test runner for ghard13 library
 * context: test framework for all components
 * impact: validates functionality across modules
 */

const fs   = require('fs');
const path = require('path');

function run_tests() {
  console.log('ghard13 test suite starting...');
  
  let total_passed = 0;
  let total_tests  = 0;
  
  // run core component tests
  try {
    const { run_selector_oracle_tests } = require('./core/test_selector_oracle');
    const { run_obfuscator_tests }      = require('./core/test_obfuscator');
    const { run_remapper_tests }        = require('./core/test_remapper');
    
    const core_results = [
      run_selector_oracle_tests(),
      run_obfuscator_tests(),
      run_remapper_tests()
    ];
    
    const core_passed = core_results.filter(Boolean).length;
    total_passed += core_passed;
    total_tests  += core_results.length;
    
    console.log(`core tests: ${core_passed}/${core_results.length} passed`);
  } catch (error) {
    console.log('error running core tests:', error.message);
  }
  
  // run puzzle component tests
  try {
    const { run_puzzle_engine_tests } = require('./puzzle/test_puzzle_engine');
    
    const puzzle_results = [
      run_puzzle_engine_tests()
    ];
    
    const puzzle_passed = puzzle_results.filter(Boolean).length;
    total_passed += puzzle_passed;
    total_tests  += puzzle_results.length;
    
    console.log(`puzzle tests: ${puzzle_passed}/${puzzle_results.length} passed`);
  } catch (error) {
    console.log('error running puzzle tests:', error.message);
  }
  
  // run session component tests
  try {
    const { run_session_manager_tests } = require('./session/test_session_manager');
    const { run_fallback_handler_tests } = require('./session/test_fallback_handler');
    
    const session_results = [
      run_session_manager_tests(),
      run_fallback_handler_tests()
    ];
    
    const session_passed = session_results.filter(Boolean).length;
    total_passed += session_passed;
    total_tests  += session_results.length;
    
    console.log(`session tests: ${session_passed}/${session_results.length} passed`);
  } catch (error) {
    console.log('error running session tests:', error.message);
  }
  
  console.log(`\ntotal test results: ${total_passed}/${total_tests} passed`);
  
  if (total_passed === total_tests) {
    console.log('all tests passed');
    process.exit(0);
  } else {
    console.log('some tests failed');
    process.exit(1);
  }
}

// run if called directly
if (require.main === module) {
  run_tests();
}

module.exports = { run_tests };