/**
 * test suite for remapper component
 * context: validates selector remapping across html/css/js files
 * impact: ensures functionality preservation after obfuscation
 */

const { remapper } = require('../../src/core/remapper');

function test_html_remapping() {
  const remap    = new remapper();
  const html     = '<div class="header main" id="top"><span class="text">content</span></div>';
  const mappings = {
    '.header': '.a1b2c3d4e5f6',
    '.main':   '.f6e5d4c3b2a1',
    '#top':    '#b1c2d3e4f5a6',
    '.text':   '.c3d4e5f6a1b2'
  };
  const remapped              = remap.remap_html(html, mappings);
  const has_obfuscated_class  = remapped.includes('class="a1b2c3d4e5f6 f6e5d4c3b2a1"');
  const has_obfuscated_id     = remapped.includes('id="b1c2d3e4f5a6"');
  const has_obfuscated_text   = remapped.includes('class="c3d4e5f6a1b2"');
  const no_original_selectors = !remapped.includes('header') && !remapped.includes('main') && !remapped.includes('top') && !remapped.includes('text');
  
  const is_valid = has_obfuscated_class && has_obfuscated_id && has_obfuscated_text && no_original_selectors;
  
  console.log(`test_html_remapping: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  original: ${html}`);
    console.log(`  remapped: ${remapped}`);
    console.log(`  class: ${has_obfuscated_class}, id: ${has_obfuscated_id}, text: ${has_obfuscated_text}, clean: ${no_original_selectors}`);
  }
  
  return is_valid;
}

function test_css_remapping() {
  const remap    = new remapper();
  const css      = '.header { color: red; } #main { display: block; } .nav-item:hover { opacity: 0.8; }';
  const mappings = {
    '.header':   '.a1b2c3d4e5f6',
    '#main':     '#f6e5d4c3b2a1',
    '.nav-item': '.b1c2d3e4f5a6'
  };
  const remapped              = remap.remap_css(css, mappings);
  const has_obfuscated_header = remapped.includes('.a1b2c3d4e5f6 { color: red; }');
  const has_obfuscated_main   = remapped.includes('#f6e5d4c3b2a1 { display: block; }');
  const has_obfuscated_nav    = remapped.includes('.b1c2d3e4f5a6:hover { opacity: 0.8; }');
  const is_valid              = has_obfuscated_header && has_obfuscated_main && has_obfuscated_nav;
  console.log(`test_css_remapping: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  original: ${css}`);
    console.log(`  remapped: ${remapped}`);
    console.log(`  header: ${has_obfuscated_header}, main: ${has_obfuscated_main}, nav: ${has_obfuscated_nav}`);
  }
  
  return is_valid;
}

function test_js_remapping() {
  const remap = new remapper();
  const js = `
    document.querySelector('.button');
    document.getElementById('main');
    document.getElementsByClassName('item');
    document.querySelectorAll('#nav .link');
  `;
  const mappings = {
    '.button': '.a1b2c3d4e5f6',
    '#main':   '#f6e5d4c3b2a1',
    '.item':   '.b1c2d3e4f5a6',
    '#nav':    '#c3d4e5f6a1b2',
    '.link':   '.d4e5f6a1b2c3'
  };
  
  const remapped                 = remap.remap_js(js, mappings);
  const has_obfuscated_query     = remapped.includes('querySelector(".a1b2c3d4e5f6")');
  const has_obfuscated_get_id    = remapped.includes('getElementById("f6e5d4c3b2a1")');
  const has_obfuscated_get_class = remapped.includes('getElementsByClassName("b1c2d3e4f5a6")');
  const is_valid                 = has_obfuscated_query && has_obfuscated_get_id && has_obfuscated_get_class;
  
  console.log(`test_js_remapping: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  original: ${js.trim()}`);
    console.log(`  remapped: ${remapped.trim()}`);
    console.log(`  query: ${has_obfuscated_query}, get_id: ${has_obfuscated_get_id}, get_class: ${has_obfuscated_get_class}`);
  }
  
  return is_valid;
}

function test_cross_file_consistency() {
  const remap = new remapper();
  const html  = '<div class="shared" id="unique"></div>';
  const css   = '.shared { color: blue; } #unique { margin: 10px; }';
  const js    = 'document.querySelector(".shared"); document.getElementById("unique");';
  
  const mappings = {
    '.shared': '.a1b2c3d4e5f6',
    '#unique': '#f6e5d4c3b2a1'
  };
  
  const remapped        = remap.remap_all(html, css, js, mappings);
  const html_has_shared = remapped.html.includes('class="a1b2c3d4e5f6"');
  const css_has_shared  = remapped.css.includes('.a1b2c3d4e5f6 { color: blue; }');
  const js_has_shared   = remapped.js.includes('querySelector(".a1b2c3d4e5f6")');
  const html_has_unique = remapped.html.includes('id="f6e5d4c3b2a1"');
  const css_has_unique  = remapped.css.includes('#f6e5d4c3b2a1 { margin: 10px; }');
  const js_has_unique   = remapped.js.includes('getElementById("f6e5d4c3b2a1")');
  const is_consistent   = html_has_shared && css_has_shared && js_has_shared && 
                       html_has_unique && css_has_unique && js_has_unique;
  
  console.log(`test_cross_file_consistency: ${is_consistent ? 'PASS' : 'FAIL'}`);
  if (!is_consistent) {
    console.log(`  html shared: ${html_has_shared}, css shared: ${css_has_shared}, js shared: ${js_has_shared}`);
    console.log(`  html unique: ${html_has_unique}, css unique: ${css_has_unique}, js unique: ${js_has_unique}`);
  }
  
  return is_consistent;
}

function test_validation_functionality() {
  const remap      = new remapper();
  const original   = '.header { color: red; } #main { display: block; }';
  const mappings   = { '.header': '.a1b2c3d4e5f6', '#main': '#f6e5d4c3b2a1' };
  const remapped   = remap.remap_css(original, mappings);
  const validation = remap.validate_remapping(original, remapped, mappings);
  const is_valid   = validation.success_rate === 1.0 && 
                  validation.successful_replacements === 2 &&
                  validation.failed_replacements.length === 0;
  console.log(`test_validation_functionality: ${is_valid ? 'PASS' : 'FAIL'}`);
  if (!is_valid) {
    console.log(`  validation:`, validation);
  }
  return is_valid;
}

function run_remapper_tests() {
  console.log('running remapper tests...');
  const results = [
    test_html_remapping(),
    test_css_remapping(),
    test_js_remapping(),
    test_cross_file_consistency(),
    test_validation_functionality()
  ];
  const passed = results.filter(Boolean).length;
  const total  = results.length;
  console.log(`remapper tests: ${passed}/${total} passed`);
  return passed === total;
}

// run if called directly
if (require.main === module) {
  run_remapper_tests();
}

module.exports = { run_remapper_tests };