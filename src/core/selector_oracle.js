/**
 * selector_oracle: track site selectors and cross-reference html/js/css
 * context: maintains mapping of selectors across all file types
 * impact: enables consistent obfuscation without breaking functionality
 */

class selector_oracle {
  constructor() {
    this.selectors = new Map(); // selector -> { type, files, count }
    this.mappings = new Map();  // original -> obfuscated
  }
  
  /**
   * extract selectors from html content
   */
  extract_html_selectors(html_content) {
    const selectors = new Set();
    
    // extract class attributes
    const class_matches = html_content.match(/class\s*=\s*["']([^"']+)["']/g);
    if (class_matches) {
      class_matches.forEach(match => {
        const classes = match.match(/["']([^"']+)["']/)[1].split(/\s+/);
        classes.forEach(cls => {
          if (cls.trim()) {
            selectors.add(`.${cls.trim()}`);
          }
        });
      });
    }
    
    // extract id attributes
    const id_matches = html_content.match(/id\s*=\s*["']([^"']+)["']/g);
    if (id_matches) {
      id_matches.forEach(match => {
        const id = match.match(/["']([^"']+)["']/)[1];
        if (id.trim()) {
          selectors.add(`#${id.trim()}`);
        }
      });
    }
    
    return Array.from(selectors);
  }
  
  /**
   * extract selectors from css content
   */
  extract_css_selectors(css_content) {
    const selectors = new Set();
    
    // extract class selectors
    const class_matches = css_content.match(/\.[a-zA-Z_][\w-]*/g);
    if (class_matches) {
      class_matches.forEach(match => selectors.add(match));
    }
    
    // extract id selectors
    const id_matches = css_content.match(/#[a-zA-Z_][\w-]*/g);
    if (id_matches) {
      id_matches.forEach(match => selectors.add(match));
    }
    
    return Array.from(selectors);
  }
  
  /**
   * extract selectors from javascript content
   */
  extract_js_selectors(js_content) {
    const selectors = new Set();
    
    // extract querySelector calls
    const query_matches = js_content.match(/querySelector\w*\s*\(\s*["']([^"']+)["']\s*\)/g);
    if (query_matches) {
      query_matches.forEach(match => {
        const selector = match.match(/["']([^"']+)["']/)[1];
        if (selector.startsWith('.') || selector.startsWith('#')) {
          selectors.add(selector);
        }
      });
    }
    
    // extract getElementById calls
    const get_by_id_matches = js_content.match(/getElementById\s*\(\s*["']([^"']+)["']\s*\)/g);
    if (get_by_id_matches) {
      get_by_id_matches.forEach(match => {
        const id = match.match(/["']([^"']+)["']/)[1];
        selectors.add(`#${id}`);
      });
    }
    
    // extract getElementsByClassName calls
    const get_by_class_matches = js_content.match(/getElementsByClassName\s*\(\s*["']([^"']+)["']\s*\)/g);
    if (get_by_class_matches) {
      get_by_class_matches.forEach(match => {
        const className = match.match(/["']([^"']+)["']/)[1];
        selectors.add(`.${className}`);
      });
    }
    
    return Array.from(selectors);
  }
  
  /**
   * extract all selectors from html, css, and js content
   */
  extract_selectors(html_content = '', css_content = '', js_content = '') {
    const html_selectors = this.extract_html_selectors(html_content);
    const css_selectors  = this.extract_css_selectors(css_content);
    const js_selectors   = this.extract_js_selectors(js_content);
    
    // combine and track usage
    const all_selectors = new Set([...html_selectors, ...css_selectors, ...js_selectors]);
    
    all_selectors.forEach(selector => {
      const usage = {
        html: html_selectors.includes(selector),
        css:  css_selectors.includes(selector),
        js:   js_selectors.includes(selector)
      };
      
      this.selectors.set(selector, {
        type:  selector.startsWith('#') ? 'id' : 'class',
        usage: usage,
        count: Object.values(usage).filter(Boolean).length
      });
    });
    
    return Array.from(all_selectors);
  }
  
  /**
   * get selector usage information
   */
  get_selector_info(selector) {
    return this.selectors.get(selector);
  }
  
  /**
   * get all tracked selectors
   */
  get_all_selectors() {
    return Array.from(this.selectors.keys());
  }
  
  /**
   * clear all tracked selectors
   */
  clear() {
    this.selectors.clear();
    this.mappings.clear();
  }
}

module.exports = { selector_oracle };