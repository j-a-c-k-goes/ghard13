/**
 * test suite for selector_oracle component
 * context: validates selector extraction and tracking functionality
 * impact: ensures cross-file selector consistency
 */

const { selector_oracle } = require('../../src/core/selector_oracle');

function test_html_selector_extraction() {
  const oracle = new selector_oracle();
  const html   = '<div class="header main" id="top"><span class="text">content</span></div>';
  
  const selectors = oracle.extract_html_selectors(html);
  
  const expected = ['.header', '.main', '#top', '.text'];
  const has_all_expected = expected.every(sel => selectors.includes(sel));
  
  console.log(`test_html_selector_extraction: ${has_all_expected ? 'PASS' : 'FAIL'}`);
  if (!has_all_expected) {
    console.log(`  expected: ${expected.join(', ')}`);
    console.log(`  got: ${selectors.join(', ')}`);
  }
  
  return has_all_expected;
}

function test_css_selector_extraction() {
  const oracle = new selector_oracle();
  const css = '.header { color: red; } #main { display: block; } .nav-item:hover { opacity: 0.8; }';
  
  const selectors = oracle.extract_css_selectors(css);
  
  const expected = ['.header', '#main', '.nav-item'];
  const has_all_expected = expected.every(sel => selectors.includes(sel));
  
  console.log(`test_css_selector_extraction: ${has_all_expected ? 'PASS' : 'FAIL'}`);
  if (!has_all_expected) {
    console.log(`  expected: ${expected.join(', ')}`);
    console.log(`  got: ${selectors.join(', ')}`);
  }
  
  return has_all_expected;
}

function test_js_selector_extraction() {
  const oracle = new selector_oracle();
  const js = `
    document.querySelector('.button');
    document.getElementById('main');
    document.getElementsByClassName('item');
    document.querySelectorAll('#nav .link');
  `;
  
  const selectors = oracle.extract_js_selectors(js);
  
  const expected = ['.button', '#main', '.item', '#nav'];
  const has_expected = expected.some(sel => selectors.includes(sel));
  
  console.log(`test_js_selector_extraction: ${has_expected ? 'PASS' : 'FAIL'}`);
  if (!has_expected) {
    console.log(`  expected some of: ${expected.join(', ')}`);
    console.log(`  got: ${selectors.join(', ')}`);
  }
  
  return has_expected;
}

function test_cross_file_tracking() {
  const oracle = new selector_oracle();
  const html   = '<div class="shared" id="unique-html"></div>';
  const css    = '.shared { color: blue; } .css-only { margin: 10px; }';
  const js     = 'document.querySelector(".shared");';
  
  oracle.extract_selectors(html, css, js);
  
  const shared_info = oracle.get_selector_info('.shared');
  const is_tracked_correctly = shared_info && 
    shared_info.usage.html && 
    shared_info.usage.css && 
    shared_info.usage.js &&
    shared_info.count === 3;
  
  console.log(`test_cross_file_tracking: ${is_tracked_correctly ? 'PASS' : 'FAIL'}`);
  if (!is_tracked_correctly) {
    console.log(`  shared_info:`, shared_info);
  }
  
  return is_tracked_correctly;
}

function run_selector_oracle_tests() {
  console.log('running selector_oracle tests...');
  
  const results = [
    test_html_selector_extraction(),
    test_css_selector_extraction(),
    test_js_selector_extraction(),
    test_cross_file_tracking()
  ];
  
  const passed = results.filter(Boolean).length;
  const total  = results.length;
  
  console.log(`selector_oracle tests: ${passed}/${total} passed`);
  return passed === total;
}

// run if called directly
if (require.main === module) {
  run_selector_oracle_tests();
}

module.exports = { run_selector_oracle_tests };