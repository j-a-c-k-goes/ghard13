/**
 * test suite for obfuscator component
 * context: validates hex generation and mapping functionality
 * impact: ensures reliable selector obfuscation without collisions
 */

const { obfuscator } = require('../../src/core/obfuscator');

function test_hex_generation() {
  const obf = new obfuscator();
  const hex = obf.generate_hex_string(12);
  
  const is_valid_length    = hex.length === 12;
  const is_hex_format      = /^[a-f][0-9a-f]{11}$/.test(hex);
  const starts_with_letter = /^[a-f]/.test(hex);
  
  const is_valid = is_valid_length && is_hex_format && starts_with_letter;
  
  console.log(`test_hex_generation: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  generated: ${hex}`);
    console.log(`  length: ${hex.length}, format: ${is_hex_format}, starts_letter: ${starts_with_letter}`);
  }
  
  return is_valid;
}

function test_unique_hex_generation() {
  const obf       = new obfuscator();
  const generated = new Set();
  const count     = 50;
  
  for (let i = 0; i < count; i++) {
    const hex = obf.generate_unique_hex();
    generated.add(hex);
  }
  
  const all_unique = generated.size === count;
  
  console.log(`test_unique_hex_generation: ${all_unique ? 'PASS' : 'FAIL'}`);
  if (!all_unique) {
    console.log(`  generated ${generated.size} unique values out of ${count}`);
  }
  
  return all_unique;
}

function test_selector_obfuscation() {
  const obf        = new obfuscator();
  const selectors  = ['.header', '#main', '.nav-item'];
  const obfuscated = selectors.map(sel => obf.obfuscate_selector(sel));
  
  const preserves_prefix = obfuscated.every((obs, i) => 
    obs.charAt(0) === selectors[i].charAt(0)
  );
  
  const all_different = obfuscated.every((obs, i) => 
    obs !== selectors[i]
  );
  
  const all_valid_format = obfuscated.every(obs => 
    /^[.#][a-f][0-9a-f]+$/.test(obs)
  );
  
  const is_valid = preserves_prefix && all_different && all_valid_format;
  
  console.log(`test_selector_obfuscation: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  original: ${selectors.join(', ')}`);
    console.log(`  obfuscated: ${obfuscated.join(', ')}`);
    console.log(`  prefix: ${preserves_prefix}, different: ${all_different}, format: ${all_valid_format}`);
  }
  
  return is_valid;
}

function test_mapping_consistency() {
  const obf      = new obfuscator();
  const selector = '.test-class';
  
  const first_obfuscation  = obf.obfuscate_selector(selector);
  const second_obfuscation = obf.obfuscate_selector(selector);
  
  const is_consistent = first_obfuscation === second_obfuscation;
  const can_reverse   = obf.get_original(first_obfuscation) === selector;
  
  const is_valid = is_consistent && can_reverse;
  
  console.log(`test_mapping_consistency: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  first: ${first_obfuscation}`);
    console.log(`  second: ${second_obfuscation}`);
    console.log(`  consistent: ${is_consistent}, reversible: ${can_reverse}`);
  }
  
  return is_valid;
}

function test_batch_mapping() {
  const obf       = new obfuscator();
  const selectors = ['.header', '#main', '.footer', '#sidebar'];
  const mappings  = obf.generate_mappings(selectors);
  
  const has_all_selectors = selectors.every(sel => mappings.hasOwnProperty(sel));
  const all_obfuscated    = Object.values(mappings).every(obs => 
    /^[.#][a-f][0-9a-f]+$/.test(obs)
  );
  const all_unique = new Set(Object.values(mappings)).size === selectors.length;
  const is_valid   = has_all_selectors && all_obfuscated && all_unique;
  
  console.log(`test_batch_mapping: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  has_all: ${has_all_selectors}, obfuscated: ${all_obfuscated}, unique: ${all_unique}`);
    console.log(`  mappings:`, mappings);
  }
  
  return is_valid;
}

function run_obfuscator_tests() {
  console.log('running obfuscator tests...');
  
  const results = [
    test_hex_generation(),
    test_unique_hex_generation(),
    test_selector_obfuscation(),
    test_mapping_consistency(),
    test_batch_mapping()
  ];
  
  const passed = results.filter(Boolean).length;
  const total  = results.length;
  
  console.log(`obfuscator tests: ${passed}/${total} passed`);
  return passed === total;
}

// run if called directly
if (require.main === module) {
  run_obfuscator_tests();
}

module.exports = { run_obfuscator_tests };