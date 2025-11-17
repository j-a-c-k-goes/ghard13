/**
 * ghard13 main library entry point
 * context: primary interface for app hardening functionality
 * impact: coordinates obfuscation, puzzles, and session management
 */

// core components
const { obfuscator }      = require('./core/obfuscator');
const { selector_oracle } = require('./core/selector_oracle');
const { remapper }        = require('./core/remapper');

// puzzle components
const { puzzle_engine }   = require('./puzzle/puzzle_engine');
const { session_manager } = require('./session/session_manager');

/**
 * main ghard13 library class
 */
class ghard13 {
  constructor(config = {}) {
    this.config = {
      build_time:      true,
      puzzle_enabled:  true,
      session_timeout: 3600000, // 1 hour
      fallback_limits: {
        timeout_limit: 2,
        invalid_solution_limit: 3,
        max_total_attempts: 5
      },
      ...config
    };
    
    this.obfuscator      = new obfuscator();
    this.selector_oracle = new selector_oracle();
    this.remapper        = new remapper(this.selector_oracle);
    this.puzzle_engine   = new puzzle_engine();
    this.session_manager = new session_manager(this.config.session_timeout);
  }
  
  /**
   * harden site content with obfuscation
   */
  harden_content(html_content, css_content, js_content) {
    console.log('hardening content...');
    
    // extract selectors
    const selectors = this.selector_oracle.extract_selectors(html_content, css_content, js_content);
    
    // generate obfuscated mappings
    const mappings = this.obfuscator.generate_mappings(selectors);
    
    // remap content
    const hardened_html = this.remapper.remap_html(html_content, mappings);
    const hardened_css  = this.remapper.remap_css(css_content, mappings);
    const hardened_js   = this.remapper.remap_js(js_content, mappings);
    
    return {
      html:     hardened_html,
      css:      hardened_css,
      js:       hardened_js,
      mappings: mappings
    };
  }
  
  /**
   * generate puzzle for site entry
   */
  generate_puzzle() {
    return this.puzzle_engine.generate();
  }
  
  /**
   * validate puzzle solution
   */
  validate_puzzle(puzzle_id, solution, behavioral_data) {
    return this.puzzle_engine.validate(puzzle_id, solution, behavioral_data);
  }
}

module.exports = { ghard13 };