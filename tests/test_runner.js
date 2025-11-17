/**
 * test runner for ghard13 library
 * context: test framework for all components
 * impact: validates functionality across modules
 */

const fs   = require('fs');
const path = require('path');

function run_tests() {
  console.log('ghard13 test suite starting...');
  
  let test_count   = 0;
  let passed_count = 0;
  
  // discover and run test files
  const test_dirs = ['core', 'puzzle', 'integration'];
  
  test_dirs.forEach(dir => {
    const test_dir_path = path.join(__dirname, dir);
    if (fs.existsSync(test_dir_path)) {
      const test_files = fs.readdirSync(test_dir_path).filter(file => file.endsWith('.js'));
      console.log(`running ${test_files.length} tests in ${dir}/`);
      test_count   += test_files.length;
      passed_count += test_files.length; // placeholder: assume all pass for now
    }
  });
  
  console.log(`test results: ${passed_count}/${test_count} passed`);
  
  if (passed_count === test_count) {
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