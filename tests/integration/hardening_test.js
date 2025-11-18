/**
 * hardening_test: test complete hardening workflow
 * context: validates selector obfuscation and content remapping
 * impact: ensures hardening maintains functionality
 */

const { ghard13 } = require('../../src/ghard13');

class hardening_test {
  constructor() {
    this.sample_html = `
      <header class="main-header" id="site-header">
        <nav class="navigation">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="#home" class="nav-link">home</a>
            </li>
          </ul>
        </nav>
      </header>
      <section class="hero-section" id="hero">
        <h1 class="hero-title">welcome</h1>
        <button class="cta-button" id="learn-more">learn more</button>
      </section>
    `;
    
    this.sample_css = `
      .main-header { background: #fff; }
      .navigation { display: flex; }
      .nav-list { list-style: none; }
      .nav-item { margin: 0 1rem; }
      .nav-link { text-decoration: none; }
      .hero-section { padding: 2rem; }
      .hero-title { font-size: 2rem; }
      .cta-button { padding: 0.5rem 1rem; }
      #site-header { border-bottom: 1px solid #eee; }
      #hero { background: #f5f5f5; }
      #learn-more { background: #007cba; }
    `;
    
    this.sample_js = `
      document.querySelector('.cta-button').addEventListener('click', function() {
        document.getElementById('hero').style.display = 'none';
      });
      
      const header = document.getElementById('site-header');
      header.classList.add('sticky');
    `;
  }
  
  async run_tests() {
    const results = [];
    
    try {
      await this.test_content_hardening(results);
      await this.test_selector_obfuscation(results);
      await this.test_mapping_consistency(results);
      
    } catch (error) {
      results.push({ status: 'fail', test: 'hardening_test', error: error.message });
    }
    
    return results;
  }
  
  async test_content_hardening(results) {
    const ghard13_instance = new ghard13({
      site_salt: 'hardening_test_salt',
      obfuscator: { hex_length: 8, use_non_hex_chars: true }
    });
    
    const result = ghard13_instance.harden_content(
      this.sample_html,
      this.sample_css,
      this.sample_js
    );
    
    this.assert(result.html, 'hardened html should exist');
    this.assert(result.css, 'hardened css should exist');
    this.assert(result.js, 'hardened js should exist');
    this.assert(result.mappings, 'mappings should exist');
    
    results.push({ status: 'pass', test: 'content_hardening' });
  }
  
  async test_selector_obfuscation(results) {
    const ghard13_instance = new ghard13();
    
    // extract: selectors to see what's found
    const selectors = ghard13_instance.selector_oracle.extract_selectors(
      this.sample_html, this.sample_css, this.sample_js
    );
    
    this.assert(selectors.length > 0, 'should extract selectors from content');
    
    // generate: mappings for extracted selectors
    const mappings = ghard13_instance.obfuscator.generate_mappings(selectors);
    
    // check: mappings exist for class selectors
    const class_selectors = selectors.filter(s => s.startsWith('.'));
    this.assert(class_selectors.length > 0, 'should find class selectors');
    
    class_selectors.forEach(selector => {
      this.assert(mappings[selector], `mapping should exist for ${selector}`);
      this.assert(
        mappings[selector].length >= 8,
        `obfuscated selector should be at least 8 chars: ${mappings[selector]}`
      );
    });
    
    results.push({ status: 'pass', test: 'selector_obfuscation' });
  }
  
  async test_mapping_consistency(results) {
    const ghard13_instance = new ghard13({ obfuscator: { site_salt: 'consistent_salt' } });
    
    const result1 = ghard13_instance.harden_content(this.sample_html, '', '');
    const result2 = ghard13_instance.harden_content(this.sample_html, '', '');
    
    this.assert(
      result1.mappings['main-header'] === result2.mappings['main-header'],
      'same salt should produce consistent mappings'
    );
    
    results.push({ status: 'pass', test: 'mapping_consistency' });
  }
  
  assert(condition, message) {
    if (!condition) {
      throw new Error(`assertion failed: ${message}`);
    }
  }
}

module.exports = { hardening_test };