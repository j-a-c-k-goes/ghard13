/**
 * integration_runner: orchestrates all integration tests
 * context: runs all integration test modules and reports results
 * impact: provides comprehensive integration test coverage
 */

const { hardening_test } = require('./hardening_test');
const { puzzle_test } = require('./puzzle_test');
const { config_test } = require('./config_test');

class integration_runner {
  constructor() {
    this.test_modules = [
      { name: 'hardening', module: new hardening_test() },
      { name: 'puzzle', module: new puzzle_test() },
      { name: 'config', module: new config_test() }
    ];
  }
  
  async run_all_tests() {
    console.log('starting integration tests...\n');
    
    const all_results = [];
    
    for (const test_module of this.test_modules) {
      console.log(`running ${test_module.name} tests...`);
      
      try {
        const results = await test_module.module.run_tests();
        all_results.push(...results.map(r => ({ ...r, module: test_module.name })));
        
        const passed = results.filter(r => r.status === 'pass').length;
        console.log(`  ✓ ${passed}/${results.length} tests passed`);
        
      } catch (error) {
        all_results.push({
          status: 'fail',
          module: test_module.name,
          test: 'module_execution',
          error: error.message
        });
        console.log(`  ✗ ${test_module.name} module failed: ${error.message}`);
      }
    }
    
    this.print_summary(all_results);
    return this.get_summary(all_results);
  }
  
  print_summary(results) {
    console.log('\n--- integration test summary ---');
    
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const total = results.length;
    
    console.log(`total tests: ${total}`);
    console.log(`passed: ${passed}`);
    console.log(`failed: ${failed}`);
    console.log(`success rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\nfailed tests:');
      results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`  - ${r.module}.${r.test}: ${r.error}`));
    }
    
    console.log('\ntest breakdown by module:');
    this.test_modules.forEach(module => {
      const module_results = results.filter(r => r.module === module.name);
      const module_passed = module_results.filter(r => r.status === 'pass').length;
      console.log(`  ${module.name}: ${module_passed}/${module_results.length} passed`);
    });
  }
  
  get_summary(results) {
    const passed = results.filter(r => r.status === 'pass').length;
    const total = results.length;
    
    return {
      total_tests: total,
      passed_tests: passed,
      failed_tests: total - passed,
      success_rate: (passed / total) * 100,
      all_passed: passed === total,
      results: results
    };
  }
}

// run tests if called directly
if (require.main === module) {
  const runner = new integration_runner();
  runner.run_all_tests().then(summary => {
    process.exit(summary.all_passed ? 0 : 1);
  });
}

module.exports = { integration_runner };