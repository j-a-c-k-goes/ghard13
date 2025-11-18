/**
 * config_test: test configuration options and error handling
 * context: validates configuration flexibility and robustness
 * impact: ensures library handles various configurations correctly
 */

const { ghard13 } = require('../../src/ghard13');

class config_test {
  async run_tests() {
    const results = [];
    
    try {
      await this.test_hex_length_config(results);
      await this.test_site_salt_config(results);
      await this.test_error_handling(results);
      
    } catch (error) {
      results.push({ status: 'fail', test: 'config_test', error: error.message });
    }
    
    return results;
  }
  
  async test_hex_length_config(results) {
    const ghard13_short = new ghard13({
      obfuscator: { hex_length: 6 }
    });
    
    const puzzle = ghard13_short.generate_puzzle();
    this.assert(puzzle, 'puzzle should generate with custom hex length');
    
    const mappings = ghard13_short.obfuscator.generate_mappings(['test-selector']);
    this.assert(
      mappings['test-selector'].length >= 6,
      'custom hex length should be respected'
    );
    
    results.push({ status: 'pass', test: 'hex_length_config' });
  }
  
  async test_site_salt_config(results) {
    const ghard13_salt1 = new ghard13({
      obfuscator: { site_salt: 'salt1' }
    });
    const ghard13_salt2 = new ghard13({
      obfuscator: { site_salt: 'salt2' }
    });
    
    const mappings1 = ghard13_salt1.obfuscator.generate_mappings(['test-selector']);
    const mappings2 = ghard13_salt2.obfuscator.generate_mappings(['test-selector']);
    
    this.assert(
      mappings1['test-selector'] !== mappings2['test-selector'],
      'different salts should produce different mappings'
    );
    
    results.push({ status: 'pass', test: 'site_salt_config' });
  }
  
  async test_error_handling(results) {
    const ghard13_instance = new ghard13();
    
    // test empty content handling
    const result = ghard13_instance.harden_content('', '', '');
    this.assert(result, 'should handle empty content gracefully');
    
    // test invalid configuration
    const ghard13_invalid = new ghard13({
      obfuscator: { hex_length: -1 }
    });
    this.assert(ghard13_invalid, 'should handle invalid config gracefully');
    
    results.push({ status: 'pass', test: 'error_handling' });
  }
  
  assert(condition, message) {
    if (!condition) {
      throw new Error(`assertion failed: ${message}`);
    }
  }
}

module.exports = { config_test };