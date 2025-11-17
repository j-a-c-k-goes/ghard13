/**
 * obfuscator: core hex value generation and mapping logic
 * context: converts human-readable selectors to hexadecimal values
 * impact: provides anti-automation protection via selector obfuscation
 */

class obfuscator {
  constructor() {
    this.mappings         = new Map(); // original -> obfuscated
    this.reverse_mappings = new Map(); // obfuscated -> original
    this.used_values      = new Set(); // track generated hex values to avoid collisions
  }
  
  /**
   * generate random hexadecimal string of specified length
   */
  generate_hex_string(length = 12) {
    const chars = '0123456789abcdef';
    let result = '';
    
    // ensure first character is a letter (valid css/js identifier)
    result += 'abcdef'[Math.floor(Math.random() * 6)];
    
    // generate remaining characters
    for (let i = 1; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return result;
  }
  
  /**
   * generate unique hex value that hasn't been used
   */
  generate_unique_hex(length = 12) {
    let hex_value;
    let attempts = 0;
    const max_attempts = 100;
    
    do {
      hex_value = this.generate_hex_string(length);
      attempts++;
      
      if (attempts > max_attempts) {
        // increase length to reduce collision probability
        length += 2;
        attempts = 0;
      }
    } while (this.used_values.has(hex_value));
    
    this.used_values.add(hex_value);
    return hex_value;
  }
  
  /**
   * obfuscate single selector
   */
  obfuscate_selector(selector) {
    // check if already obfuscated
    if (this.mappings.has(selector)) {
      return this.mappings.get(selector);
    }
    
    const prefix = selector.charAt(0); // preserve . or # prefix
    const name   = selector.slice(1); // remove prefix
    
    // generate obfuscated name
    const obfuscated_name     = this.generate_unique_hex();
    const obfuscated_selector = prefix + obfuscated_name;
    
    // store mappings
    this.mappings.set(selector, obfuscated_selector);
    this.reverse_mappings.set(obfuscated_selector, selector);
    
    return obfuscated_selector;
  }
  
  /**
   * generate mappings for array of selectors
   */
  generate_mappings(selectors) {
    const mappings = {};
    
    selectors.forEach(selector => {
      mappings[selector] = this.obfuscate_selector(selector);
    });
    
    return mappings;
  }
  
  /**
   * get obfuscated value for selector
   */
  get_obfuscated(selector) {
    return this.mappings.get(selector);
  }
  
  /**
   * get original selector from obfuscated value
   */
  get_original(obfuscated_selector) {
    return this.reverse_mappings.get(obfuscated_selector);
  }
  
  /**
   * get all mappings
   */
  get_all_mappings() {
    return Object.fromEntries(this.mappings);
  }
  
  /**
   * check if selector is already obfuscated
   */
  is_obfuscated(selector) {
    return this.mappings.has(selector);
  }
  
  /**
   * clear all mappings and reset state
   */
  clear() {
    this.mappings.clear();
    this.reverse_mappings.clear();
    this.used_values.clear();
  }
  
  /**
   * get statistics about obfuscation
   */
  get_stats() {
    return {
      total_mappings:          this.mappings.size,
      unique_values_generated: this.used_values.size,
      collision_rate:          this.used_values.size > 0 ? 
        (this.used_values.size - this.mappings.size) / this.used_values.size : 0
    };
  }
}

module.exports = { obfuscator };