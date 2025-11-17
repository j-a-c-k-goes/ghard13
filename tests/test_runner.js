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
    
    const core_results = [
      run_selector_oracle_tests(),
      run_obfuscator_tests()
    ];
    
    const core_passed = core_results.filter(Boolean).length;
    total_passed += core_passed;
    total_tests  += core_results.length;
    
    console.log(`core tests: ${core_passed}/${core_results.length} passed`);
  } catch (error) {
    console.log('error running core tests:', error.message);
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